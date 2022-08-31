import csv
import os
import random
import re
from django.contrib.gis.geos import GEOSGeometry
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.helpers import clean
from api.oar_id import make_oar_id


# Taken from https://stackoverflow.com/a/312464
def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i: i + n]


class Command(BaseCommand):
    help = (
        'Take a downloaded facility CSV from OAR and make uploadable CSVs or '
        'SQL scripts. NOTE this has not been updated to use the new OS Hub '
        'CSV format.'
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

        def fix_characters(text):
            text = re.sub('\n', ' ', text)
            text = re.sub('\t', ' ', text)
            # Remove backslash characters so that they do not escape important
            # punctiation in the output files
            text = re.sub('\\\\', '', text)
            return text

        oar_ids = set()

        def new_oar_id(country_code):
            new_id = make_oar_id(country_code)
            while new_id in oar_ids:
                new_id = make_oar_id(country_code)
            oar_ids.add(new_id)
            return new_id

        with open(csv_file) as f:
            for row in csv.DictReader(f):
                try:
                    sector = row['sector']
                except KeyError:
                    sector = '{Apparel}'
                rows.append(
                    {
                        'oar_id': new_oar_id(row['country_code']),
                        'country': fix_characters(row['country_code']),
                        'name': fix_characters(row['name']),
                        'address': fix_characters(row['address']),
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
                new_row['oar_id'] = new_oar_id(new_row['country'])
                new_row['name'] = shuffle_words(new_row['name'])
                new_row['address'] = shuffle_words(new_row['address'])
                rows.append(new_row)

        random.shuffle(rows)

        if make_sql:
            now = timezone.now().isoformat()

            source_insert = (
                "INSERT INTO api_source "
                "(id, source_type, is_active, is_public, \"create\", "
                "created_at, updated_at, contributor_id) "
                "VALUES ({source_id}, 'SINGLE', 't', 't', 't', "
                "'{created_at}', '{updated_at}', {contributor_id});\n"
            )
            source_copy_header = (
                'COPY api_source '
                '(id, source_type, is_active, is_public, "create", '
                'created_at, updated_at, contributor_id) '
                'FROM stdin;\n'
            )
            source_copy = (
                '{source_id}\tSINGLE\tt\tt\tt\t{created_at}\t{updated_at}\t'
                '{contributor_id}\n'
            )

            # TODO Consider generating multiple line items that match to each
            # facility to more closely simulate real data
            list_item_insert = (
                "INSERT INTO api_facilitylistitem "
                "(id, row_index, raw_data, status, processing_results, name, "
                "address, country_code, geocoded_point, geocoded_address, "
                "created_at, updated_at, source_id, clean_address, "
                "clean_name, sector) "
                "VALUES ({source_id}, 0, '', 'MATCHED', '{{}}', '{name}', "
                "'{address}', '{country}', {location}, '{address}', "
                "'{created_at}', '{updated_at}', {source_id}, "
                "'{clean_address}', '{clean_name}', '{sector}');\n"
            )
            list_item_copy_header = (
                "COPY api_facilitylistitem "
                "(id, row_index, raw_data, status, processing_results, name, "
                "address, country_code, geocoded_point, geocoded_address, "
                "created_at, updated_at, source_id, clean_address, "
                "clean_name, sector) "
                "FROM stdin;\n"
            )
            list_item_copy = (
                '{source_id}\t0\t\tMATCHED\t{{}}\t{name}\t{address}\t'
                '{country}\t{hexewkb}\t{address}\t{created_at}\t{updated_at}\t'
                '{source_id}\t{clean_address}\t{clean_name}\t{sector}\n'
            )

            facility_insert = (
                "INSERT INTO api_facility "
                "(id, name, address, country_code, location, created_at, "
                "updated_at, created_from_id, has_inexact_coordinates) "
                "VALUES ('{oar_id}', '{name}', '{address}', '{country}', "
                "{location}, '{created_at}', '{updated_at}', "
                "{created_from_id}, '{has_inexact_coordinates}');\n")
            facility_copy_header = (
                "COPY api_facility "
                "(id, name, address, country_code, location, created_at, "
                "updated_at, created_from_id, has_inexact_coordinates) "
                "FROM stdin;\n")
            facility_copy = (
                '{oar_id}\t{name}\t{address}\t{country}\t{hexewkb}\t'
                '{created_at}\t{updated_at}\t{created_from_id}\t'
                '{has_inexact_coordinates}\n')

            match_insert = (
                "INSERT INTO api_facilitymatch "
                "(id, results, confidence, status, created_at, updated_at, "
                "facility_id, facility_list_item_id, is_active) "
                "VALUES ({match_id}, '{{}}', 98.76, 'AUTOMATIC', "
                "'{created_at}', '{updated_at}', '{oar_id}', "
                "{list_item_id}, 't');\n"
            )
            match_copy_header = (
                'COPY api_facilitymatch '
                '(id, results, confidence, status, created_at, updated_at, '
                'facility_id, facility_list_item_id, is_active) '
                'FROM stdin;\n'
            )
            match_copy = (
                '{match_id}\t{{}}\t98.76\tAUTOMATIC\t{created_at}\t'
                '{updated_at}\t{oar_id}\t{list_item_id}\tt\n'
            )

            update_query = (
                'UPDATE api_facilitylistitem '
                'SET facility_id = api_facility.id '
                'FROM api_facility '
                'WHERE api_facilitylistitem.id >= 100000000 '
                'AND created_from_id = api_facilitylistitem.id;\n'
            )

            def prepare(rows):
                idval = 100000000
                for row in rows:
                    new_row = row.copy()
                    for col in ('name', 'address'):
                        new_row[col] = new_row[col].replace("'", "''")
                    new_row['location'] = \
                        'ST_SetSRID(ST_POINT({lng}, {lat}),4326)' \
                        .format(**new_row)
                    new_row['hexewkb'] = \
                        GEOSGeometry('POINT ({lng} {lat})'.format(**new_row),
                                     srid=4326).hexewkb.decode('ascii')
                    new_row['created_at'] = now
                    new_row['updated_at'] = now
                    new_row['has_inexact_coordinates'] = 'f'
                    new_row['created_from_id'] = idval
                    new_row['list_item_id'] = idval
                    new_row['source_id'] = idval
                    new_row['match_id'] = idval
                    new_row['clean_address'] = clean(new_row['address'])
                    new_row['clean_name'] = clean(new_row['name'])
                    new_row['contributor_id'] = random.randrange(2, 99)
                    yield new_row
                    idval += 1

            s_c_file = os.path.join(out_dir, 'sources_copy.sql')
            i_c_file = os.path.join(out_dir, 'facilitylistitems_copy.sql')
            f_c_file = os.path.join(out_dir, 'facilities_copy.sql')
            m_c_file = os.path.join(out_dir, 'facilitymatches_copy.sql')
            u_file = os.path.join(out_dir, 'facility_to_item_update.sql')
            with open(f_c_file, 'w') as f_c, \
                 open(s_c_file, 'w') as s_c, \
                 open(i_c_file, 'w') as i_c, \
                 open(m_c_file, 'w') as m_c, \
                 open(u_file, 'w') as u:
                s_c.write(source_copy_header)
                i_c.write(list_item_copy_header)
                f_c.write(facility_copy_header)
                m_c.write(match_copy_header)
                u.write(update_query)
                for row in prepare(rows):
                    s_c.write(source_copy.format(**row))
                    i_c.write(list_item_copy.format(**row))
                    f_c.write(facility_copy.format(**row))
                    m_c.write(match_copy.format(**row))
                s_c.write('\\.\n')
                i_c.write('\\.\n')
                f_c.write('\\.\n')
                m_c.write('\\.\n')

            s_file = os.path.join(out_dir, 'sources.sql')
            i_file = os.path.join(out_dir, 'facilitylistitems.sql')
            f_file = os.path.join(out_dir, 'facilities.sql')
            m_file = os.path.join(out_dir, 'facilitymatches.sql')
            with open(f_file, 'w') as f, \
                 open(s_file, 'w') as s, \
                 open(i_file, 'w') as i, \
                 open(m_file, 'w') as m:
                for row in prepare(rows):
                    s.write(source_insert.format(**row))
                    i.write(list_item_insert.format(**row))
                    f.write(facility_insert.format(**row))
                    m.write(match_insert.format(**row))
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
