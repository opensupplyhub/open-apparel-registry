#!/usr/bin/env python

import csv
from pathlib import Path


out_dir = './extracted_lists'
csv_file = 'extracted_lists.csv'


def main():
    out_dir_path = Path(out_dir)
    out_dir_path.mkdir(parents=True, exist_ok=True)

    rows = []
    list_id = None
    contributor_id = None

    def write_rows_and_clear_row_list():
        nonlocal rows
        nonlocal list_id
        out_file_path = out_dir_path / f'{list_id}_{contributor_id}_{len(rows)}.csv'
        with open(out_file_path, 'w') as out_file:
            writer = csv.DictWriter(
                out_file, fieldnames=['country', 'name', 'address', 'lat', 'lng']
            )
            writer.writeheader()
            for row in rows:
                writer.writerow(row)
        rows = []

    with open(csv_file) as in_file:
        for row in csv.DictReader(in_file):
            if list_id is not None and row['list_id'] != list_id:
                write_rows_and_clear_row_list()
            list_id = row['list_id']
            contributor_id = row['contributor_id']
            rows.append(
                {
                    'country': row['country_code'],
                    'name': row['name'],
                    'address': row['address'],
                    'lat': row['lat'],
                    'lng': row['lng'],
                }
            )
        write_rows_and_clear_row_list()


if __name__ == '__main__':
    main()
