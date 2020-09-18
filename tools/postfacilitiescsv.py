#!/usr/bin/env python
import argparse
import csv
from datetime import datetime
import json
import os
import sys
import time

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
parser.add_argument('-d', '--debug',
                    help='Debug mode',
                    action='store_true',
                    default=False)
parser.add_argument('-p', '--pause',
                    type=int,
                    help='Number of milliseconds to pause between requests',
                    default=0)
parser.add_argument('-s', '--stop',
                    type=int,
                    help='Stop after the specified number of lines',
                    default=0)

args = parser.parse_args()

URL = '{}/api/facilities/?create=false&textonlyfallback=true'.format(args.rooturl);

if args.debug:
    print('url', URL)

with open(args.csv, 'r') as f:
    reader = csv.DictReader(f)
    count = 0
    for row in reader:
        data = {
            'name': row['name'],
            'address': row['address'],
            'country': row['country_name'] if 'country_name' in row else row['country'],
        }
        if args.debug:
            print(json.dumps(data))
        try:
            started = datetime.utcnow()
            response = requests.post(URL, json=data, headers={
                'Authorization': 'Token {}'.format(args.token),
                'User-Agent': 'postfacilitiescsv',
            })
            if args.debug:
                duration = (datetime.utcnow() - started)
                print('Duration:', duration)
            if response.status_code != 200 or args.debug:
                if not args.debug:
                    print(json.dumps(data))
                print('Status:', response.status_code, 'Content:', response.content)
        except Exception as e:
            if not args.debug:
                print(json.dumps(data))
            print(e)

        count += 1
        if args.stop > 0 and count >= args.stop:
            break;

        if args.pause > 0:
            time.sleep(args.pause / 1000)
