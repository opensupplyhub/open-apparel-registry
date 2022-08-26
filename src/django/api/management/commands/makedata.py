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
    help = (
        'Take a downloaded facility CSV from OAR and make uploadable CSVs or '
        'SQL scripts. NOTE this has not been updated to use the new OS Hub CSV '
        'format.'
    )

    def add_arguments(self, parser):
        parser.add_argument('csvfile',
                            help='Path to a CSV downloaded from OAR')

        parser.add_argument(
            '-f',
            '--filecount',
            type=int,
            help='For CSV output, the total number of files to create',
            default=1,
        )

        parser.add_argument(
            '-r',
            '--rowcount',
            type=int,
            help='The total number of facilities to create',
            default=1,
        )

        parser.add_argument(
            '-o',
            '--outdir',
            help='The existing directory into which files should be written',
            default='./',
        )

        parser.add_argument(
            '-s',
            '--sql',
            help='Generate SQL scripts',
            action='store_true',
            default=False
        )

    def handle(self, *args, **options):
        csv_file = options['csvfile']
        file_count = options['filecount']
        row_count = options['rowcount']
        out_dir = options['outdir']
        output_sql = options['sql']

        if output_sql:
            raise Exception('NOT YET IMPLEMENTED')

        random.seed(8675309)

        rows = []

        def clean(text):
            return text.replace('\n', '')

        with open(csv_file) as f:
            for row in csv.DictReader(f):
                try:
                    sector = row['sector']
                except KeyError:
                    sector = 'Apparel'
                rows.append(
                    {
                        'country': clean(row['country_code']),
                        'name': clean(row['name']),
                        'address': clean(row['address']),
                        'sector': sector,
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
