from django.core.management.base import (BaseCommand,
                                         CommandError)

from api.models import Contributor, FacilityMatch, FacilityListItem, Source
from api.oar_id import make_oar_id

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
    'DOMINICAN REPUBLIC': 'DO',
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


def make_point(fixed=False):
    if fixed:
        return 'SRID=4326;POINT (0 0)'

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
            'email': 'c{0}@example.com'.format(pk),
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


def make_contrib_type():
    # We subtract 2 so that the last type is unassigned, which more closely
    # resembles the real world case of not having contributors for every type.
    random_index = random.randint(0, len(Contributor.CONTRIB_TYPE_CHOICES)-2)
    return Contributor.CONTRIB_TYPE_CHOICES[random_index][0]


def make_other_contrib_type():
    return fake.company_suffix()


def base_10_to_alphabet(number):
    """
    Convert a decimal number to its base alphabet representation
    Based on
    https://codereview.stackexchange.com/questions/182733/base-26-letters-and-base-10-using-recursion
    """
    a_uppercase = ord('A')
    alphabet_size = 26

    def _decompose(number):
        while number:
            number, remainder = divmod(number - 1, alphabet_size)
            yield remainder

    return ''.join(
            chr(a_uppercase + part)
            for part in _decompose(number)
    )[::-1]


contributor_numbers = {c: 1 for c, _ in Contributor.CONTRIB_TYPE_CHOICES}


def make_contributor_name(contrib_type):
    num = contributor_numbers[contrib_type]
    base = contrib_type.split('/')[0].rstrip()
    name = '{0} {1}'.format(base, base_10_to_alphabet(num))
    contributor_numbers[contrib_type] = num + 1
    return name


def make_contributor_description(contrib_type):
    name = make_contributor_name(contrib_type)
    if name[0].lower() == 'a':
        prefix = 'An'
    else:
        prefix = 'A'
    title = '{0} {1}'.format(prefix, contrib_type.lower())
    return '{0} dedicated to transparency in apparel supply chains'.format(
       title)


def make_contributor(pk, admin_pk=None):
    (created_at, updated_at) = make_created_updated()
    if admin_pk is not None:
        admin = admin_pk
    else:
        admin = pk
        contrib_type = make_contrib_type()

        if contrib_type == Contributor.OTHER_CONTRIB_TYPE:
            other_contrib_type = make_other_contrib_type()
        else:
            other_contrib_type = None

    return {
        'model': 'api.contributor',
        'pk': pk,
        'fields': {
            'admin': admin,
            'name': make_contributor_name(contrib_type),
            'description': make_contributor_description(contrib_type),
            'website': 'https://info.openapparel.org',
            'contrib_type': contrib_type,
            'other_contrib_type': other_contrib_type,
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_contributors(max_id=99):
    return [make_contributor(pk) for pk in range(2, max_id+1)]


def make_facility_list_name():
    seasons = ('Spring', 'Summer', 'Fall', 'Winter')
    years = ('2017', '2018', '2019')
    options = ('Apparel', 'Affiliate', 'Compliance')
    return '{0} {1} {2} List'.format(random.choice(seasons),
                                     random.choice(years),
                                     random.choice(options))


def make_facility_list_description(pk, name):
    description = (
        'This is the detailed description of the list named {}. Descriptions '
        'can be pretty long. This one is not that long, but it is long enough '
        'so that when designing an interface to display the description we '
        'will be sure to leave enough space.'
    )
    if pk % 2 == 0:
        return description.format(name)
    else:
        return None


def make_facility_list(pk):
    (created_at, updated_at) = make_created_updated()
    name = make_facility_list_name()
    description = make_facility_list_description(pk, name)
    return {
        'model': 'api.facilitylist',
        'pk': pk,
        'fields': {
            'name': name,
            'description': description,
            'file_name': name + '.csv',
            'header': 'country,name,address,sector,lat,lng',
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_facility_lists(max_id=15):
    return [make_facility_list(pk) for pk in range(2, max_id+1)]


def make_source(pk, contributor_pk=None, facility_list_pk=None):
    (created_at, updated_at) = make_created_updated()
    if contributor_pk is not None:
        contributor = contributor_pk
    else:
        contributor = pk

    if facility_list_pk is not None:
        facility_list = facility_list_pk
    else:
        facility_list = pk

    return {
        'model': 'api.source',
        'pk': pk,
        'fields': {
            'source_type': Source.LIST,
            'facility_list': facility_list,
            'contributor': contributor,
            'is_active': True,
            'is_public': True,
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_sources(max_id=15):
    return [make_source(pk) for pk in range(2, max_id+1)]


def make_facility_list_item(source_pk, item_pk, row_index, raw_data):
    (created_at, updated_at) = make_created_updated()

    return {
        'model': 'api.facilitylistitem',
        'pk': item_pk,
        'fields': {
            'source': source_pk,
            'row_index': row_index,
            'raw_data': raw_data,
            'status': 'UPLOADED',
            'processing_results': [],
            'sector': [],
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_facility_list_items(max_list_pk=15):
    item_pk = 1
    items = []
    for list_pk in range(2, max_list_pk+1):
        source_pk = list_pk
        filename = '{0}.csv'.format(list_pk)
        directory = os.path.dirname(os.path.realpath(__file__))
        with open(os.path.join(directory,
                               'facility_lists',
                               'geocoded',
                               filename), 'r') as f:
            f.readline()  # discard header
            for row_index, line in enumerate(f):
                items.append(make_facility_list_item(source_pk,
                                                     item_pk,
                                                     row_index,
                                                     line.rstrip()))
                item_pk += 1
    return items


def point_wkt(lat, lng):
    return 'SRID=4326;POINT (%s %s)' % (lat, lng)


def make_facility(facility_item):
    (created_at, updated_at) = make_created_updated()
    fields = facility_item['fields']
    # A workaround to have the CSV parser work on a single row
    for row in csv.reader([fields['raw_data']]):
        parsed = row

    country_code = COUNTRY_CODES[parsed[0].upper()]
    pk = make_oar_id(country_code)

    return {
        'model': 'api.facility',
        'pk': pk,
        'fields': {
            'name': parsed[1],
            'address': parsed[2],
            'country_code': country_code,
            'location': point_wkt(parsed[4], parsed[3]),
            'created_from': facility_item['pk'],
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_match(item, facility):
    (created_at, updated_at) = make_created_updated()
    item['fields']['status'] = FacilityListItem.MATCHED

    status = FacilityMatch.PENDING
    if item['pk'] % 3 == 0:
        item['fields']['status'] = FacilityListItem.CONFIRMED_MATCH
        item['fields']['address'] = "{} {}".format(fake.hexify(text="^^^^",
                                                               upper=False),
                                                   fake.street_name())
        item['fields']['name'] = "{} {}".format(fake.company(),
                                                fake.company_suffix())
        status = FacilityMatch.AUTOMATIC

    elif item['pk'] % 5 == 0:
        item['fields']['status'] = FacilityListItem.CONFIRMED_MATCH
        item['fields']['address'] = "{} {}".format(fake.hexify(text="^^^^",
                                                               upper=False),
                                                   fake.street_name())
        item['fields']['name'] = "{} {}".format(fake.company(),
                                                fake.company_suffix())
        status = FacilityMatch.CONFIRMED

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
            'status': status,
            'created_at': created_at,
            'updated_at': updated_at,
        }
    }


def make_facilities_and_matches(list_items):
    facilities = []
    matches = []

    for item in list_items:
        random_number = random.randint(1, 100)

        if random_number < 80 and random_number % 2 == 0 and len(facilities):
            facility_to_update = facilities[-1]
            matches.append(make_match(item, facility_to_update))
        elif random_number < 60:
            facility = make_facility(item)
            facilities.append(facility)
            matches.append(make_match(item, facility))
    return facilities, matches


class Command(BaseCommand):
    help = 'Create random but reasonable data fixtures'

    def add_arguments(self, parser):
        parser.add_argument('-m', '--match', action='store_true',
                            help='Create facilities and matches')

        parser.add_argument(
            '-u',
            '--usercount',
            type=int,
            help='The number of user records to create',
            default=100,
        )

        parser.add_argument(
            '-c',
            '--maxcontribid',
            type=int,
            help='The maximum contributor id. Range starts at 2',
            default=99,
        )

        parser.add_argument(
            '-l',
            '--maxlistid',
            type=int,
            help='The maximum facility list id. Range starts at 2',
            default=15,
        )

        parser.add_argument(
            '-s',
            '--maxsourceid',
            type=int,
            help='The maximum source id. Range starts at 2',
            default=15,
        )

    def handle(self, *args, **options):
        match = options['match']
        user_count = options['usercount']
        max_contributor_id = options['maxcontribid']
        max_list_id = options['maxlistid']
        max_source_id = options['maxsourceid']

        try:
            list_items = make_facility_list_items(max_list_pk=max_list_id)
            if match:
                facilities, matches = make_facilities_and_matches(list_items)
            else:
                self.stderr.write("Skipped making facilities and matches")

            self.dump_fixture('users.json', make_users(count=user_count))
            self.dump_fixture(
                'contributors.json',
                make_contributors(max_id=max_contributor_id)
            )
            self.dump_fixture(
                'facility_lists.json',
                make_facility_lists(max_id=max_list_id)
            )
            self.dump_fixture(
                'sources.json',
                make_sources(max_id=max_source_id)
            )
            self.dump_fixture('facility_list_items.json', list_items)

            if match:
                self.dump_fixture('facilities.json', facilities)
                self.dump_fixture('facility_matches.json', matches)

        except CommandError as e:
            self.stderr.write("Error creating fixtures: {}".format(e))

    def dump_fixture(self, filename, data):
        with open(os.path.join(FIXTURES_DIRECTORY, filename), 'w') as f:
            json.dump(data, f, separators=(',', ': '), indent=4)
