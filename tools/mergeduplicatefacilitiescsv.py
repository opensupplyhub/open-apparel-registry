#!/usr/bin/env python
import argparse
import traceback
import csv
import os

import requests

parser = argparse.ArgumentParser(
    description='Read facility data from a CSV and POST each line to the matching API')
parser.add_argument('csv', help='Path to a CSV with name, address, and country_name/country columns')

# Default is the development URL
parser.add_argument('-r', '--rooturl',
                    help='The protocol, host, and port to POST to',
                    default=os.environ.get('ROOTURL', 'http://localhost:6543'))
# Default is the development token created by resetdb
parser.add_argument('-t', '--token',
                    help='The API token',
                    default=os.environ.get('TOKEN', '1d18b962d6f976b0b7e8fcf9fcc39b56cf278051'))

args = parser.parse_args()

with open(args.csv, 'r') as f:
    reader = csv.DictReader(f)
    clusters = {}
    for row in reader:
        # rows with matching cluster_ids should be merged together
        clusters[row['cluster_id']] = clusters.get(row['cluster_id'], []) + [row['os_id']]

    for cluster in clusters.values():
        # the first item in a cluster is the target facility
        target_id = cluster[0]
        for i in range(1, len(cluster)):
            # all other facilities in the cluster should be merged into the target
            os_id = cluster[i]
            URL = '{}/api/facilities/merge/?target={}&merge={}'.format(args.rooturl, target_id, os_id);
            try:
                response = requests.post(URL, headers={
                    'Authorization': 'Token {}'.format(args.token),
                    'User-Agent': 'postfacilitiescsv',
                })

                if response.status_code != 200:
                    print('Status:', response.status_code, 'Content:', response.content,
                          'Target ID:', target_id, 'Merge ID:', os_id)

            except Exception as e:
                print(e)
                print("Target ID: " + target_id)
                print(traceback.format_exc())
