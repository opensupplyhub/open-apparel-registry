#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Modified version of
https://github.com/dedupeio/dedupe-examples/blob/b88d222dc95e3e8af4c23025f1d3268cb771e9fa/csv_example/csv_example.py
"""
from future.builtins import next

import os
import csv
import re
import logging
import optparse

import dedupe
from unidecode import unidecode

# ## Logging

# Dedupe uses Python logging to show or suppress verbose output. This
# code block lets you change the level of loggin on the command
# line. You don't need it if you don't want that. To enable verbose
# logging, run `python examples/csv_example/csv_example.py -v`
optp = optparse.OptionParser()
optp.add_option('-v', '--verbose', dest='verbose', action='count',
                help='Increase verbosity (specify multiple times for more)'
                )
(opts, args) = optp.parse_args()
log_level = logging.WARNING
if opts.verbose:
    if opts.verbose == 1:
        log_level = logging.INFO
    elif opts.verbose >= 2:
        log_level = logging.DEBUG
logging.getLogger().setLevel(log_level)

# ## Setup

input_file = 'facility_list_items.csv'
output_file = 'facilities_output.csv'
dedupe_output = 'facilities_deduped.csv'
settings_file = 'facilities_learned_settings'
training_file = 'facilities_training.json'

def preProcess(column):
    """
    Do a little bit of data cleaning with the help of Unidecode and Regex.
    Things like casing, extra spaces, quotes and new lines can be ignored.
    """
    try : # python 2/3 string differences
        column = column.decode('utf8')
    except AttributeError:
        pass
    column = unidecode(column)
    column = re.sub('  +', ' ', column)
    column = re.sub('\n', ' ', column)
    column = column.strip().strip('"').strip("'").lower().strip()
    # If data is missing, indicate that by setting the value to `None`
    if not column:
        column = None
    return column

def readData(filename):
    """
    Read in our data from a CSV file and create a dictionary of records,
    where the key is a unique record ID and each value is dict
    """

    data_d = {}
    raw_data_d = {}
    with open(filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            clean_row = [(k, preProcess(v)) for (k, v) in row.items()]
            row_id = int(row['id'])
            data_d[row_id] = dict(clean_row)
            raw_data_d[row_id] = row

    return data_d, raw_data_d

print('importing data ...')
data_d, raw_data_d = readData(input_file)

# If a settings file already exists, we'll just load that and skip training
if os.path.exists(settings_file):
    print('reading from', settings_file)
    with open(settings_file, 'rb') as f:
        deduper = dedupe.StaticDedupe(f)
else:
    # ## Training

    # Define the fields dedupe will pay attention to
    fields = [
        {'field': 'country', 'type': 'String'},
        {'field': 'name', 'type': 'String'},
        {'field': 'address', 'type': 'String'},
    ]

    # Create a new deduper object and pass our data model to it.
    deduper = dedupe.Dedupe(fields)

    # To train dedupe, we feed it a sample of records.
    deduper.sample(data_d, 15000)

    # If we have training data saved from a previous run of dedupe,
    # look for it and load it in.
    # __Note:__ if you want to train from scratch, delete the training_file
    if os.path.exists(training_file):
        print('reading labeled examples from ', training_file)
        with open(training_file, 'rb') as f:
            deduper.readTraining(f)

    # ## Active learning
    # Dedupe will find the next pair of records
    # it is least certain about and ask you to label them as duplicates
    # or not.
    # use 'y', 'n' and 'u' keys to flag duplicates
    # press 'f' when you are finished
    print('starting active labeling...')

    dedupe.consoleLabel(deduper)

    # Using the examples we just labeled, train the deduper and learn
    # blocking predicates
    deduper.train()

    # When finished, save our training to disk
    with open(training_file, 'w') as tf:
        deduper.writeTraining(tf)

    # Save our weights and predicates to disk.  If the settings file
    # exists, we will skip all the training and learning next time we run
    # this file.
    with open(settings_file, 'wb') as sf:
        deduper.writeSettings(sf)

# Find the threshold that will maximize a weighted average of our
# precision and recall.  When we set the recall weight to 2, we are
# saying we care twice as much about recall as we do precision.
#
# If we had more data, we would not pass in all the blocked data into
# this function but a representative sample.

threshold = deduper.threshold(data_d, recall_weight=1)

# ## Clustering

# `match` will return sets of record IDs that dedupe
# believes are all referring to the same entity.

print('clustering...')
clustered_dupes = deduper.match(data_d, threshold)

print('# duplicate sets', len(clustered_dupes))

# ## Writing Results

# Write our original data back out to a CSV with a new column called
# 'Cluster ID' which indicates which records refer to each other.
# import ipdb; ipdb.set_trace()
cluster_membership = {}
cluster_id = 0
for (cluster_id, cluster) in enumerate(clustered_dupes):
    id_set, scores = cluster
    cluster_d = [data_d[c] for c in id_set]
    canonical_rep = dedupe.canonicalize(cluster_d)
    for record_id, score in zip(id_set, scores):
        cluster_membership[record_id] = {
            "cluster id" : cluster_id,
            "canonical representation" : canonical_rep,
            "confidence": score
        }

singleton_id = cluster_id + 1

with open(output_file, 'w') as f_output, open(input_file) as f_input:
    writer = csv.writer(f_output)
    reader = csv.reader(f_input)

    heading_row = next(reader)
    heading_row.insert(0, 'confidence_score')
    heading_row.insert(0, 'Cluster ID')
    canonical_keys = canonical_rep.keys()
    for key in canonical_keys:
        heading_row.append('canonical_' + key)

    writer.writerow(heading_row)

    for row in reader:
        row_id = int(row[0])
        if row_id in cluster_membership:
            cluster_id = cluster_membership[row_id]["cluster id"]
            canonical_rep = cluster_membership[row_id]["canonical representation"]
            row.insert(0, cluster_membership[row_id]['confidence'])
            row.insert(0, cluster_id)
            for key in canonical_keys:
                row.append(canonical_rep[key].encode('utf8'))
        else:
            row.insert(0, None)
            row.insert(0, singleton_id)
            singleton_id += 1
            for key in canonical_keys:
                row.append(None)
        writer.writerow(row)

def choose_one_from_cluster(row_ids):
    chosen = None
    for row_id in row_ids:
        if chosen is None or not raw_data_d[row_id]['address'].isupper():
            chosen = raw_data_d[row_id]
    return chosen

with open(dedupe_output, 'w') as f_output:
    # import ipdb; ipdb.set_trace()
    fieldnames = ['id', 'country', 'name', 'address']
    writer = csv.DictWriter(f_output, fieldnames=fieldnames)
    writer.writeheader()

    def write_row(row):
        writer.writerow({k: row[k] for k in fieldnames})

    clustered_ids = set()
    for row_ids, scores in clustered_dupes:
        if max(scores) >= 0.1:
            write_row(choose_one_from_cluster(row_ids))
            clustered_ids.update(row_ids)
        else:
            for row_id in row_ids:
                write_row(raw_data_d[row_id])

    for row_id, data in raw_data_d.items():
        if row_id not in clustered_ids:
            write_row(data)
