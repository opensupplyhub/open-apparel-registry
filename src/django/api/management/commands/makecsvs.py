import csv
import os
import random
from django.core.management.base import BaseCommand


# Taken from https://stackoverflow.com/a/312464
def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i: i + n]


class Command(BaseCommand):
    help = 'Take a downloaded facility CSV and make uploadable CSVs'

    def add_arguments(self, parser):
        parser.add_argument('csvfile',
                            help='Path to a CSV downloaded from OAR')

        parser.add_argument(
            '-f',
            '--filecount',
            type=int,
            help='The total number of files to create',
            default=1,
        )

        parser.add_argument(
            '-r',
            '--rowcount',
            type=int,
            help='The total number of rows to create',
            default=1,
        )

        parser.add_argument(
            '-o',
            '--outdir',
            help='The existing directory into which files should be written',
            default='./',
        )

    def handle(self, *args, **options):
        csv_file = options['csvfile']
        file_count = options['filecount']
        row_count = options['rowcount']
        out_dir = options['outdir']

        random.seed(8675309)

        rows = []
        with open(csv_file) as f:
            for row in csv.DictReader(f):
                rows.append(
                    {
                        'country': row['country_code'],
                        'name': row['name'],
                        'address': row['address'],
                        'sector': row['sector'],
                        'lat': row['lat'],
                        'lng': row['lng'],
                    }
                )

        if row_count > len(rows):

            def shuffle_words(text):
                segments = text.split(' ')
                return ' '.join(random.sample(segments, len(segments))).strip()

            max_file_row = len(rows) - 1
            for _ in range(len(rows), row_count):
                new_row = rows[random.randint(0, max_file_row)].copy()
                new_row['name'] = shuffle_words(new_row['name'])
                new_row['address'] = shuffle_words(new_row['address'])
                rows.append(new_row)

        random.shuffle(rows)

        chunk_size = len(rows) // file_count
        for i, chunk in enumerate(chunks(rows, chunk_size)):
            out_file = os.path.join(out_dir, '{}.csv'.format(i + 1))
            with open(out_file, 'w') as f:
                writer = csv.DictWriter(
                    f, fieldnames=['country', 'name', 'address', 'sector',
                                   'lat', 'lng']
                )
                writer.writeheader()
                for row in chunk:
                    writer.writerow(row)
