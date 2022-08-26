import csv
import os
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.oar_id import make_oar_id


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
        make_sql = options['sql']

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
                        'oar_id': make_oar_id(row['country_code']),
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
                new_row['oar_id'] = make_oar_id(new_row['country_code'])
                new_row['name'] = shuffle_words(new_row['name'])
                new_row['address'] = shuffle_words(new_row['address'])
                rows.append(new_row)

        random.shuffle(rows)

        if make_sql:
            # TODO: Use COPY rather than INSERT
            now = timezone.now().isoformat()
            facility_insert = (
                "INSERT INTO api_facility "
                "(id, name, address, country_code, location, created_at, updated_at, created_from_id, has_inexact_coordinates) "
                "VALUES ('{oar_id}', '{name}', '{address}', '{country}', {location}, '{created_at}', '{updated_at}', {created_from_id}, '{has_inexact_coordinates}')\n")
            def prepare(rows):
                for row in rows:
                    new_row = row.copy()
                    for col in ('name', 'address'):
                        new_row[col] = new_row[col].replace("'", "''")
                    new_row['location'] = 'ST_SetSRID(ST_POINT({lng}, {lat}),4326)'.format(**new_row)
                    new_row['created_at'] = now
                    new_row['updated_at'] = now
                    new_row['has_inexact_coordinates'] = 'f'
                    # TODO FIX LIST ITEM ID GENERATION
                    new_row['created_from_id'] = '1'
                    yield new_row
            inserts = [facility_insert.format(**row) for row in prepare(rows)]
            out_file = os.path.join(out_dir, 'facilities.sql')
            with open(out_file, 'w') as f:
                f.writelines(inserts)
            return

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
