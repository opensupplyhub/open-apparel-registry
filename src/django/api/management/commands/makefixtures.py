from django.core.management.base import (BaseCommand,
                                         CommandError)

from api.models import Organization, FacilityMatch, FacilityListItem

import csv
import json
import os
import random
import pytz
from faker import Faker
fake = Faker()
utc = pytz.utc

COUNTRY_CODES = {
    'ARGENTINA': 'AR',
    'AUSTRALIA': 'AU',
    'BANGLADESH': 'BD',
    'BRAZIL': 'BR',
    'CAMBODIA': 'KH',
    'CANADA': 'CA',
    'COLOMBIA': 'CO',
    'CHINA': 'CN',
    'DOMINICAN REPUBLIC': '',
    'EL SALVADOR': 'SV',
    'FRANCE': 'FR',
    'GERMANY': 'DE',
    'GUATEMALA': 'GT',
    'HAITI': 'HT',
    'HONDURAS': 'HN',
    'INDIA': 'IN',
    'INDONESIA': 'ID',
    'ISRAEL': 'IL',
    'ITALY': 'IT',
    'JORDAN': 'JO',
    'MALAYSIA': 'MY',
    'MAURITIUS': 'MU',
    'MEXICO': 'MX',
    'MOROCCO': 'MA',
    'MYANMAR': 'MM',
    'NEPAL': 'NP',
    'NEW ZEALAND': 'NZ',
    'NICARAGUA': 'NI',
    'PERU': 'PE',
    'PHILIPPINES': 'PH',
    'PORTUGAL': 'PT',
    'PUERTO RICO': 'PR',
    'ROMANIA': 'RO',
    'SLOVAK REPUBLIC': 'SK',
    'SOUTH AFRICA': 'ZA',
    'SRI LANKA': 'LK',
    'TAIWAN': 'TW',
    'THAILAND': 'TH',
    'TURKEY': 'TR',
    'UAE': 'AE',
    'UNITED STATES': 'US',
    'US': 'US',
    'USA': 'US',
    'VIETNAM': 'VN',
}


def make_created_updated():
    created = fake.date_time_between(
        start_date='-9d', end_date='now', tzinfo=utc).isoformat()
    updated = fake.date_time_between(
        start_date='-1m', end_date='-10d', tzinfo=utc).isoformat()
    return (created, updated)


def make_point():
    lat = -1 * float(random.randrange(75010000, 75019000))/1000000
    lng = float(random.randrange(40000000, 40000900))/1000000
    return 'SRID=4326;POINT (%f %f)' % (lat, lng)


def make_bool(override=None):
    if override is not None:
        return override
    else:
        return random.randint(0, 1) == 1


def make_user(pk, email=None, is_superuser=None, is_staff=None):
    password = ('pbkdf2_sha256$100000$AhShrfanKLuW$EQ7qM7QxlaMPBperDoFgESqm4h'
                'Q5EdwigJ9ks5HWD3o=')
    (created_at, updated_at) = make_created_updated()
    profile = fake.profile()
    if email is not None:
        profile['mail'] = email
    return {
        'model': 'api.user',
        'pk': pk,
        'fields': {
            'password': password,
            'last_login': updated_at,
            'is_superuser': make_bool(is_superuser),
            'email': profile['mail'],
            'is_staff': make_bool(is_staff),
            'is_active': True,
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_users(count=100):
    admins = [make_user(1, email='admin@openapparel.org',
                        is_superuser=True, is_staff=True)]
    users = [make_user(pk, is_superuser=False) for pk in range(2, count+1)]
    return admins + users


def make_org_type():
    random_index = random.randint(0, len(Organization.ORG_TYPE_CHOICES)-1)
    return Organization.ORG_TYPE_CHOICES[random_index][0]


def make_other_org_type():
    return fake.company_suffix()


def make_organization(pk, admin_pk=None):
    (created_at, updated_at) = make_created_updated()
    if admin_pk is not None:
        admin = admin_pk
    else:
        admin = pk
        org_type = make_org_type()

        if org_type == Organization.OTHER_ORG_TYPE:
            other_org_type = make_other_org_type()
        else:
            other_org_type = None

    return {
        'model': 'api.organization',
        'pk': pk,
        'fields': {
            'admin': admin,
            'name': fake.company(),
            'description': fake.text(),
            'website': fake.url(),
            'org_type': org_type,
            'other_org_type': other_org_type,
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_organizations(max_id=99):
    return [make_organization(pk) for pk in range(2, max_id+1)]


def make_facility_list(pk, organization_pk=None):
    (created_at, updated_at) = make_created_updated()
    if organization_pk is not None:
        organization = organization_pk
    else:
        organization = pk
    name = fake.name()
    return {
        'model': 'api.facilitylist',
        'pk': pk,
        'fields': {
            'organization': organization,
            'name': name,
            'file_name': name + '.csv',
            'header': 'country,name,address',
            'is_active': make_bool(),
            'is_public': make_bool(),
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_facility_lists(max_id=14):
    return [make_facility_list(pk) for pk in range(2, max_id+1)]


def make_facility_list_item(list_pk, item_pk, row_index, raw_data):
    (created_at, updated_at) = make_created_updated()
    return {
        'model': 'api.facilitylistitem',
        'pk': item_pk,
        'fields': {
            'facility_list': list_pk,
            'row_index': row_index,
            'raw_data': raw_data,
            'status': 'UPLOADED',
            'processing_results': [],
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_facility_list_items(max_list_pk=14):
    item_pk = 1
    items = []
    for list_pk in range(2, max_list_pk+1):
        filename = '{0}.csv'.format(list_pk)
        directory = os.path.dirname(os.path.realpath(__file__))
        with open(os.path.join(directory,
                               'facility_lists',
                               filename), 'r') as f:
            f.readline()  # discard header
            for row_index, line in enumerate(f):
                items.append(make_facility_list_item(list_pk,
                                                     item_pk,
                                                     row_index,
                                                     line.rstrip()))
                item_pk += 1
    return items


def make_facility(facility_item):
    (created_at, updated_at) = make_created_updated()
    fields = facility_item['fields']
    # A workaround to have the CSV parser work on a single row
    for row in csv.reader([fields['raw_data']]):
        parsed = row
    return {
        'model': 'api.facility',
        'pk': facility_item['pk'],
        'fields': {
            'name': parsed[1],
            'address': parsed[2],
            'country_code': COUNTRY_CODES[parsed[0].upper()],
            'location': make_point(),
            'created_from': facility_item['pk'],
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_match(item, facility):
    (created_at, updated_at) = make_created_updated()
    item['fields']['status'] = FacilityListItem.MATCHED
    return {
        'model': 'api.facilitymatch',
        'pk': item['pk'],
        'fields': {
            'facility_list_item': item['pk'],
            'facility': facility['pk'],
            'results': {
                'match_version': 0,
                'match_method': 'random',
            },
            'confidence': 0.1,
            'status': FacilityMatch.PENDING,
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_facilities_and_matches(list_items):
    facilities = []
    matches = []
    for item in list_items:
        if random.randint(1, 10) < 6:
            facility = make_facility(item)
            facilities.append(facility)
            matches.append(make_match(item, facility))
    return facilities, matches


class Command(BaseCommand):
    help = 'Create random but reasonable data fixtures'

    def handle(self, *args, **options):
        try:
            list_items = make_facility_list_items()
            facilities, matches = make_facilities_and_matches(list_items)
            with open('/usr/local/src/api/fixtures/users.json', 'w') as f:
                json.dump(make_users(), f, separators=(',', ': '),
                          indent=4)
            with open('/usr/local/src/api/fixtures/organizations.json',
                      'w') as f:
                json.dump(make_organizations(), f, separators=(',', ': '),
                          indent=4)
            with open('/usr/local/src/api/fixtures/facility_lists.json',
                      'w') as f:
                json.dump(make_facility_lists(), f, separators=(',', ': '),
                          indent=4)
            with open('/usr/local/src/api/fixtures/facility_list_items.json',
                      'w') as f:
                json.dump(list_items, f, separators=(',', ': '), indent=4)
            with open('/usr/local/src/api/fixtures/facilities.json',
                      'w') as f:
                json.dump(facilities, f, separators=(',', ': '), indent=4)
            with open('/usr/local/src/api/fixtures/facility_matches.json',
                      'w') as f:
                json.dump(matches, f, separators=(',', ': '), indent=4)

        except CommandError as e:
            self.stderr.write("Error creating fixtures: {}".format(e))
