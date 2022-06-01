import csv
import os

from django.core.management.base import (BaseCommand)

from api.geocoding import geocode_address


class Command(BaseCommand):
    help = 'Batch geocode facility list CSVs'

    def handle(self, *args, **options):
        directory = os.path.dirname(os.path.realpath(__file__))
        outdir = os.path.join(directory, 'facility_lists', 'geocoded')
        os.makedirs(outdir, exist_ok=True)

        for list_pk in range(2, 16):
            filename = '{0}.csv'.format(list_pk)
            in_path = os.path.join(directory, 'facility_lists', filename)
            print('Reading {0}'.format(in_path))
            rows = []
            with open(in_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        result = geocode_address(row['address'],
                                                 row['country'],
                                                 validate_country=False)
                        if result \
                           and 'geocoded_point' in result \
                           and result['geocoded_point'] is not None:
                            row['lat'] = result['geocoded_point']['lat']
                            row['lng'] = result['geocoded_point']['lng']
                            rows.append(row)
                    except ValueError:
                        pass
            out_path = os.path.join(outdir, filename)
            print('Writing {0}'.format(out_path))
            with open(out_path, 'w') as output:
                writer = csv.DictWriter(output, fieldnames=[
                    'country', 'name', 'address', 'sector', 'lat', 'lng'])
                writer.writeheader()
                for row in rows:
                    writer.writerow(row)
