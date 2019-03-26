#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
This code demonstrates the Gazetteer.

We will use one of the sample files from the RecordLink example as the
canonical set.

"""
from __future__ import print_function

import sys
import os
import csv
import re
import logging
import optparse
import random
import collections

import dedupe
from unidecode import unidecode

# ## Logging

# dedupe uses Python logging to show or suppress verbose output. Added
# for convenience.  To enable verbose logging, run `python
# examples/csv_example/csv_example.py -v`
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

output_file = 'gazetteer_pass_2_output.csv'
settings_file = 'gazetteer_learned_settings'
training_file = 'gazetteer_training.json'
canonical_file = '../dedupe/facilities_deduped.csv'
messy_file = 'gazetteer_messy_pass_2.csv'

def preProcess(column):
    """
    Do a little bit of data cleaning with the help of Unidecode and Regex.
    Things like casing, extra spaces, quotes and new lines can be ignored.
    """

    column = unidecode(column)
    column = re.sub('\n', ' ', column)
    column = re.sub('-', '', column)
    column = re.sub('/', ' ', column)
    column = re.sub("'", '', column)
    column = re.sub(",", '', column)
    column = re.sub(":", ' ', column)
    column = re.sub(' +', ' ', column)
    column = column.strip().strip('"').strip("'").lower().strip()
    if not column:
        column = None
    return column


def readData(filename):
    """
    Read in our data from a CSV file and create a dictionary of records,
    where the key is a unique record ID.
    """

    data_d = {}

    with open(filename) as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            clean_row = dict([(k, preProcess(v)) for (k, v) in row.items()])
            data_d[filename + str(i)] = dict(clean_row)

    return data_d


print('importing data ...')
messy = readData(messy_file)
print('N data 1 records: {}'.format(len(messy)))

canonical = readData(canonical_file)
print('N data 2 records: {}'.format(len(canonical)))


if not os.path.exists(settings_file):
    print('ERROR: could not load settings file {0}'.format(settings_file))
    sys.exit(1)

print('reading from', settings_file)
with open(settings_file, 'rb') as sf:
    gazetteer = dedupe.StaticGazetteer(sf)

gazetteer.index(canonical)
# Calc threshold
print('Start calculating threshold')
threshold = gazetteer.threshold(messy, recall_weight=1.0)
print('Threshold: {}'.format(threshold))

results = gazetteer.match(messy, threshold=threshold, n_matches=2, generator=True)

messy_matches = collections.defaultdict(dict)
for matches in results:
    for (messy_id, canon_id), score in matches:
        messy_matches[messy_id][canon_id] = score

link_ids = {}
link_id = 0
for canon_ids in messy_matches.values():
    for canon_id in canon_ids:
        if canon_id not in link_ids:
            link_ids[canon_id] = link_id
            link_id += 1

with open(output_file, 'w') as f:
    writer = csv.writer(f)

    with open(canonical_file) as f_input :
        reader = csv.reader(f_input)

        heading_row = next(reader)
        additional_columns = ['source file', 'Link Score',
                              'Link ID', 'record id']
        heading_row = additional_columns + heading_row
        writer.writerow(heading_row)

        for row_id, row in enumerate(reader):
            record_id = canonical_file + str(row_id)
            link_id = link_ids.get(record_id)
            row = [canonical_file, None, link_id, record_id] + row

            writer.writerow(row)

        last_row_id = row_id

    with open(messy_file) as f_input:
        reader = csv.reader(f_input)
        next(reader)

        for row_id, row in enumerate(reader):
            record_id = messy_file + str(row_id)
            matches = messy_matches.get(record_id)

            if not matches:
                no_match_row = [messy_file, None, None, record_id] + row
                writer.writerow(no_match_row)
            else:
                for canon_id, score in matches.items():
                    link_id = link_ids[canon_id]
                    link_row = [messy_file, score, link_id, record_id] + row
                    writer.writerow(link_row)
