import json
import os
import xlrd

from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib import auth
from django.conf import settings
from django.contrib.gis.geos import Point

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from waffle.testutils import override_switch, override_flag

from api.constants import (ProcessingAction,
                           LogDownloadQueryParams,
                           UpdateLocationParams,
                           FeatureGroups)
from api.models import (Facility, FacilityList, FacilityListItem,
                        FacilityClaim, FacilityClaimReviewNote,
                        FacilityMatch, FacilityAlias, Contributor, User,
                        RequestLog, DownloadLog, FacilityLocation, Source)
from api.oar_id import make_oar_id, validate_oar_id
from api.processing import (parse_facility_list_item,
                            geocode_facility_list_item,
                            match_facility_list_items)
from api.geocoding import (create_geocoding_params,
                           format_geocoded_address_data,
                           geocode_address)
from api.test_data import parsed_city_hall_data
from api.permissions import referring_host_is_allowed, referring_host
from api.serializers import (ApprovedFacilityClaimSerializer,
                             FacilityCreateBodySerializer)


class FacilityListCreateTest(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'password'
        self.name = 'Test User'
        self.user = User(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.client.post('/user-login/',
                         {"email": self.email,
                          "password": self.password},
                         format="json")

        self.contributor = Contributor(name=self.name, admin=self.user)
        self.contributor.save()
        self.test_csv_rows = [
            'country,name,address',
            'US,Somewhere,999 Park St',
            'US,Someplace Else,1234 Main St',
        ]
        self.test_file = SimpleUploadedFile(
            'facilities.csv',
            b'\n'.join([s.encode() for s in self.test_csv_rows]),
            content_type='text/csv')
        self.test_file_with_bom = SimpleUploadedFile(
            'facilities_with_bom.csv',
            b'\n'.join([self.test_csv_rows[0].encode('utf-8-sig')] +
                       [s.encode() for s in self.test_csv_rows[1:]]),
            content_type='text/csv')

        lists_dir = '/usr/local/src/api/management/commands/facility_lists/'
        with open(os.path.join(lists_dir, '12.xls'), 'rb') as xls:
            self.test_file_xls = SimpleUploadedFile(
                '12.xls',
                xls.read(),
                content_type='application/vnd.ms-excel')

        with open(os.path.join(lists_dir, '12.xlsx'), 'rb') as xlsx:
            self.test_file_xlsx = SimpleUploadedFile(
                '12.xlsx',
                xlsx.read(),
                content_type='application/vnd.openxmlformats-'
                             'officedocument.spreadsheetml.sheet')

    def post_header_only_file(self, **kwargs):
        if kwargs is None:
            kwargs = {}
        csv_file = SimpleUploadedFile('facilities.csv',
                                      b'country,name,address\n',
                                      content_type='text/csv')
        return self.client.post(reverse('facility-list-list'),
                                {'file': csv_file, **kwargs},
                                format='multipart')

    def test_can_post_file_with_bom(self):
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': self.test_file_with_bom},
                                    format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        new_list = FacilityList.objects.last()
        self.assertEqual(self.test_csv_rows[0], new_list.header)

    def test_creates_list_and_items(self):
        previous_list_count = FacilityList.objects.all().count()
        previous_item_count = FacilityListItem.objects.all().count()
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': self.test_file},
                                    format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count + 1)
        self.assertEqual(FacilityListItem.objects.all().count(),
                         previous_item_count + len(self.test_csv_rows) - 1)

    def test_creates_source(self):
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': self.test_file},
                                    format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        new_list = FacilityList.objects.last()
        self.assertTrue(Source.objects.filter(facility_list=new_list).exists())
        source = Source.objects.filter(facility_list=new_list).first()
        items = list(FacilityListItem.objects.all())
        self.assertEqual(items[0].raw_data, self.test_csv_rows[1])
        for item in items:
            self.assertEqual(source, item.source)

    def test_creates_list_and_items_xls(self):
        previous_list_count = FacilityList.objects.all().count()
        previous_item_count = FacilityListItem.objects.all().count()
        response = self.client.post(reverse('facility-list-list'),
                                    {'name': 'creates_list_and_items_xls',
                                     'file': self.test_file_xls},
                                    format='multipart')
        self.test_file_xls.seek(0)
        sheet = xlrd.open_workbook(file_contents=self.test_file_xls.read(),
                                   on_demand=True).sheet_by_index(0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count + 1)
        self.assertEqual(FacilityListItem.objects.all().count(),
                         previous_item_count + sheet.nrows - 1)

        items = list(FacilityListItem.objects.all().order_by('row_index'))
        self.assertEqual(items[0].raw_data, '"{}"'.format(
            '","'.join(sheet.row_values(1))))

    def test_creates_list_and_items_xlsx(self):
        previous_list_count = FacilityList.objects.all().count()
        previous_item_count = FacilityListItem.objects.all().count()
        response = self.client.post(reverse('facility-list-list'),
                                    {'name': 'creates_list_and_items_xlsx',
                                     'file': self.test_file_xlsx},
                                    format='multipart')
        self.test_file_xlsx.seek(0)
        sheet = xlrd.open_workbook(file_contents=self.test_file_xlsx.read(),
                                   on_demand=True).sheet_by_index(0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count + 1)
        self.assertEqual(FacilityListItem.objects.all().count(),
                         previous_item_count + sheet.nrows - 1)
        items = list(FacilityListItem.objects.all().order_by('row_index'))
        self.assertEqual(items[0].raw_data, '"{}"'.format(
            '","'.join(sheet.row_values(1))))

    def test_file_required(self):
        response = self.client.post(reverse('facility-list-list'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content), ['No file specified.'])

    def test_empty_file_is_invalid(self):
        csv_file = SimpleUploadedFile('facilities.csv', b'',
                                      content_type='text/csv')
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': csv_file},
                                    format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content),
                         ['Header cannot be blank.'])

    def test_file_has_invalid_header(self):
        previous_list_count = FacilityList.objects.all().count()
        csv_file = SimpleUploadedFile('facilities.csv', b'foo,bar,baz\n',
                                      content_type='text/csv')
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': csv_file},
                                    format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content),
            ['Header must contain country, name, and address fields.'])
        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count)

    def test_file_has_missing_header_field(self):
        previous_list_count = FacilityList.objects.all().count()
        csv_file = SimpleUploadedFile('facilities.csv', b'country,address\n',
                                      content_type='text/csv')
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': csv_file},
                                    format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content),
            ['Header must contain country, name, and address fields.'])
        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count)

    def test_file_and_name_specified(self):
        name = 'A list of facilities'
        response = self.post_header_only_file(name=name)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_json = json.loads(response.content)
        new_list = FacilityList.objects.get(id=response_json['id'])
        self.assertEqual(new_list.name, name)

    def test_replaces_must_be_numeric(self):
        previous_list_count = FacilityList.objects.all().count()
        response = self.post_header_only_file(replaces='BAD')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content),
            ['"replaces" must be an integer ID.'])
        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count)

    def test_replaces_must_be_a_list_id(self):
        previous_list_count = FacilityList.objects.all().count()
        response = self.post_header_only_file(replaces=0)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content),
            ['0 is not a valid FacilityList ID.'])
        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count)

    def test_replaces(self):
        previous_list_count = FacilityList.objects.all().count()

        # Upload original
        response = self.post_header_only_file()
        self.assertEqual(response.status_code,
                         status.HTTP_200_OK)
        response_json = json.loads(response.content)
        original_list = FacilityList.objects.get(pk=response_json['id'])

        # Upload replacement
        response = self.post_header_only_file(replaces=response_json['id'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_json = json.loads(response.content)
        new_list = FacilityList.objects.get(pk=response_json['id'])

        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count + 2)
        self.assertEqual(new_list.replaces.id, original_list.id)

    def test_cant_replace_twice(self):
        previous_list_count = FacilityList.objects.all().count()

        # Upload original
        response = self.post_header_only_file()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_json = json.loads(response.content)

        # Upload replacement
        response = self.post_header_only_file(replaces=response_json['id'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt second replacement
        response = self.post_header_only_file(replaces=response_json['id'])
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content),
            ['FacilityList {} has already been replaced.'
                .format(response_json['id'])])

        self.assertEqual(FacilityList.objects.all().count(),
                         previous_list_count + 2)

    def test_user_must_be_authenticated(self):
        self.client.post('/user-logout/')
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': self.test_file},
                                    format='multipart')
        self.assertEqual(response.status_code, 401)

    def test_upload_with_authentication_token_succeeds(self):
        token = Token.objects.create(user=self.user)
        self.client.post('/user-logout/')
        header = {'HTTP_AUTHORIZATION': "Token {0}".format(token)}
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': self.test_file},
                                    format='multipart',
                                    **header)
        self.assertEqual(response.status_code, 200)

    def test_get_request_for_user_with_no_lists_returns_empty_array(self):
        response = self.client.get(reverse('facility-list-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])
        self.assertEqual(len(response.json()), 0)

    def test_get_request_for_user_with_test_file_list_returns_items(self):
        self.client.post(reverse('facility-list-list'),
                         {'file': self.test_file},
                         format='multipart')
        response = self.client.get(reverse('facility-list-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_get_request_for_unauthenticated_user_returns_401(self):
        self.client.post('/user-logout/')
        response = self.client.get(reverse('facility-list-list'))
        self.assertEqual(response.status_code, 401)

    def test_get_with_authentication_token_returns_items(self):
        token = Token.objects.create(user=self.user)
        self.client.post('/user-logout/')
        header = {'HTTP_AUTHORIZATION': "Token {0}".format(token)}
        self.client.post(reverse('facility-list-list'),
                         {'file': self.test_file},
                         format='multipart',
                         **header)
        response = self.client.get(reverse('facility-list-list'),
                                   **header)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_upload_by_user_with_no_contributor_returns_400(self):
        Contributor.objects.all().delete()
        token = Token.objects.create(user=self.user)
        self.client.post('/user-logout/')
        header = {'HTTP_AUTHORIZATION': "Token {0}".format(token)}
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': self.test_file},
                                    format='multipart',
                                    **header)
        self.assertEqual(response.status_code, 400)

    def test_list_request_by_user_with_no_contributor_returns_400(self):
        Contributor.objects.all().delete()
        response = self.client.get(reverse('facility-list-list'))
        self.assertEqual(response.status_code, 400)


class ProcessingTestCase(TestCase):
    def get_first_status(self, item, action):
        return next(
            r for r in item.processing_results if r['action'] == action)

    def assert_status(self, item, action):
        self.assertIsNotNone(self.get_first_status(item, action))


class FacilityListItemParseTest(ProcessingTestCase):
    def assert_successful_parse_results(self, item):
        self.assertEqual(FacilityListItem.PARSED, item.status)
        self.assert_status(item, ProcessingAction.PARSE)
        results = self.get_first_status(item, ProcessingAction.PARSE)
        self.assertTrue('error' in results)
        self.assertFalse(results['error'])
        self.assertTrue('started_at' in results)
        self.assertTrue('finished_at' in results)
        self.assertTrue(results['finished_at'] > results['started_at'])

    def assert_failed_parse_results(self, item, message=None):
        self.assertEqual(FacilityListItem.ERROR_PARSING, item.status)
        self.assert_status(item, ProcessingAction.PARSE)
        results = self.get_first_status(item, ProcessingAction.PARSE)
        self.assertTrue('error' in results)
        self.assertTrue(results['error'])
        self.assertTrue('message' in results)
        if message is not None:
            self.assertEqual(message, results['message'])
        self.assertTrue('started_at' in results)
        self.assertTrue('finished_at' in results)
        self.assertTrue(results['finished_at'] > results['started_at'])

    def test_expects_facility_list_item(self):
        self.assertRaises(ValueError, parse_facility_list_item, 'bad')

    def test_raises_if_item_is_not_uploaded(self):
        item = FacilityListItem(status=FacilityListItem.ERROR)
        self.assertRaises(ValueError, parse_facility_list_item, item)

    def test_parses_using_header(self):
        facility_list = FacilityList.objects.create(
            header='address,country,name')
        source = Source.objects.create(
            source_type=Source.LIST,
            facility_list=facility_list)
        item = FacilityListItem(raw_data='1234 main st,de,Shirts!',
                                source=source)
        parse_facility_list_item(item)
        self.assert_successful_parse_results(item)
        self.assertEqual('DE', item.country_code)
        self.assertEqual('Shirts!', item.name)
        self.assertEqual('1234 main st', item.address)

    def test_converts_country_name_to_code(self):
        facility_list = FacilityList.objects.create(
            header='address,country,name')
        source = Source.objects.create(
            source_type=Source.LIST,
            facility_list=facility_list)
        item = FacilityListItem(raw_data='1234 main st,ChInA,Shirts!',
                                source=source)
        parse_facility_list_item(item)
        self.assert_successful_parse_results(item)
        self.assertEqual('CN', item.country_code)
        self.assertEqual('Shirts!', item.name)
        self.assertEqual('1234 main st', item.address)

    def test_error_status_if_country_is_unknown(self):
        facility_list = FacilityList.objects.create(
            header='address,country,name')
        source = Source.objects.create(
            source_type=Source.LIST,
            facility_list=facility_list)
        item = FacilityListItem(raw_data='1234 main st,Unknownistan,Shirts!',
                                source=source)
        parse_facility_list_item(item)
        self.assert_failed_parse_results(
            item, 'Could not find a country code for "Unknownistan".')


class UserTokenGenerationTest(TestCase):
    def setUp(self):
        self.email = "test@example.com"
        self.password = "example123"
        self.user = User.objects.create(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

    def test_user_does_not_have_a_token_created_on_login(self):
        login_response = self.client.post('/user-login/',
                                          {"email": self.email,
                                           "password": self.password},
                                          format="json")
        self.assertEqual(login_response.status_code, 200)
        user = auth.get_user(self.client)
        self.assertTrue(user.is_authenticated)
        token = Token.objects.filter(user=self.user)
        self.assertEqual(token.count(), 0)

    def test_generated_token_is_not_deleted_on_logout(self):
        self.client.login(email=self.email, password=self.password)
        Token.objects.create(user=self.user)
        logout_response = self.client.post('/user-logout/')
        self.assertEqual(logout_response.status_code, 204)
        user = auth.get_user(self.client)
        self.assertFalse(user.is_authenticated)
        token = Token.objects.filter(user=self.user)
        self.assertEqual(token.count(), 1)


class GeocodingUtilsTest(TestCase):
    def setUp(self):
        settings.GOOGLE_SERVER_SIDE_API_KEY = "world"

    def test_geocoding_params_are_created_correctly(self):
        self.assertEqual(
            create_geocoding_params("hello", "US"),
            {
                'components': 'country:US',
                'address': 'hello',
                'key': 'world',
            }
        )

    def test_geocoded_address_data_is_formatted_correctly(self):
        formatted_data = format_geocoded_address_data(
            parsed_city_hall_data['full_response'])
        self.assertEqual(formatted_data, parsed_city_hall_data)


class GeocodingTest(TestCase):
    def test_geocode_response_contains_expected_keys(self):
        geocoded_data = geocode_address('990 Spring Garden St, Philly', 'US')
        self.assertIn('full_response', geocoded_data)
        self.assertIn('geocoded_address', geocoded_data)
        self.assertIn('geocoded_point', geocoded_data)
        self.assertIn('lat', geocoded_data['geocoded_point'])
        self.assertIn('lng', geocoded_data['geocoded_point'])

    def test_ungeocodable_address_returns_zero_resusts(self):
        results = geocode_address('@#$^@#$^', 'XX')
        self.assertEqual(0, results['result_count'])


class FacilityListItemGeocodingTest(ProcessingTestCase):
    def test_invalid_argument_raises_error(self):
        with self.assertRaises(ValueError) as cm:
            geocode_facility_list_item("hello")

        self.assertEqual(
            cm.exception.args,
            ('Argument must be a FacilityListItem',)
        )

    def test_unparsed_item_raises_error(self):
        facility_list = FacilityList(header='address,country,name')
        source = Source(source_type=Source.LIST,
                        facility_list=facility_list)
        item = FacilityListItem(
            raw_data='1400 JFK Blvd, Philly,us,Shirts!',
            source=source
        )

        with self.assertRaises(ValueError) as cm:
            geocode_facility_list_item(item)

        self.assertEqual(
            cm.exception.args,
            ('Items to be geocoded must be in the PARSED status',),
        )

    def test_successfully_geocoded_item_has_correct_results(self):
        facility_list = FacilityList.objects.create(
            header='address,country,name')
        source = Source.objects.create(
            source_type=Source.LIST,
            facility_list=facility_list)
        item = FacilityListItem(
            raw_data='"City Hall, Philly, PA",us,Shirts!',
            source=source
        )

        parse_facility_list_item(item)
        geocode_facility_list_item(item)

        self.assertIsNotNone(item.geocoded_address)
        self.assertIsInstance(item.geocoded_point, Point)
        self.assertEqual(item.status, FacilityListItem.GEOCODED)
        self.assertIn(
            'results',
            self.get_first_status(item, ProcessingAction.GEOCODE)['data']
        )

    def test_failed_geocoded_item_has_no_resuts_status(self):
        facility_list = FacilityList.objects.create(
            header='address,country,name')
        source = Source.objects.create(source_type=Source.LIST,
                                       facility_list=facility_list)
        item = FacilityListItem(
            raw_data='"hello, world, foo, bar, baz",us,Shirts!',
            source=source
        )
        parse_facility_list_item(item)
        item.country_code = "$%"
        geocode_facility_list_item(item)

        self.assertEqual(item.status, FacilityListItem.GEOCODED_NO_RESULTS)
        self.assertIsNone(item.geocoded_address)
        self.assertIsNone(item.geocoded_point)


class FacilityNamesAddressesAndContributorsTest(TestCase):
    def setUp(self):
        self.name_one = 'name_one'
        self.name_two = 'name_two'
        self.address_one = 'address_one'
        self.address_two = 'address_two'
        self.email_one = 'one@example.com'
        self.email_two = 'two@example.com'
        self.contrib_one_name = 'contributor one'
        self.contrib_two_name = 'contributor two'
        self.country_code = 'US'
        self.list_one_name = 'one'
        self.list_two_name = 'two'
        self.user_one = User.objects.create(email=self.email_one)
        self.user_two = User.objects.create(email=self.email_two)

        self.contrib_one = Contributor \
            .objects \
            .create(admin=self.user_one,
                    name=self.contrib_one_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.contrib_two = Contributor \
            .objects \
            .create(admin=self.user_two,
                    name=self.contrib_two_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_one = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one",
                    name=self.list_one_name)

        self.source_one = Source \
            .objects \
            .create(facility_list=self.list_one,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contrib_one)

        self.list_item_one = FacilityListItem \
            .objects \
            .create(name=self.name_one,
                    address=self.address_one,
                    country_code=self.country_code,
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_one)

        self.list_two = FacilityList \
            .objects \
            .create(header="header",
                    file_name="two",
                    name=self.list_two_name)

        self.source_two = Source \
            .objects \
            .create(facility_list=self.list_two,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contrib_two)

        self.list_item_two = FacilityListItem \
            .objects \
            .create(name=self.name_two,
                    address=self.address_two,
                    country_code=self.country_code,
                    row_index="2",
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_two)

        self.facility = Facility \
            .objects \
            .create(name=self.name_one,
                    address=self.address_one,
                    country_code=self.country_code,
                    location=Point(0, 0),
                    created_from=self.list_item_one)

        self.facility_match_one = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.CONFIRMED,
                    facility=self.facility,
                    results="",
                    facility_list_item=self.list_item_one)

        self.facility_match_two = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.CONFIRMED,
                    facility=self.facility,
                    results="",
                    facility_list_item=self.list_item_two)

    def test_returns_contributors(self):
        sources = self.facility.sources()
        self.assertIn(self.source_one, sources)
        self.assertIn(self.source_two, sources)
        self.assertEqual(len(sources), 2)

    def test_excludes_canonical_name_from_other_names(self):
        other_names = self.facility.other_names()
        self.assertIn(self.name_two, other_names)
        self.assertNotIn(self.name_one, other_names)

    def test_excludes_canonical_address_from_other_addresses(self):
        other_addresses = self.facility.other_addresses()
        self.assertIn(self.address_two, other_addresses)
        self.assertNotIn(self.address_one, other_addresses)

    def test_excludes_other_names_from_inactive_lists(self):
        self.source_two.is_active = False
        self.source_two.save()
        other_names = self.facility.other_names()
        self.assertNotIn(self.name_two, other_names)
        self.assertEqual(len(other_names), 0)

    def test_excludes_other_addresses_from_inactive_lists(self):
        self.source_two.is_active = False
        self.source_two.save()
        other_addresses = self.facility.other_addresses()
        self.assertNotIn(self.address_two, other_addresses)
        self.assertEqual(len(other_addresses), 0)

    def test_excludes_contributors_from_inactive_lists(self):
        self.source_two.is_active = False
        self.source_two.save()
        sources = self.facility.sources()
        self.assertIn(self.source_one, sources)
        self.assertNotIn(self.source_two, sources)

    def test_excludes_other_names_from_non_public_lists(self):
        self.source_two.is_active = False
        self.source_two.save()
        other_names = self.facility.other_names()
        self.assertNotIn(self.name_two, other_names)
        self.assertEqual(len(other_names), 0)

    def test_excludes_other_addresses_from_non_public_lists(self):
        self.source_two.is_active = False
        self.source_two.save()
        other_addresses = self.facility.other_addresses()
        self.assertNotIn(self.address_two, other_addresses)
        self.assertEqual(len(other_addresses), 0)

    def test_excludes_contributors_from_non_public_lists(self):
        self.source_two.is_active = False
        self.source_two.save()
        sources = self.facility.sources()
        self.assertIn(self.source_one, sources)
        self.assertNotIn(self.source_two, sources)

    def test_excludes_unmatched_facilities_from_other_names(self):
        self.facility_match_two.status = FacilityMatch.REJECTED
        self.facility_match_two.save()
        other_names = self.facility.other_names()
        self.assertNotIn(self.name_two, other_names)
        self.assertEqual(len(other_names), 0)

    def test_excludes_unmatched_facilities_from_other_addresses(self):
        self.facility_match_two.status = FacilityMatch.REJECTED
        self.facility_match_two.save()
        other_addresses = self.facility.other_addresses()
        self.assertNotIn(self.name_one, other_addresses)
        self.assertEqual(len(other_addresses), 0)

    def test_excludes_unmatched_facilities_from_contributors(self):
        self.facility_match_two.status = FacilityMatch.REJECTED
        self.facility_match_two.save()
        sources = self.facility.sources()
        self.assertIn(self.source_one, sources)
        self.assertNotIn(self.source_two, sources)
        self.assertEqual(len(sources), 1)

    def test_excludes_inactive_facility_matches_from_details(self):
        self.facility_match_two.is_active = False
        self.facility_match_two.save()

        sources = self.facility.sources()
        self.assertIn(self.source_one, sources)
        self.assertNotIn(self.source_two, sources)
        self.assertEqual(len(sources), 1)

        other_names = self.facility.other_names()
        self.assertNotIn(self.name_two, other_names)
        self.assertEqual(len(other_names), 0)

        other_addresses = self.facility.other_addresses()
        self.assertNotIn(self.address_two, other_addresses)
        self.assertEqual(len(other_addresses), 0)


class ConfirmRejectAndRemoveFacilityMatchTest(TestCase):
    def setUp(self):
        self.country_code = 'US'

        self.prior_user_name = 'prior_user_name'
        self.prior_user_email = 'prioruser@example.com'
        self.prior_contrib_name = 'prior_contrib_name'
        self.prior_list_name = 'prior_list_name'
        self.prior_user = User.objects.create(email=self.prior_user_email)
        self.prior_address_one = 'prior_address_one'
        self.prior_address_two = 'prior_address_two'
        self.prior_name_one = 'prior_name_one'
        self.prior_name_two = 'prior_name_two'
        self.prior_user_password = 'example-password'
        self.prior_user.set_password(self.prior_user_password)
        self.prior_user.save()

        self.prior_contrib = Contributor \
            .objects \
            .create(admin=self.prior_user,
                    name=self.prior_contrib_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.prior_list = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one",
                    name=self.prior_list_name)

        self.prior_source = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.prior_list,
                    contributor=self.prior_contrib)

        self.prior_list_item_one = FacilityListItem \
            .objects \
            .create(name=self.prior_name_one,
                    address=self.prior_address_one,
                    country_code=self.country_code,
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.prior_source)

        self.prior_facility_one = Facility \
            .objects \
            .create(name=self.prior_list_item_one.name,
                    address=self.prior_list_item_one.address,
                    country_code=self.country_code,
                    location=Point(0, 0),
                    created_from=self.prior_list_item_one)

        self.prior_facility_match_one = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.prior_facility_one,
                    results="",
                    facility_list_item=self.prior_list_item_one)

        self.prior_list_item_two = FacilityListItem \
            .objects \
            .create(name=self.prior_name_two,
                    address=self.prior_address_two,
                    country_code=self.country_code,
                    row_index=2,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.prior_source)

        self.prior_facility_two = Facility \
            .objects \
            .create(name=self.prior_list_item_two.name,
                    address=self.prior_list_item_two.address,
                    country_code=self.country_code,
                    location=Point(0, 0),
                    created_from=self.prior_list_item_two)

        self.prior_facility_match_one = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.prior_facility_two,
                    results="",
                    facility_list_item=self.prior_list_item_one)

        self.current_user_name = 'current_user_name'
        self.current_user_email = 'currentuser@example.com'
        self.current_contrib_name = 'current_contrib_name'
        self.current_list_name = 'current_list_name'
        self.current_user = User.objects.create(email=self.current_user_email)
        self.current_user_password = "password123"
        self.current_user.set_password(self.current_user_password)
        self.current_user.save()

        self.current_address = 'current_address'
        self.current_name = 'current_name'

        self.current_contrib = Contributor \
            .objects \
            .create(admin=self.current_user,
                    name=self.current_contrib_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.current_list = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one",
                    name=self.current_list_name)

        self.current_source = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.current_list,
                    contributor=self.current_contrib)

        self.current_list_item = FacilityListItem \
            .objects \
            .create(name=self.current_name,
                    address=self.current_address,
                    country_code=self.country_code,
                    row_index=1,
                    geocoded_point=Point(0, 0),
                    status=FacilityListItem.POTENTIAL_MATCH,
                    source=self.current_source)

        self.potential_facility_match_one = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.PENDING,
                    facility=self.prior_facility_one,
                    results="",
                    facility_list_item=self.current_list_item)

        self.potential_facility_match_two = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.PENDING,
                    facility=self.prior_facility_two,
                    results="",
                    facility_list_item=self.current_list_item)

        self.client.login(email=self.current_user_email,
                          password=self.current_user_password)

        self.confirm_url = '/api/facility-lists/{}/confirm/' \
            .format(self.current_list.id)

        self.reject_url = '/api/facility-lists/{}/reject/' \
            .format(self.current_list.id)

        self.remove_url = '/api/facility-lists/{}/remove/' \
            .format(self.current_list.id)

    def test_confirming_match_rejects_other_potential_matches(self):
        confirm_response = self.client.post(
            self.confirm_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        confirmed_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_one.id)

        rejected_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_two.id)

        self.assertEqual(confirm_response.status_code, 200)
        self.assertEqual(confirmed_match.status, FacilityMatch.CONFIRMED)
        self.assertEqual(rejected_match.status, FacilityMatch.REJECTED)

    def test_confirming_match_changes_list_item_status(self):
        confirm_response = self.client.post(
            self.confirm_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        updated_list_item = FacilityListItem \
            .objects \
            .get(pk=self.current_list_item.id)

        self.assertEqual(confirm_response.status_code, 200)
        self.assertEqual(updated_list_item.status,
                         FacilityListItem.CONFIRMED_MATCH)

    def test_confirming_match_doesnt_create_new_facility(self):
        confirm_response = self.client.post(
            self.confirm_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        facilities = Facility.objects.all()

        self.assertEqual(confirm_response.status_code, 200)
        self.assertEqual(facilities.count(), 2)

    def test_rejecting_last_potential_match_changes_list_item_status(self):
        reject_response_one = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        reject_response_two = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_two.id},
        )

        self.assertEqual(reject_response_one.status_code, 200)
        self.assertEqual(reject_response_two.status_code, 200)

        updated_list_item = FacilityListItem \
            .objects \
            .get(pk=self.current_list_item.id)

        self.assertEqual(updated_list_item.status,
                         FacilityListItem.CONFIRMED_MATCH)

    def test_rejecting_one_of_several_matches_changes_match_to_rejected(self):
        reject_response_one = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        self.assertEqual(reject_response_one.status_code, 200)

        updated_potential_match_one = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_one.id)

        self.assertEqual(updated_potential_match_one.status,
                         FacilityMatch.REJECTED)

        updated_potential_match_two = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_two.id)

        self.assertEqual(updated_potential_match_two.status,
                         FacilityMatch.PENDING)

    def test_rejecting_one_of_several_matches_doesnt_change_item_status(self):
        reject_response_one = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        self.assertEqual(reject_response_one.status_code, 200)

        updated_list_item = FacilityListItem \
            .objects \
            .get(pk=self.current_list_item.id)

        self.assertEqual(updated_list_item.status,
                         FacilityListItem.POTENTIAL_MATCH)

    def test_rejecting_last_potential_match_creates_new_facility(self):
        reject_response_one = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        reject_response_two = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_two.id},
        )

        self.assertEqual(reject_response_one.status_code, 200)
        self.assertEqual(reject_response_two.status_code, 200)

        facilities = Facility.objects.all()
        self.assertEqual(facilities.count(), 3)

    def test_rejecting_last_potential_match_creates_a_new_facility_match(self):
        initial_facility_matches_count = FacilityMatch.objects.all().count()

        reject_response_one = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        reject_response_two = self.client.post(
            self.reject_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_two.id},
        )

        self.assertEqual(reject_response_one.status_code, 200)
        self.assertEqual(reject_response_two.status_code, 200)

        facilities = Facility.objects.all()
        self.assertEqual(facilities.count(), 3)

        new_facility_matches_count = FacilityMatch.objects.all().count()
        self.assertEqual(
            initial_facility_matches_count + 1,
            new_facility_matches_count,
        )

    def test_removing_a_list_item_sets_its_matches_to_inactive(self):
        confirm_response = self.client.post(
            self.confirm_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        confirmed_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_one.id)

        rejected_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_two.id)

        self.assertEqual(confirm_response.status_code, 200)
        self.assertEqual(confirmed_match.status, FacilityMatch.CONFIRMED)
        self.assertEqual(rejected_match.status, FacilityMatch.REJECTED)
        self.assertEqual(confirmed_match.is_active, True)
        self.assertEqual(rejected_match.is_active, True)

        remove_response = self.client.post(
            self.remove_url,
            {"list_item_id": self.current_list_item.id},
        )

        self.assertEqual(remove_response.status_code, 200)

        updated_confirmed_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_one.id)

        updated_rejected_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_two.id)

        self.assertEqual(updated_confirmed_match.is_active, False)
        self.assertEqual(updated_rejected_match.is_active, False)

    def test_only_list_contribtutor_can_remove_a_list_item(self):
        confirm_response = self.client.post(
            self.confirm_url,
            {"list_item_id": self.current_list_item.id,
             "facility_match_id": self.potential_facility_match_one.id},
        )

        confirmed_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_one.id)

        rejected_match = FacilityMatch \
            .objects \
            .get(pk=self.potential_facility_match_two.id)

        self.assertEqual(confirm_response.status_code, 200)
        self.assertEqual(confirmed_match.status, FacilityMatch.CONFIRMED)
        self.assertEqual(rejected_match.status, FacilityMatch.REJECTED)
        self.assertEqual(confirmed_match.is_active, True)
        self.assertEqual(rejected_match.is_active, True)

        self.client.logout()

        self.client.login(email=self.prior_user_email,
                          password=self.prior_user_password)

        remove_response = self.client.post(
            self.remove_url,
            {"list_item_id": self.current_list_item.id},
        )

        self.assertEqual(remove_response.status_code, 404)


def interspace(string):
    half = int(len(string) / 2)
    return ' '.join(string[:half]) + string[half:]


def junk_chars(string):
    return string + 'YY'


class DedupeMatchingTests(TestCase):
    fixtures = ['users', 'contributors', 'facility_lists', 'sources',
                'facility_list_items', 'facilities', 'facility_matches']

    def setUp(self):
        self.contributor = Contributor.objects.first()

    def create_list(self, items, status=FacilityListItem.GEOCODED):
        facility_list = FacilityList(
            name='test', description='',
            file_name='test.csv', header='country,name,address')
        facility_list.save()
        source = Source(source_type=Source.LIST, facility_list=facility_list,
                        contributor=self.contributor)
        source.save()
        for index, item in enumerate(items):
            country_code, name, address = item
            list_item = FacilityListItem(
                source=source, row_index=index, raw_data='',
                status=status, name=name, address=address,
                country_code=country_code, geocoded_address='')
            list_item.save()
        return facility_list

    def test_matches(self):
        facility = Facility.objects.first()
        facility_list = self.create_list([
            (facility.country_code, interspace(facility.name),
             junk_chars(facility.address.upper()))])
        result = match_facility_list_items(facility_list)
        matches = result['item_matches']
        item_id = str(facility_list.source.facilitylistitem_set.all()[0].id)
        self.assertIn(item_id, matches)
        self.assertEqual(1, len(matches[item_id]))
        self.assertEqual(str(facility.id), matches[item_id][0][0])
        self.assertEqual(0.5, result['results']['gazetteer_threshold'])
        self.assertFalse(result['results']['no_gazetteer_matches'])
        self.assertFalse(result['results']['no_geocoded_items'])

    def test_does_not_match(self):
        facility_list = self.create_list([
            ('US', 'Azavea', '990 Spring Garden St.')])
        result = match_facility_list_items(facility_list)
        matches = result['item_matches']
        self.assertEqual(0, len(matches))
        self.assertTrue(result['results']['no_gazetteer_matches'])

    def test_no_geocoded_items(self):
        facility = Facility.objects.first()
        facility_list = self.create_list([
            (facility.country_code, interspace(facility.name),
             junk_chars(facility.address.upper()))],
                                         status=FacilityListItem.PARSED)
        result = match_facility_list_items(facility_list)
        self.assertTrue(result['results']['no_geocoded_items'])


class OarIdTests(TestCase):

    def test_make_and_validate_oar_id(self):
        id = make_oar_id('US')
        validate_oar_id(id)
        self.assertEqual(id[:2], 'US')

    def test_id_too_long(self):
        self.assertRaises(ValueError, validate_oar_id, 'US2019070KTWK4x')

    def test_invalid_checksum(self):
        self.assertRaises(ValueError, validate_oar_id, 'USX019070KTWK4')

    def test_invalid_country(self):
        self.assertRaises(ValueError, make_oar_id, '99')


class ContributorsListAPIEndpointTests(TestCase):
    def setUp(self):
        self.name_one = 'name_one'
        self.name_two = 'name_two'
        self.name_three = 'name_three'
        self.name_four = 'name_four'

        self.address_one = 'address_one'
        self.address_two = 'address_two'
        self.address_three = 'address_three'
        self.address_four = 'address_four'

        self.email_one = 'one@example.com'
        self.email_two = 'two@example.com'
        self.email_three = 'three@example.com'
        self.email_four = 'four@example.com'

        self.contrib_one_name = 'contributor that should be included'
        self.contrib_two_name = 'contributor with no lists'
        self.contrib_three_name = 'contributor with an inactive list'
        self.contrib_four_name = 'contributor with a non public list'

        self.country_code = 'US'
        self.list_one_name = 'one'
        self.list_one_b_name = 'one-b'
        self.list_three_name = 'three'
        self.list_four_name = 'four'

        self.user_one = User.objects.create(email=self.email_one)
        self.user_two = User.objects.create(email=self.email_two)
        self.user_three = User.objects.create(email=self.email_three)
        self.user_four = User.objects.create(email=self.email_four)

        self.contrib_one = Contributor \
            .objects \
            .create(admin=self.user_one,
                    name=self.contrib_one_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.contrib_two = Contributor \
            .objects \
            .create(admin=self.user_two,
                    name=self.contrib_two_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.contrib_three = Contributor \
            .objects \
            .create(admin=self.user_three,
                    name=self.contrib_three_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.contrib_four = Contributor \
            .objects \
            .create(admin=self.user_four,
                    name=self.contrib_four_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_one = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one",
                    name=self.list_one_name)

        self.source_one = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.list_one,
                    contributor=self.contrib_one)

        self.list_one_b = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one-b",
                    name=self.list_one_b_name)

        self.source_one_b = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.list_one_b,
                    contributor=self.contrib_one)

        # Contributor two has no lists

        self.list_three = FacilityList \
            .objects \
            .create(header="header",
                    file_name="three",
                    name=self.list_three_name)

        self.source_three = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.list_three,
                    is_public=True,
                    is_active=False,
                    contributor=self.contrib_three)

        self.list_four = FacilityList \
            .objects \
            .create(header="header",
                    file_name="four",
                    name=self.list_four_name)

        self.source_four = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.list_four,
                    is_public=False,
                    is_active=True,
                    contributor=self.contrib_four)

    def test_contributors_list_has_only_contributors_with_active_lists(self):
        response = self.client.get('/api/contributors/')
        response_data = response.json()
        contributor_names = list(zip(*response_data))[1]

        self.assertIn(
            self.contrib_one_name,
            contributor_names,
        )

        self.assertNotIn(
            self.contrib_two_name,
            contributor_names,
        )

        self.assertNotIn(
            self.contrib_three_name,
            contributor_names,
        )

        self.assertNotIn(
            self.contrib_four_name,
            contributor_names,
        )

        self.assertEqual(
            1,
            len(contributor_names),
        )


class FacilityListItemTests(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'example123'
        self.user = User.objects.create(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.contributor = Contributor \
            .objects \
            .create(admin=self.user,
                    name='test contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.facility_list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='test list')

        self.source = Source.objects.create(
            source_type=Source.LIST,
            facility_list=self.facility_list,
            contributor=self.contributor)

        statuses = [c[0] for c in FacilityListItem.STATUS_CHOICES]
        for i, possible_status in enumerate(statuses):
            FacilityListItem \
                .objects \
                .create(name='test name',
                        address='test address',
                        country_code='US',
                        source=self.source,
                        row_index=i,
                        status=possible_status)

        self.client.login(email=self.email,
                          password=self.password)

    def test_get_all_items(self):
        response = self.client.get(
            reverse('facility-list-items',
                    kwargs={'pk': self.facility_list.pk}))
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertEqual(len(FacilityListItem.STATUS_CHOICES),
                         len(content['results']))

    def test_get_items_filtered_by_status(self):
        url = reverse('facility-list-items',
                      kwargs={'pk': self.facility_list.pk})

        response = self.client.get('{}?status=GEOCODED'.format(url))
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertEqual(1, len(content['results']))
        self.assertEqual('GEOCODED', content['results'][0]['status'])

    def test_get_multiple_statuses(self):
        url = reverse('facility-list-items',
                      kwargs={'pk': self.facility_list.pk})

        response = self.client.get(
            '{}?status=GEOCODED&status=MATCHED'.format(url))
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertEqual(2, len(content['results']))

    def test_invalid_status_returns_400(self):
        url = reverse('facility-list-items',
                      kwargs={'pk': self.facility_list.pk})

        response = self.client.get('{}?status=FOO'.format(url))
        self.assertEqual(400, response.status_code)
        content = json.loads(response.content)
        self.assertTrue('status' in content)

    def test_empty_status_filter_returns_400(self):
        url = reverse('facility-list-items',
                      kwargs={'pk': self.facility_list.pk})
        response = self.client.get('{}?status='.format(url))
        self.assertEqual(400, response.status_code)
        content = json.loads(response.content)
        self.assertTrue('status' in content)

    def test_new_facility(self):
        url = reverse('facility-list-items',
                      kwargs={'pk': self.facility_list.pk})

        # First assert that there are no NEW_FACILITYs in our test data.
        response = self.client.get(
            '{}?status=NEW_FACILITY'.format(url))
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertEqual(0, len(content['results']))

        # Create a facility from the test list item
        list_item = FacilityListItem.objects.filter(
            source=self.source,
            status=FacilityListItem.MATCHED,
        ).first()
        facility = Facility.objects.create(
            country_code=list_item.country_code,
            created_from=list_item,
            location=Point(0, 0),
        )
        list_item.facility = facility
        list_item.save()

        # Assert that we now have a NEW_FACILITY
        response = self.client.get(
            '{}?status=NEW_FACILITY'.format(url))
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertEqual(1, len(content['results']))


class FacilityClaimAdminDashboardTests(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'example123'
        self.user = User.objects.create(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.contributor = Contributor \
            .objects \
            .create(admin=self.user,
                    name='test contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one",
                    name='List')

        self.source = Source \
            .objects \
            .create(facility_list=self.list,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        self.list_item = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source)

        self.facility = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item)

        self.facility_match = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.CONFIRMED,
                    facility=self.facility,
                    results="",
                    facility_list_item=self.list_item)

        self.facility_claim = FacilityClaim \
            .objects \
            .create(
                contributor=self.contributor,
                facility=self.facility,
                contact_person='Name',
                email=self.email,
                phone_number=12345,
                company_name='Test',
                website='http://example.com',
                facility_description='description',
                preferred_contact_method=FacilityClaim.EMAIL)

        self.superuser = User \
            .objects \
            .create_superuser('superuser@example.com',
                              'superuser')

        self.client.login(email='superuser@example.com',
                          password='superuser')

    @override_switch('claim_a_facility', active=True)
    def test_user_cannot_submit_second_facility_claim_with_one_pending(self):
        self.client.logout()
        self.client.login(email=self.email,
                          password=self.password)

        error_response = self.client.post(
            '/api/facilities/{}/claim/'.format(self.facility.id),
            {
                'contact_person': 'contact_person',
                'email': 'example@example.com',
                'phone_number': '12345',
                'company_name': 'company_name',
                'website': 'http://example.com',
                'facility_description': 'facility_description',
                'verification_method': 'verification_method',
                'preferred_contact_method': FacilityClaim.EMAIL,
            }
        )

        self.assertEqual(400, error_response.status_code)

        self.assertEqual(
            error_response.json()['detail'],
            'User already has a pending claim on this facility'
        )

    @override_switch('claim_a_facility', active=True)
    def test_approve_claim_and_email_claimant_and_contributors(self):
        self.assertEqual(len(mail.outbox), 0)

        response = self.client.post(
            '/api/facility-claims/{}/approve/'.format(self.facility_claim.id)
        )

        self.assertEqual(200, response.status_code)

        # Expect two emails to have been sent:
        #   - one to the user who submitted the facility claim
        #   - one to a contributor who has this facility on a list
        self.assertEqual(len(mail.outbox), 2)

        updated_facility_claim = FacilityClaim \
            .objects \
            .get(pk=self.facility_claim.id)

        self.assertEqual(
            FacilityClaim.APPROVED,
            updated_facility_claim.status,
        )

        notes_count = FacilityClaimReviewNote \
            .objects \
            .filter(claim=updated_facility_claim) \
            .count()

        self.assertEqual(notes_count, 1)

        error_response = self.client.post(
            '/api/facility-claims/{}/approve/'.format(self.facility_claim.id)
        )

        self.assertEqual(400, error_response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_can_approve_at_most_one_facility_claim(self):
        response = self.client.post(
            '/api/facility-claims/{}/approve/'.format(self.facility_claim.id)
        )

        self.assertEqual(200, response.status_code)

        updated_facility_claim = FacilityClaim \
            .objects \
            .get(pk=self.facility_claim.id)

        self.assertEqual(
            FacilityClaim.APPROVED,
            updated_facility_claim.status,
        )

        new_user = User.objects.create(email='new_user@example.com')
        new_contributor = Contributor \
            .objects \
            .create(admin=new_user,
                    name='new_contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        new_facility_claim = FacilityClaim \
            .objects \
            .create(
                contributor=new_contributor,
                facility=self.facility,
                contact_person='Name',
                email='new_user@example.com',
                phone_number=12345,
                company_name='Test',
                website='http://example.com',
                facility_description='description',
                preferred_contact_method=FacilityClaim.EMAIL)

        error_response = self.client.post(
            '/api/facility-claims/{}/approve/'.format(new_facility_claim.id)
        )

        self.assertEqual(400, error_response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_deny_facility_claim(self):
        self.assertEqual(len(mail.outbox), 0)

        response = self.client.post(
            '/api/facility-claims/{}/deny/'.format(self.facility_claim.id)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(mail.outbox), 1)

        updated_facility_claim = FacilityClaim \
            .objects \
            .get(pk=self.facility_claim.id)

        self.assertEqual(
            FacilityClaim.DENIED,
            updated_facility_claim.status,
        )

        notes_count = FacilityClaimReviewNote \
            .objects \
            .filter(claim=updated_facility_claim) \
            .count()

        self.assertEqual(notes_count, 1)

        error_response = self.client.post(
            '/api/facility-claims/{}/deny/'.format(self.facility_claim.id)
        )

        self.assertEqual(400, error_response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_revoke_facility_claim(self):
        self.assertEqual(len(mail.outbox), 0)

        error_response = self.client.post(
            '/api/facility-claims/{}/revoke/'.format(self.facility_claim.id)
        )

        self.assertEqual(400, error_response.status_code)

        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response = self.client.post(
            '/api/facility-claims/{}/revoke/'.format(self.facility_claim.id)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(mail.outbox), 1)

        updated_facility_claim = FacilityClaim \
            .objects \
            .get(pk=self.facility_claim.id)

        self.assertEqual(
            FacilityClaim.REVOKED,
            updated_facility_claim.status,
        )

        notes_count = FacilityClaimReviewNote \
            .objects \
            .filter(claim=updated_facility_claim) \
            .count()

        self.assertEqual(notes_count, 1)

        another_error_response = self.client.post(
            '/api/facility-claims/{}/revoke/'.format(self.facility_claim.id)
        )

        self.assertEqual(400, another_error_response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_add_claim_review_note(self):
        api_url = '/api/facility-claims/{}/note/'.format(
            self.facility_claim.id
        )
        response = self.client.post(api_url, {'note': 'note'})

        self.assertEqual(200, response.status_code)

        notes_count = FacilityClaimReviewNote \
            .objects \
            .filter(claim=self.facility_claim) \
            .count()

        self.assertEqual(notes_count, 1)

    @override_switch('claim_a_facility', active=True)
    def test_claims_list_API_accessible_only_to_superusers(self):
        response = self.client.get('/api/facility-claims/')
        self.assertEqual(200, response.status_code)

        self.client.logout()
        self.client.login(email=self.email,
                          password=self.password)

        error_response = self.client.get('/api/facility-claims/')
        self.assertEqual(403, error_response.status_code)


class ApprovedFacilityClaimTests(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'example123'
        self.user = User.objects.create(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.user_contributor = Contributor \
            .objects \
            .create(admin=self.user,
                    name='text contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.contributor_email = 'contributor@example.com'
        self.contributor_user = User.objects \
                                    .create(email=self.contributor_email)

        self.list_contributor = Contributor \
            .objects \
            .create(admin=self.contributor_user,
                    name='test contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.facility_list = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one",
                    name='List')

        self.source = Source \
            .objects \
            .create(facility_list=self.facility_list,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.list_contributor)

        self.list_item = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source)

        self.facility = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item)

        self.facility_match = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.CONFIRMED,
                    facility=self.facility,
                    results="",
                    facility_list_item=self.list_item)

        self.facility_claim = FacilityClaim \
            .objects \
            .create(
                contributor=self.user_contributor,
                facility=self.facility,
                contact_person='Name',
                email=self.email,
                phone_number=12345,
                company_name='Test',
                website='http://example.com',
                facility_description='description',
                preferred_contact_method=FacilityClaim.EMAIL)

        self.superuser_email = 'superuser@example.com'
        self.superuser_password = 'superuser'

        self.superuser = User \
            .objects \
            .create_superuser(self.superuser_email,
                              self.superuser_password)

        self.client.login(email=self.email,
                          password=self.password)

    @override_switch('claim_a_facility', active=True)
    def test_non_approved_facility_claim_is_not_visible(self):
        api_url = '/api/facility-claims/{}/claimed/'.format(
            self.facility_claim.id
        )
        pending_response = self.client.get(api_url)
        self.assertEqual(404, pending_response.status_code)

        self.facility_claim.status = FacilityClaim.DENIED
        self.facility_claim.save()
        denied_response = self.client.get(api_url)
        self.assertEqual(404, denied_response.status_code)

        self.facility_claim.status = FacilityClaim.REVOKED
        self.facility_claim.save()
        revoked_response = self.client.get(api_url)
        self.assertEqual(404, revoked_response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_approved_facility_claim_is_visible_to_claimant(self):
        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response = self.client.get(
            '/api/facility-claims/{}/claimed/'.format(self.facility_claim.id)
        )
        self.assertEqual(200, response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_other_user_approved_facility_claims_are_not_visible(self):
        self.client.logout()

        self.client.login(email=self.superuser_email,
                          pasword=self.superuser_password)

        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response = self.client.get(
            '/api/facility-claims/{}/claimed/'.format(self.facility_claim.id)
        )
        self.assertEqual(401, response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_approved_facility_claim_info_is_in_details_response(self):
        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.facility_description = 'new_description'
        self.facility_claim.save()

        response_data = self.client.get(
            '/api/facilities/{}/'.format(self.facility_claim.facility.id)
        ).json()['properties']['claim_info']['facility']

        self.assertEqual(response_data['description'], 'new_description')

    @override_switch('claim_a_facility', active=True)
    def test_updating_claim_profile_sends_email_to_contributor(self):
        self.assertEqual(len(mail.outbox), 0)
        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response = self.client.put(
            '/api/facility-claims/{}/claimed/'.format(self.facility_claim.id),
            {
                'facility_description': 'test_facility_description',
                'facility_phone_number_publicly_visible': False,
                'point_of_contact_publicly_visible': False,
                'office_info_publicly_visible': False,
                'facility_website_publicly_visible': False,
            }
        )

        self.assertEqual(200, response.status_code)

        updated_description = FacilityClaim \
            .objects \
            .get(pk=self.facility_claim.id) \
            .facility_description

        self.assertEqual(updated_description, 'test_facility_description')

        self.assertEqual(len(mail.outbox), 1)

    @override_switch('claim_a_facility', active=True)
    def test_non_visible_facility_phone_is_not_in_details_response(self):
        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response_data = self.client.get(
            '/api/facilities/{}/'.format(self.facility_claim.facility.id)
        ).json()['properties']['claim_info']['facility']

        self.assertIsNone(response_data['phone_number'])

    @override_switch('claim_a_facility', active=True)
    def test_non_visible_office_info_is_not_in_details_response(self):
        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response_data = self.client.get(
            '/api/facilities/{}/'.format(self.facility_claim.facility.id)
        ).json()['properties']['claim_info']

        self.assertIsNone(response_data['contact'])

    @override_switch('claim_a_facility', active=True)
    def test_non_visible_contact_info_is_not_in_details_response(self):
        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response_data = self.client.get(
            '/api/facilities/{}/'.format(self.facility_claim.facility.id)
        ).json()['properties']['claim_info']

        self.assertIsNone(response_data['office'])

    @override_switch('claim_a_facility', active=True)
    def test_non_visible_website_is_not_in_details_response(self):
        self.facility_claim.status = FacilityClaim.APPROVED
        self.facility_claim.save()

        response_data = self.client.get(
            '/api/facilities/{}/'.format(self.facility_claim.facility.id)
        ).json()['properties']['claim_info']['facility']

        self.assertIsNone(response_data['website'])


class FacilityClaimTest(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'example123'
        self.user = User.objects.create(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.contributor = Contributor(name='Contributor', admin=self.user)
        self.contributor.save()

        self.list_one = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='list')

        self.source_one = Source \
            .objects \
            .create(facility_list=self.list_one,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        self.list_item_one = FacilityListItem \
            .objects \
            .create(name='name',
                    address='address',
                    country_code='US',
                    source=self.source_one,
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH)

        self.facility = Facility \
            .objects \
            .create(name='name',
                    address='address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item_one)

        self.facility_match_one = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.CONFIRMED,
                    facility=self.facility,
                    results="",
                    facility_list_item=self.list_item_one)

    @override_switch('claim_a_facility', active=True)
    def test_requires_login(self):
        url = reverse('facility-claimed')
        response = self.client.get(url)
        self.assertEqual(401, response.status_code)

    @override_switch('claim_a_facility', active=True)
    def test_claimed_facilities_list(self):
        self.client.post('/user-login/',
                         {"email": self.email,
                          "password": self.password},
                         format="json")
        url = reverse('facility-claimed')
        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual([], data)

        claim = FacilityClaim(
            facility=self.facility, contributor=self.contributor)
        claim.save()

        # A new claim should NOT appear in the claimed list
        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual([], data)

        claim.status = FacilityClaim.APPROVED
        claim.save()
        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual(1, len(data))


class DashboardListTests(APITestCase):
    def setUp(self):
        self.user_email = 'test@example.com'
        self.user_password = 'example123'
        self.user = User.objects.create(email=self.user_email)
        self.user.set_password(self.user_password)
        self.user.save()

        self.contributor = Contributor \
            .objects \
            .create(admin=self.user,
                    name='test contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='First List')

        self.source = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.list,
                    contributor=self.contributor)

        self.list_item = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    source=self.source,
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH)

        self.facility = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item)

        self.inactive_list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='Second List')

        Source.objects.create(
            source_type=Source.LIST,
            facility_list=self.inactive_list,
            is_active=False,
            contributor=self.contributor)

        self.private_list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='Third List')

        Source.objects.create(
            source_type=Source.LIST,
            facility_list=self.private_list,
            is_public=False,
            contributor=self.contributor)

        self.superuser_email = 'superuser@example.com'
        self.superuser_password = 'superuser'

        self.superuser = User \
            .objects \
            .create_superuser(self.superuser_email,
                              self.superuser_password)

        self.supercontributor = Contributor \
            .objects \
            .create(admin=self.superuser,
                    name='test super contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.superlist = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='Super List')

        Source.objects.create(
            source_type=Source.LIST,
            facility_list=self.superlist,
            contributor=self.supercontributor)

    def test_user_can_list_own_lists(self):
        self.client.login(email=self.user_email,
                          password=self.user_password)
        response = self.client.get('/api/facility-lists/')

        self.assertEqual(200, response.status_code)

        lists = response.json()

        # Ensure we get all three lists
        self.assertEqual(3, len(lists))
        # Ensure they are ordered newest first
        self.assertEqual(
            ['Third List', 'Second List', 'First List'],
            [l['name'] for l in lists])

    def test_superuser_can_list_own_lists(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.get('/api/facility-lists/')

        self.assertEqual(200, response.status_code)

        lists = response.json()

        # Ensure we get the one list
        self.assertEqual(1, len(lists))
        # Ensure it is the right one
        self.assertEqual('Super List', lists[0]['name'])

    def test_superuser_can_list_other_contributors_lists(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.get(
            '/api/facility-lists/?contributor={}'.format(
                self.contributor.id))

        self.assertEqual(200, response.status_code)

        lists = response.json()

        # Ensure we get all three lists, private and public,
        # active and inactive
        self.assertEqual(3, len(lists))
        self.assertEqual(
            ['Third List', 'Second List', 'First List'],
            [l['name'] for l in lists])

    def test_user_cannot_list_other_contributors_lists(self):
        # Regular users, even if they ask for lists by other
        # contributors, will just be given their own lists

        self.client.login(email=self.user_email,
                          password=self.user_password)
        response = self.client.get(
            '/api/facility-lists/?contributor={}'.format(
                self.supercontributor.id))

        self.assertEqual(200, response.status_code)

        lists = response.json()

        # Ensure we get the user's, not the superuser's, lists
        self.assertEqual(3, len(lists))
        self.assertEqual(
            ['Third List', 'Second List', 'First List'],
            [l['name'] for l in lists])

    def test_user_can_view_own_lists(self):
        self.client.login(email=self.user_email,
                          password=self.user_password)

        for l in [self.list, self.inactive_list, self.private_list]:
            response = self.client.get('/api/facility-lists/{}/'.format(l.id))
            self.assertEqual(200, response.status_code)
            self.assertEqual(l.name, response.json()['name'])

    def test_user_cannot_view_others_lists(self):
        self.client.login(email=self.user_email,
                          password=self.user_password)

        response = self.client.get(
            '/api/facility-lists/{}/'.format(
                self.superlist.id))

        self.assertEqual(404, response.status_code)

    def test_superuser_can_view_others_lists(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        superuser_lists = [self.superlist]
        user_lists = [self.list, self.inactive_list, self.private_list]

        for l in superuser_lists + user_lists:
            response = self.client.get('/api/facility-lists/{}/'.format(l.id))
            self.assertEqual(200, response.status_code)
            self.assertEqual(l.name, response.json()['name'])


class FacilityDeleteTest(APITestCase):
    def setUp(self):
        self.user_email = 'test@example.com'
        self.user_password = 'example123'
        self.user = User.objects.create(email=self.user_email)
        self.user.set_password(self.user_password)
        self.user.save()

        self.superuser_email = 'super@example.com'
        self.superuser_password = 'example123'
        self.superuser = User.objects.create_superuser(
            email=self.superuser_email,
            password=self.superuser_password)

        self.contributor = Contributor \
            .objects \
            .create(admin=self.user,
                    name='test contributor',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='First List')

        self.source = Source \
            .objects \
            .create(facility_list=self.list,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        self.list_item = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    source=self.source,
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH)

        self.facility = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item)
        self.facility_url = '/api/facilities/{}/'.format(self.facility.id)

        self.list_item.facility = self.facility
        self.list_item.save()

        self.facility_match = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.CONFIRMED,
                    facility=self.facility,
                    results="",
                    facility_list_item=self.list_item)

    def test_requires_auth(self):
        response = self.client.delete(self.facility_url)
        self.assertEqual(401, response.status_code)

    def test_requires_superuser(self):
        self.client.login(email=self.user_email,
                          password=self.user_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(403, response.status_code)

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)

    def test_delete(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)

        self.assertEqual(
            0, Facility.objects.filter(id=self.facility.id).count())
        self.assertEqual(
            0, FacilityMatch.objects.filter(facility=self.facility).count())

        self.list_item.refresh_from_db()
        self.assertEqual(
            FacilityListItem.DELETED, self.list_item.status)
        self.assertEqual(
            ProcessingAction.DELETE_FACILITY,
            self.list_item.processing_results[-1]['action'])
        self.assertEqual(
            self.facility.id,
            self.list_item.processing_results[-1]['deleted_oar_id'])

    def test_cant_delete_if_there_is_an_appoved_claim(self):
        FacilityClaim.objects.create(
            contributor=self.contributor,
            facility=self.facility,
            contact_person='test',
            email='test@test.com',
            phone_number='1234567890',
            status=FacilityClaim.APPROVED)
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(400, response.status_code)

    def test_unapproved_claims_are_deleted(self):
        FacilityClaim.objects.create(
            contributor=self.contributor,
            facility=self.facility,
            contact_person='test',
            email='test@test.com',
            phone_number='1234567890',
            status=FacilityClaim.PENDING)
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)
        self.assertEqual(
            0, FacilityClaim.objects.filter(facility=self.facility).count())

    def test_other_match_is_promoted(self):
        initial_facility_count = Facility.objects.all().count()
        list_2 = FacilityList \
            .objects \
            .create(header='header',
                    file_name='two',
                    name='Second List')

        source_2 = Source \
            .objects \
            .create(facility_list=list_2,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        list_item_2 = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    geocoded_point=Point(1, 1),
                    row_index=1,
                    status=FacilityListItem.MATCHED,
                    facility=self.facility,
                    source=source_2)

        match_2 = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility,
                    facility_list_item=list_item_2,
                    confidence=0.65,
                    results='')

        list_3 = FacilityList \
            .objects \
            .create(header='header',
                    file_name='three',
                    name='Third List')

        source_3 = Source \
            .objects \
            .create(facility_list=list_3,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        list_item_3 = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    geocoded_point=Point(2, 2),
                    source=source_3,
                    row_index=1,
                    status=FacilityListItem.MATCHED,
                    facility=self.facility)

        match_3 = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility,
                    facility_list_item=list_item_3,
                    confidence=0.85,
                    results='')

        alias = FacilityAlias.objects.create(
            facility=self.facility,
            oar_id='US1234567ABCDEF')

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)

        # We should have "promoted" the matched facility to replace the deleted
        # facility
        facility_count = Facility.objects.all().count()
        self.assertEqual(facility_count, initial_facility_count)
        self.assertEqual(2, FacilityAlias.objects.all().count())

        # We should have created a new alias
        new_alias = FacilityAlias.objects.exclude(
            oar_id='US1234567ABCDEF').first()
        self.assertEqual(FacilityAlias.DELETE, new_alias.reason)
        self.assertEqual(self.facility.id, new_alias.oar_id)

        # The line item previously matched to the deleted facility should now
        # be matched to a new facility
        match_3.refresh_from_db()
        list_item_2.refresh_from_db()
        self.assertEqual(match_3.facility, list_item_2.facility)
        match_2.refresh_from_db()
        self.assertEqual(match_3.facility, match_2.facility)

        # We should have replaced the alias with one pointing to the new
        # facility
        alias.refresh_from_db()
        self.assertEqual(match_3.facility, alias.facility)

    def test_other_inactive_match_is_promoted(self):
        initial_facility_count = Facility.objects.all().count()
        list_2 = FacilityList \
            .objects \
            .create(header='header',
                    file_name='two',
                    name='Second List')

        source_2 = Source \
            .objects \
            .create(facility_list=list_2,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        list_item_2 = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    geocoded_point=Point(1, 1),
                    row_index=1,
                    status=FacilityListItem.MATCHED,
                    facility=self.facility,
                    source=source_2)

        FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility,
                    facility_list_item=list_item_2,
                    confidence=0.65,
                    results='',
                    is_active=False)

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)

        # We should have "promoted" the matched facility to replace the deleted
        # facility
        facility_count = Facility.objects.all().count()
        self.assertEqual(facility_count, initial_facility_count)
        self.assertEqual(1, FacilityAlias.objects.all().count())
        alias = FacilityAlias.objects.first()
        self.assertEqual(list_item_2, alias.facility.created_from)

    def test_rejected_match_is_deleted_not_promoted(self):
        list_2 = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='Second List')

        source_2 = Source \
            .objects \
            .create(facility_list=list_2,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        list_item_2 = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    geocoded_point=Point(1, 1),
                    row_index=1,
                    status=FacilityListItem.MATCHED,
                    source=source_2)

        FacilityMatch \
            .objects \
            .create(status=FacilityMatch.REJECTED,
                    facility_list_item=list_item_2,
                    confidence=0,
                    facility=self.facility,
                    results='')

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)

        self.assertEqual(0, Facility.objects.all().count())
        self.assertEqual(0, FacilityMatch.objects.all().count())
        self.assertEqual(0, FacilityAlias.objects.all().count())

        list_item_2.refresh_from_db()
        self.assertEqual(FacilityListItem.DELETED, list_item_2.status)
        self.assertIsNone(list_item_2.facility)
        self.assertEqual(
            ProcessingAction.DELETE_FACILITY,
            list_item_2.processing_results[-1]['action'])

    def test_delete_with_alias(self):
        FacilityAlias.objects.create(facility=self.facility,
                                     oar_id='US1234567ABCDEF')
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)

    def test_delete_removed_item(self):
        self.facility_match.is_active = False
        self.facility_match.save()

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.delete(self.facility_url)
        self.assertEqual(204, response.status_code)

        self.assertEqual(
            0, Facility.objects.filter(id=self.facility.id).count())
        self.assertEqual(
            0, FacilityMatch.objects.filter(facility=self.facility).count())


class FacilityMergeTest(APITestCase):
    def setUp(self):
        self.user_email = 'test@example.com'
        self.user_password = 'example123'
        self.user = User.objects.create(email=self.user_email)
        self.user.set_password(self.user_password)
        self.user.save()

        self.superuser_email = 'super@example.com'
        self.superuser_password = 'example123'
        self.superuser = User.objects.create_superuser(
            email=self.superuser_email,
            password=self.superuser_password)

        self.contributor_1 = Contributor \
            .objects \
            .create(admin=self.user,
                    name='test contributor 1',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_1 = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='First List')

        self.source_1 = Source \
            .objects \
            .create(facility_list=self.list_1,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor_1)

        self.list_item_1 = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_1)

        self.facility_1 = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item_1)

        self.match_1 = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility_1,
                    facility_list_item=self.list_item_1,
                    confidence=0.85,
                    results='')

        self.list_item_1.facility = self.facility_1
        self.list_item_1.save()

        self.contributor_2 = Contributor \
            .objects \
            .create(admin=self.superuser,
                    name='test contributor 2',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_2 = FacilityList \
            .objects \
            .create(header='header',
                    file_name='two',
                    name='Second List')

        self.source_2 = Source \
            .objects \
            .create(facility_list=self.list_2,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor_2)

        self.list_item_2 = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_2)

        self.facility_2 = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item_2)

        self.match_2 = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility_2,
                    facility_list_item=self.list_item_2,
                    confidence=0.85,
                    results='')

        self.list_item_2.facility = self.facility_2
        self.list_item_2.save()

        self.existing_alias = FacilityAlias.objects.create(
            facility=self.facility_2,
            oar_id='US1234567ABCDEF')

        self.merge_endpoint = '/api/facilities/merge/'
        self.merge_url = '{}?target={}&merge={}'.format(
            self.merge_endpoint,
            self.facility_1.id,
            self.facility_2.id)

    def test_requires_auth(self):
        response = self.client.post(self.merge_url)
        self.assertEqual(401, response.status_code)

    def test_requires_superuser(self):
        self.client.login(email=self.user_email,
                          password=self.user_password)
        response = self.client.post(self.merge_url)
        self.assertEqual(403, response.status_code)

    def test_merge(self):
        original_facility_count = Facility.objects.all().count()
        original_alias_count = FacilityAlias.objects.all().count()
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.post(self.merge_url)
        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual(self.facility_1.id, data['id'])
        self.assertEqual(original_facility_count - 1,
                         Facility.objects.all().count())

        # The target models should not have changed
        self.list_item_1.refresh_from_db()
        self.assertEqual(self.list_item_1.facility, self.facility_1)
        self.match_1.refresh_from_db()
        self.assertEqual(self.match_1.facility, self.facility_1)
        self.assertEqual(self.match_1.facility_list_item, self.list_item_1)

        self.list_item_2.refresh_from_db()
        self.assertEqual(self.list_item_2.facility, self.facility_1)
        self.match_2.refresh_from_db()
        self.assertEqual(self.match_2.facility, self.facility_1)
        self.assertEqual(self.match_2.facility_list_item, self.list_item_2)
        self.assertEqual(ProcessingAction.MERGE_FACILITY,
                         self.list_item_2.processing_results[-1]['action'])

        self.facility_1.refresh_from_db()
        self.assertIn(self.source_1, self.facility_1.sources())
        self.assertIn(self.source_2, self.facility_1.sources())

        self.assertEqual(original_alias_count + 1,
                         FacilityAlias.objects.all().count())
        alias = FacilityAlias.objects.first()
        for alias in FacilityAlias.objects.all():
            self.assertEqual(self.facility_1, alias.facility)
            self.assertIn(alias.oar_id,
                          (self.facility_2.id, self.existing_alias.oar_id))
            self.assertEqual(FacilityAlias.MERGE, alias.reason)

    def test_required_params(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.post(self.merge_endpoint)
        self.assertEqual(400, response.status_code)
        data = json.loads(response.content)
        self.assertIn('target', data)
        self.assertIn('merge', data)

    def test_params_reference_existing_objects(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        url = '{}?target={}&merge={}'.format(self.merge_endpoint, 'foo', 'bar')
        response = self.client.post(url)
        self.assertEqual(400, response.status_code)
        data = json.loads(response.content)
        self.assertIn('target', data)
        self.assertIn('merge', data)

    def test_requires_distinct_params(self):
        self.client.login(email=self.user_email,
                          password=self.user_password)
        response = self.client.post(self.merge_url)
        self.assertEqual(403, response.status_code)

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        url = '{}?target={}&merge={}'.format(self.merge_endpoint,
                                             self.facility_1.id,
                                             self.facility_1.id)
        response = self.client.post(url)
        self.assertEqual(400, response.status_code)
        data = json.loads(response.content)
        self.assertIn('target', data)
        self.assertIn('merge', data)


class FacilitySplitTest(APITestCase):
    def setUp(self):
        self.user_one_email = 'one@example.com'
        self.user_one_password = 'example123'
        self.user_one = User.objects.create(email=self.user_one_email)
        self.user_one.set_password(self.user_one_password)
        self.user_one.save()

        self.user_two_email = 'two@example.com'
        self.user_two_password = 'example123'
        self.user_two = User.objects.create(email=self.user_two_email)
        self.user_two.set_password(self.user_two_password)
        self.user_two.save()

        self.superuser_email = 'super@example.com'
        self.superuser_password = 'example123'
        self.superuser = User.objects.create_superuser(
            email=self.superuser_email,
            password=self.superuser_password)

        self.contributor_one = Contributor \
            .objects \
            .create(admin=self.user_one,
                    name='test contributor 1',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_one = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='First List')

        self.source_one = Source \
            .objects \
            .create(facility_list=self.list_one,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor_one)

        self.list_item_one = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    geocoded_point=Point(0, 0),
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_one)

        self.facility_one = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item_one)

        self.match_one = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility_one,
                    facility_list_item=self.list_item_one,
                    confidence=0.85,
                    results='')

        self.list_item_one.facility = self.facility_one
        self.list_item_one.save()

        self.contributor_two = Contributor \
            .objects \
            .create(admin=self.user_two,
                    name='test contributor 2',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_two = FacilityList \
            .objects \
            .create(header='header',
                    file_name='two',
                    name='Second List')

        self.source_two = Source \
            .objects \
            .create(facility_list=self.list_two,
                    source_type=Source.LIST,
                    contributor=self.contributor_two)

        self.list_item_two = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    geocoded_point=Point(0, 0),
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_two)

        self.match_two = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility_one,
                    facility_list_item=self.list_item_two,
                    confidence=0.85,
                    results='')

        self.list_item_two.facility = self.facility_one
        self.list_item_two.save()

        self.split_url = '/api/facilities/{}/split/'.format(
            self.facility_one.id,
        )

    def test_split_is_unauthorized_for_anonymous_users(self):
        get_response = self.client.get(self.split_url)
        self.assertEqual(get_response.status_code, 401)

        post_response = self.client.post(self.split_url)
        self.assertEqual(post_response.status_code, 401)

    def test_split_is_unauthorized_for_non_administrators(self):
        self.client.login(email=self.user_one_email,
                          password=self.user_one_password)
        get_response = self.client.get(self.split_url)
        self.assertEqual(get_response.status_code, 403)

        post_response = self.client.post(self.split_url)
        self.assertEqual(post_response.status_code, 403)

    def test_get_returns_facility_details_with_match_data(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        get_response = self.client.get(self.split_url)
        self.assertEqual(get_response.status_code, 200)

        data = json.loads(get_response.content)
        self.assertEqual(
            len(data['properties']['matches']),
            1,
        )

        self.assertEqual(
            data['properties']['matches'][0]['match_id'],
            self.match_two.id,
        )

    def test_post_returns_bad_request_without_match_id(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        post_response = self.client.post(self.split_url, {})
        self.assertEqual(post_response.status_code, 400)

    def test_post_creates_a_new_facility(self):
        initial_facility_count = Facility \
            .objects \
            .all() \
            .count()
        self.assertEqual(initial_facility_count, 1)

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        post_response = self.client.post(self.split_url,
                                         {'match_id': self.match_two.id})
        self.assertEqual(post_response.status_code, 200)

        updated_facility_count = Facility \
            .objects \
            .all() \
            .count()

        self.assertEqual(updated_facility_count, 2)

    def test_post_decrements_prior_facility_matches(self):
        self.assertEqual(
            self.facility_one.facilitymatch_set.count(),
            2,
        )

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        post_response = self.client.post(self.split_url,
                                         {'match_id': self.match_two.id})
        self.assertEqual(post_response.status_code, 200)

        self.facility_one.refresh_from_db()

        self.assertEqual(
            self.facility_one.facilitymatch_set.count(),
            1,
        )

    def test_post_returns_match_id_and_new_oar_id(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        post_response = self.client.post(self.split_url,
                                         {'match_id': self.match_two.id})
        self.assertEqual(post_response.status_code, 200)

        data = json.loads(post_response.content)

        self.assertEqual(
            self.match_two.id,
            data['match_id'],
        )

        self.match_two.refresh_from_db()

        self.assertEqual(
            self.match_two.facility.id,
            data['new_oar_id'],
        )


class FacilityMatchPromoteTest(APITestCase):
    def setUp(self):
        self.user_one_email = 'one@example.com'
        self.user_one_password = 'example123'
        self.user_one = User.objects.create(email=self.user_one_email)
        self.user_one.set_password(self.user_one_password)
        self.user_one.save()

        self.user_two_email = 'two@example.com'
        self.user_two_password = 'example123'
        self.user_two = User.objects.create(email=self.user_two_email)
        self.user_two.set_password(self.user_two_password)
        self.user_two.save()

        self.superuser_email = 'super@example.com'
        self.superuser_password = 'example123'
        self.superuser = User.objects.create_superuser(
            email=self.superuser_email,
            password=self.superuser_password)

        self.contributor_one = Contributor \
            .objects \
            .create(admin=self.user_one,
                    name='test contributor 1',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_one = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='First List')

        self.source_one = Source \
            .objects \
            .create(facility_list=self.list_one,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor_one)

        self.address_one = 'Address One'
        self.address_two = 'Address Two'
        self.name_one = 'Name One'
        self.name_two = 'Name Two'
        self.country_code_one = 'US'
        self.country_code_two = 'CA'
        self.location_one = Point(1, 1)
        self.location_two = Point(2, 2)

        self.list_item_one = FacilityListItem \
            .objects \
            .create(name=self.name_one,
                    address=self.name_one,
                    country_code=self.country_code_one,
                    row_index=1,
                    geocoded_point=self.location_one,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_one)

        self.facility_one = Facility \
            .objects \
            .create(name=self.name_one,
                    address=self.address_one,
                    country_code=self.country_code_one,
                    location=self.location_one,
                    created_from=self.list_item_one)

        self.match_one = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility_one,
                    facility_list_item=self.list_item_one,
                    confidence=0.85,
                    results='')

        self.list_item_one.facility = self.facility_one
        self.list_item_one.save()

        self.contributor_two = Contributor \
            .objects \
            .create(admin=self.user_two,
                    name='test contributor 2',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list_two = FacilityList \
            .objects \
            .create(header='header',
                    file_name='two',
                    name='Second List')

        self.source_two = Source \
            .objects \
            .create(facility_list=self.list_two,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor_two)

        self.list_item_two = FacilityListItem \
            .objects \
            .create(name=self.name_two,
                    address=self.address_two,
                    country_code=self.country_code_two,
                    row_index=1,
                    geocoded_point=self.location_two,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_two)

        self.match_two = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility_one,
                    facility_list_item=self.list_item_two,
                    confidence=0.85,
                    results='')

        self.list_item_three = FacilityListItem \
            .objects \
            .create(name='third facility',
                    address='third address',
                    country_code='US',
                    source=self.source_one,
                    row_index=2,
                    geocoded_point=Point(3, 3),
                    status=FacilityListItem.MATCHED)

        self.other_facility = Facility \
            .objects \
            .create(name='third facility',
                    address='third address',
                    country_code='US',
                    location=Point(3, 3),
                    created_from=self.list_item_three)

        self.list_item_three.facility = self.other_facility
        self.list_item_three.save()

        self.list_item_two.facility = self.facility_one
        self.list_item_two.save()

        self.promote_url = '/api/facilities/{}/promote/'.format(
            self.facility_one.id,
        )

    def test_promote_is_unauthorized_for_anon_users(self):
        post_response = self.client.post(self.promote_url)
        self.assertEqual(post_response.status_code, 401)

    def test_promote_is_unauth_for_non_admins(self):
        self.client.login(email=self.user_one_email,
                          password=self.user_one_password)
        post_response = self.client.post(self.promote_url)
        self.assertEqual(post_response.status_code, 403)

    def test_returns_error_if_list_item_not_in_matched_status(self):
        self.list_item_two.status = FacilityListItem.PARSED
        self.list_item_two.save()

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        post_response = self.client.post(self.promote_url,
                                         {'match_id': self.match_two.id})
        self.assertEqual(post_response.status_code, 400)

    def test_returns_error_if_match_is_not_to_facility(self):
        self.match_two.facility = self.other_facility
        self.match_two.facility_list_item = self.list_item_three
        self.match_two.save()
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        post_response = self.client.post(self.promote_url,
                                         {'match_id': self.match_two.id})
        self.assertEqual(post_response.status_code, 400)

    def test_returns_error_if_facility_created_from_match_list_item(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        post_response = self.client.post(self.promote_url,
                                         {'match_id': self.match_one.id})
        self.assertEqual(post_response.status_code, 400)

    def test_updates_facility_if_list_item_is_in_matched_status(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        post_response = self.client.post(self.promote_url,
                                         {'match_id': self.match_two.id})
        self.assertEqual(post_response.status_code, 200)

        self.facility_one.refresh_from_db()

        self.assertEqual(
            self.facility_one.name,
            self.list_item_two.name,
        )

        self.assertEqual(
            self.facility_one.address,
            self.list_item_two.address,
        )

        self.assertEqual(
            self.facility_one.country_code,
            self.list_item_two.country_code,
        )

        self.assertEqual(
            self.facility_one.location,
            self.list_item_two.geocoded_point,
        )

        reason = 'Promoted item {} in list {} over item {} in list {}'.format(
            self.list_item_two.id,
            self.list_two.id,
            self.list_item_one.id,
            self.list_one.id,
        )

        self.assertEqual(
            Facility.history.first().history_change_reason,
            reason,
        )


class PermissionsTests(TestCase):
    class MockRequest(object):
        def __init__(self, referer):
            self.META = {}
            if referer is not None:
                self.META['HTTP_REFERER'] = referer

    @override_settings(ALLOWED_HOSTS=['.allowed.org'])
    def test_is_referer_allowed(self):
        def check_host(url):
            return referring_host_is_allowed(
                referring_host(
                    PermissionsTests.MockRequest(url)))

        self.assertTrue(check_host('http://allowed.org'))
        self.assertTrue(check_host('http://subdomain.allowed.org'))
        self.assertTrue(check_host('http://allowed.org:6543'))
        self.assertTrue(check_host('http://allowed.org:6543/api/countries'))

        self.assertFalse(check_host('http://notallowed.org'))
        self.assertFalse(check_host('http://allowed.com'))
        self.assertFalse(check_host(''))
        self.assertFalse(check_host(None))
        self.assertFalse(check_host('foo'))


class RequestLogMiddlewareTest(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'password'
        self.name = 'Test User'
        self.user = User(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        Contributor.objects.create(name=self.name, admin=self.user)

    def test_request_without_token_is_not_logged(self):
        self.client.login(email=self.email, password=self.password)
        response = self.client.get(reverse('facility-list-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(0, RequestLog.objects.filter(user=self.user).count())

    def test_request_with_token_is_logged(self):
        token = Token.objects.create(user=self.user)
        path = reverse('facility-list-list')
        response = self.client.get(
            path,
            HTTP_AUTHORIZATION='Token {0}'.format(token))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(1, RequestLog.objects.filter(user=self.user).count())

        log = RequestLog.objects.first()
        self.assertEqual(self.user, log.user)
        self.assertEqual(str(token), log.token)
        self.assertEqual('GET', log.method)
        self.assertEqual(path, log.path)
        self.assertEqual(200, log.response_code)


class FacilityClaimChangesTest(TestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'password'
        self.name = 'Test User'
        self.user = User(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.contributor = Contributor.objects.create(
            name=self.name, admin=self.user)

        self.facility_list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='one')

        self.source = Source \
            .objects \
            .create(facility_list=self.facility_list,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        self.list_item = FacilityListItem \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source)

        self.facility = Facility \
            .objects \
            .create(name=self.list_item.name,
                    address=self.list_item.address,
                    country_code=self.list_item.country_code,
                    location=Point(0, 0),
                    created_from=self.list_item)

        self.claim = FacilityClaim.objects.create(
            contributor=self.contributor,
            facility=self.facility,
            facility_name_english='Facility Name',
            facility_name_native_language='Објекат Име'
        )

    def test_no_changes(self):
        self.assertIsNone(self.claim.get_changes())

    def test_changes(self):
        prev_name = self.claim.facility_name_english
        new_name = 'Changed'
        self.claim.facility_name_english = new_name
        self.claim.save()
        changes = self.claim.get_changes()
        self.assertIsNotNone(changes)
        self.assertEqual(1, len(changes))
        self.assertEqual('facility_name_english', changes[0]['name'])
        self.assertEqual(prev_name, changes[0]['previous'])
        self.assertEqual(new_name, changes[0]['current'])
        self.assertEqual(
            'facility name in English', changes[0]['verbose_name'])

    def test_do_not_include_field_change(self):
        self.claim.facility_name = 'Changed'
        self.claim.save()
        changes = self.claim.get_changes(include='foo')
        self.assertIsNone(changes)

    def test_non_public_changes(self):
        self.claim.facility_phone_number = 'Changed'
        self.claim.point_of_contact_person_name = 'Changed'
        self.claim.office_official_name = 'Changed'
        self.claim.office_address = 'Changed'
        self.claim.office_country_code = 'CN'
        self.claim.office_phone_number = 'Changed'
        self.claim.save()
        self.assertIsNone(self.claim.get_changes())

        self.claim.office_info_publicly_visible = True
        self.claim.office_official_name = 'Changed again'
        self.claim.office_address = 'Changed again'
        self.claim.office_country_code = 'GB'
        self.claim.office_phone_number = 'Changed again'
        self.claim.save()
        changes = self.claim.get_changes()
        self.assertIsNotNone(changes)
        field_names = [c['name'] for c in changes]
        self.assertIn('office_official_name', field_names)
        self.assertIn('office_address', field_names)
        self.assertIn('office_country_code', field_names)
        self.assertIn('office_phone_number', field_names)
        self.assertNotIn('facility_phone_number', field_names)
        self.assertNotIn('point_of_contact_person_name', field_names)

    def test_change_serializers(self):
        self.claim.parent_company = self.contributor
        self.claim.save()
        changes = self.claim.get_changes()
        self.assertIsNotNone(changes)
        self.assertEqual(1, len(changes))
        change = changes[0]
        self.assertEqual(change['name'], 'parent_company')
        self.assertEqual(change['current'], self.name)


class FacilityClaimSerializerTests(TestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'password'
        self.name = 'Test User'
        self.user = User(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.contributor = Contributor.objects.create(
            name=self.name, admin=self.user)

        self.facility_list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='one')

        self.source = Source \
            .objects \
            .create(facility_list=self.facility_list,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        self.list_item = FacilityListItem \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source)

        self.facility = Facility \
            .objects \
            .create(name=self.list_item.name,
                    address=self.list_item.address,
                    country_code=self.list_item.country_code,
                    location=Point(0, 0),
                    created_from=self.list_item)

        self.claim = FacilityClaim.objects.create(
            contributor=self.contributor,
            facility=self.facility,
            status=FacilityClaim.APPROVED,
        )

    def test_product_and_production_options_are_serialized(self):
        data = ApprovedFacilityClaimSerializer(self.claim).data

        self.assertIn('product_type_choices', data)
        self.assertIsNotNone(data['product_type_choices'])
        self.assertNotEqual([], data['product_type_choices'])

        self.assertIn('production_type_choices', data)
        self.assertIsNotNone(data['production_type_choices'])
        self.assertNotEqual([], data['production_type_choices'])

    def test_product_and_production_values_from_claims_are_included(self):
        self.claim.facility_product_types = ['A', 'B']
        self.claim.facility_production_types = ['C', 'D']
        self.claim.save()
        data = ApprovedFacilityClaimSerializer(self.claim).data

        product_types = data['product_type_choices']
        self.assertIn(('A', 'A'), product_types)
        self.assertEqual(('A', 'A'), product_types[0])
        self.assertIn(('B', 'B'), product_types)

        production_types = data['production_type_choices']
        self.assertIn(('C', 'C'), production_types)
        self.assertEqual(('C', 'C'), production_types[0])
        self.assertIn(('D', 'D'), production_types)


class LogDownloadTests(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'password'
        self.name = 'Test User'
        self.user = User(email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.path = reverse('log_download')

    def test_requires_login(self):
        response = self.client.post(self.path)
        self.assertEqual(401, response.status_code)

    def test_requires_arguments(self):
        self.client.login(email=self.email, password=self.password)
        response = self.client.post(self.path)
        self.assertEqual(400, response.status_code)

        content = json.loads(response.content)
        self.assertIn(LogDownloadQueryParams.PATH, content)
        self.assertIn(LogDownloadQueryParams.RECORD_COUNT, content)

    def test_requires_post(self):
        self.client.login(email=self.email, password=self.password)
        url = '{}?{}={}&{}={}'.format(
            self.path,
            LogDownloadQueryParams.PATH,
            '/a/path/',
            LogDownloadQueryParams.RECORD_COUNT,
            1,
        )
        response = self.client.get(url)
        self.assertEqual(405, response.status_code)

    def test_creates_record(self):
        DownloadLog.objects.all().delete()
        self.client.login(email=self.email, password=self.password)
        expected_path = '/a/path'
        expected_record_count = 42
        url = '{}?{}={}&{}={}'.format(
            self.path,
            LogDownloadQueryParams.PATH,
            expected_path,
            LogDownloadQueryParams.RECORD_COUNT,
            expected_record_count,
        )
        response = self.client.post(url)
        self.assertEqual(204, response.status_code)

        self.assertEqual(1, DownloadLog.objects.all().count())
        log = DownloadLog.objects.first()
        self.assertEqual(expected_path, log.path)
        self.assertEqual(expected_record_count, log.record_count)


class TilePermissionsTest(APITestCase):
    def setUp(self):
        self.tile_path = reverse('tile', kwargs={
            'layer': 'facilitygrid',
            'cachekey': '1567700347-1-95f951f7',
            'z': 6, 'x': 15, 'y': 29,
            'ext': 'pbf',
        })

    @override_settings(ALLOWED_HOSTS=['testserver', '.allowed.org'])
    @override_switch('vector_tile', active=True)
    def test_allowed_hosts_can_fetch_tiles(self):
        response = self.client.get(self.tile_path, {},
                                   HTTP_REFERER='http://allowed.org/')
        self.assertEqual(200, response.status_code)

    def test_disallowed_hosts_cannot_fetch_tiles(self):
        response = self.client.get(self.tile_path)
        self.assertEqual(401, response.status_code)


class FacilityAPITestCaseBase(APITestCase):
    def setUp(self):
        self.user_email = 'test@example.com'
        self.user_password = 'example123'
        self.user = User.objects.create(email=self.user_email)
        self.user.set_password(self.user_password)
        self.user.save()

        self.superuser_email = 'super@example.com'
        self.superuser_password = 'example123'
        self.superuser = User.objects.create_superuser(
            email=self.superuser_email,
            password=self.superuser_password)

        self.contributor = Contributor \
            .objects \
            .create(admin=self.user,
                    name='test contributor 1',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='one',
                    name='First List')

        self.source = Source \
            .objects \
            .create(facility_list=self.list,
                    source_type=Source.LIST,
                    is_active=True,
                    is_public=True,
                    contributor=self.contributor)

        self.list_item = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    geocoded_point=Point(0, 0),
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source)

        self.facility = Facility \
            .objects \
            .create(name='Name',
                    address='Address',
                    country_code='US',
                    location=Point(0, 0),
                    created_from=self.list_item)

        self.match = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility,
                    facility_list_item=self.list_item,
                    confidence=0.85,
                    results='')

        self.list_item.facility = self.facility
        self.list_item.save()


class UpdateLocationTest(FacilityAPITestCaseBase):
    def setUp(self):
        super(UpdateLocationTest, self).setUp()
        self.url = reverse('facility-update-location',
                           kwargs={'pk': self.facility.id})

    def test_requires_auth(self):
        response = self.client.post(self.url)
        self.assertEqual(401, response.status_code)

    def test_requires_superuser(self):
        self.client.login(email=self.user_email,
                          password=self.user_password)
        response = self.client.post(self.url)
        self.assertEqual(403, response.status_code)

    def test_facility_exisits(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        self.url = reverse('facility-update-location',
                           kwargs={'pk': 'DOES_NOT_EXIST'})
        response = self.client.post(self.url)
        self.assertEqual(404, response.status_code)

    def test_required_arguments(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)
        response = self.client.post(self.url)
        self.assertEqual(400, response.status_code)
        data = json.loads(response.content)
        self.assertIn('lat', data)
        self.assertIn('lng', data)

    def test_valid_arguments(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        response = self.client.post(self.url, {'lat': 1000, 'lng': 0})
        self.assertEqual(400, response.status_code)
        data = json.loads(response.content)
        self.assertIn('lat', data)
        self.assertNotIn('lng', data)

        response = self.client.post(self.url, {'lat': 0, 'lng': 1000})
        self.assertEqual(400, response.status_code)
        data = json.loads(response.content)
        self.assertIn('lng', data)
        self.assertNotIn('lat', data)

    def test_updates_location(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        response = self.client.post(
            self.url, {
                UpdateLocationParams.LAT: 41,
                UpdateLocationParams.LNG: 43,
                UpdateLocationParams.NOTES: 'A note',
                UpdateLocationParams.CONTRIBUTOR_ID: self.contributor.id,
            })
        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual(data['id'], self.facility.id)
        self.assertEqual(data['geometry']['coordinates'], [43.0, 41.0])

        facility_locations = FacilityLocation.objects.filter(
            facility=self.facility)
        self.assertTrue(facility_locations.count() == 1)
        facility_location = facility_locations.first()
        self.assertEqual(facility_location.facility, self.facility)
        self.assertEqual(facility_location.created_by, self.superuser)
        self.assertEqual(facility_location.location.x, 43.0)
        self.assertEqual(facility_location.location.y, 41.0)
        self.assertEqual(facility_location.contributor, self.contributor)
        self.assertEqual(facility_location.notes, 'A note')


class SerializeOtherLocationsTest(FacilityAPITestCaseBase):
    def setUp(self):
        super(SerializeOtherLocationsTest, self).setUp()
        self.url = '/api/facilities/{}'.format(self.facility.id)

        self.other_user_email = 'hello@example.com'
        self.other_user_password = 'example123'
        self.other_user = User.objects.create(email=self.other_user_email)
        self.other_user.set_password(self.other_user_password)
        self.other_user.save()

        self.other_contributor = Contributor \
            .objects \
            .create(admin=self.other_user,
                    name='test contributor 2',
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.other_list = FacilityList \
            .objects \
            .create(header='header',
                    file_name='two',
                    name='Second List')

        self.other_source = Source \
            .objects \
            .create(facility_list=self.other_list,
                    is_active=True,
                    is_public=True,
                    contributor=self.other_contributor)

        self.other_list_item = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    geocoded_point=Point(5, 5),
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.other_source)

        self.other_match = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.CONFIRMED,
                    facility=self.facility,
                    facility_list_item=self.other_list_item,
                    confidence=0.85,
                    results='')

    def test_excludes_match_if_geocoded_point_is_none(self):
        self.other_list_item.geocoded_point = None
        self.other_list_item.save()
        response = self.client.get(
            '/api/facilities/{}/'.format(self.facility.id)
        )
        data = json.loads(response.content)
        self.assertEqual(
            len(data['properties']['other_locations']),
            0,
        )

    def test_serializes_other_match_location_in_facility_details(self):
        response = self.client.get(
            '/api/facilities/{}/'.format(self.facility.id)
        )

        data = json.loads(response.content)
        self.assertEqual(
            len(data['properties']['other_locations']),
            1,
        )

        self.assertIsNone(
            data['properties']['other_locations'][0]['notes'],
        )

        self.assertEqual(
            data['properties']['other_locations'][0]['lat'],
            5,
        )

    def test_does_not_serialize_inactive_list_item_matches(self):
        self.other_source.is_active = False
        self.other_source.save()
        response = self.client.get(
            '/api/facilities/{}/'.format(self.facility.id)
        )

        data = json.loads(response.content)
        self.assertEqual(
            len(data['properties']['other_locations']),
            0,
        )

    def test_does_not_serialize_non_public_list_item_matches(self):
        self.other_source.is_public = False
        self.other_source.save()
        response = self.client.get(
            '/api/facilities/{}/'.format(self.facility.id)
        )

        data = json.loads(response.content)
        self.assertEqual(
            len(data['properties']['other_locations']),
            0,
        )

    def test_serializes_other_locations_in_facility_details(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        self.client.post(
            '/api/facilities/{}/update-location/'.format(self.facility.id), {
                UpdateLocationParams.LAT: 41,
                UpdateLocationParams.LNG: 43,
                UpdateLocationParams.NOTES: 'A note',
                UpdateLocationParams.CONTRIBUTOR_ID: self.contributor.id,
            })

        self.client.logout()

        response = self.client.get(
            '/api/facilities/{}/'.format(self.facility.id)
        )

        data = json.loads(response.content)
        self.assertEqual(
            len(data['properties']['other_locations']),
            2,
        )

        self.assertEqual(
            data['properties']['other_locations'][0]['notes'],
            'A note',
        )

    def test_serializes_other_location_without_note_or_contributor(self):
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        self.client.post(
            '/api/facilities/{}/update-location/'.format(self.facility.id), {
                UpdateLocationParams.LAT: 41,
                UpdateLocationParams.LNG: 43,
                UpdateLocationParams.NOTES: '',
            })

        self.client.logout()

        response = self.client.get(
            '/api/facilities/{}/'.format(self.facility.id)
        )

        data = json.loads(response.content)
        self.assertEqual(
            len(data['properties']['other_locations']),
            2,
        )

        self.assertEqual(
            data['properties']['other_locations'][0]['notes'],
            '',
        )

        self.assertEqual(
            data['properties']['other_locations'][0]['contributor_name'],
            None,
        )


class FacilityHistoryEndpointTest(FacilityAPITestCaseBase):
    def setUp(self):
        super(FacilityHistoryEndpointTest, self).setUp()
        self.history_url = '/api/facilities/{}/history/'.format(
            self.facility.id
        )

        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        self.list_two = FacilityList \
            .objects \
            .create(header='header',
                    file_name='two',
                    name='Second List')

        self.source_two = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.list_two,
                    contributor=self.contributor)

        self.list_item_two = FacilityListItem \
            .objects \
            .create(name='Item',
                    address='Address',
                    country_code='US',
                    row_index=1,
                    geocoded_point=Point(0, 0),
                    status=FacilityListItem.CONFIRMED_MATCH,
                    source=self.source_two)

        self.facility_two = Facility \
            .objects \
            .create(name='Name Two',
                    address='Address Two',
                    country_code='US',
                    location=Point(5, 5),
                    created_from=self.list_item_two)

        self.match_two = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.AUTOMATIC,
                    facility=self.facility_two,
                    facility_list_item=self.list_item_two,
                    confidence=0.85,
                    results='')

        self.list_item_two.facility = self.facility_two
        self.list_item_two.save()

        self.list_for_confirm_or_remove = FacilityList \
            .objects \
            .create(header='List for confirm or reject',
                    file_name='list for confirm or reject',
                    name='List for confirm or reject')

        self.source_for_confirm_or_remove = Source \
            .objects \
            .create(source_type=Source.LIST,
                    facility_list=self.list_for_confirm_or_remove,
                    contributor=self.contributor)

        self.list_item_for_confirm_or_remove = FacilityListItem \
            .objects \
            .create(name='List item for confirmed match',
                    address='Address for confirmed match',
                    country_code='US',
                    row_index=2,
                    geocoded_point=Point(12, 34),
                    status=FacilityListItem.POTENTIAL_MATCH,
                    source=self.source_for_confirm_or_remove)

        self.match_for_confirm_or_remove = FacilityMatch \
            .objects \
            .create(status=FacilityMatch.PENDING,
                    facility_list_item=self.list_item_for_confirm_or_remove,
                    facility=self.facility_two,
                    confidence=0.65,
                    results='')

        self.facility_two_history_url = '/api/facilities/{}/history/'.format(
            self.facility_two.id
        )

    @override_flag(FeatureGroups.CAN_GET_FACILITY_HISTORY, active=True)
    def test_serializes_deleted_facility_history(self):
        delete_facility_url = '/api/facilities/{}/'.format(self.facility.id)
        delete_response = self.client.delete(delete_facility_url)

        self.assertEqual(
            delete_response.status_code,
            204,
        )

        response = self.client.get(self.history_url)
        data = json.loads(response.content)

        self.assertEqual(
            data[0]['action'],
            'DELETE',
        )

        self.assertIn(
            'Deleted',
            data[0]['detail'],
        )

        self.assertEqual(
            len(data),
            4,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_serializes_facility_location_change(self):
        location_change_url = '/api/facilities/{}/update-location/' \
            .format(self.facility.id)
        location_change_response = self.client.post(
            location_change_url, {
                UpdateLocationParams.LAT: 41,
                UpdateLocationParams.LNG: 43,
            })

        self.assertEqual(location_change_response.status_code, 200)

        response = self.client.get(self.history_url)
        data = json.loads(response.content)

        self.assertEqual(
            data[0]['action'],
            'UPDATE',
        )

        self.assertIn(
            'FacilityLocation',
            data[0]['detail'],
        )

        self.assertEqual(
            data[0]['changes']['location']['new']['coordinates'][0],
            43,
        )

        self.assertEqual(
            data[0]['changes']['location']['old']['coordinates'][0],
            0,
        )

        self.assertEqual(
            len(data),
            3,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_serializes_facility_merge(self):
        merge_facilities_url = '/api/facilities/merge/?target={}&merge={}' \
            .format(self.facility_two.id, self.facility.id)

        merge_facilities_response = self.client.post(
            merge_facilities_url,
        )

        self.assertEqual(merge_facilities_response.status_code, 200)

        response = self.client.get(self.history_url)
        data = json.loads(response.content)

        self.assertEqual(
            data[0]['action'],
            'MERGE',
        )

        self.assertEqual(
            data[0]['detail'],
            'Merged with {}'.format(self.facility_two.id)
        )

        self.assertEqual(
            len(data),
            3,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_serializes_facility_match_promotion(self):
        merge_facilities_url = '/api/facilities/merge/?target={}&merge={}' \
            .format(self.facility_two.id, self.facility.id)

        merge_facilities_response = self.client.post(
            merge_facilities_url,
        )

        self.assertEqual(merge_facilities_response.status_code, 200)

        self.facility_two.refresh_from_db()

        promote_facility_url = '/api/facilities/{}/promote/'.format(
            self.facility_two.id)

        promote_facility_data = {
            'match_id': self.match.id,
        }

        promote_facility_response = self.client.post(
            promote_facility_url,
            promote_facility_data,
        )

        self.assertEqual(promote_facility_response.status_code, 200)

        response = self.client.get(self.facility_two_history_url)
        data = json.loads(response.content)

        self.assertEqual(
            data[0]['action'],
            'UPDATE',
        )

        self.assertIn(
            'Promoted',
            data[0]['detail'],
        )

        self.assertEqual(
            data[0]['changes']['location']['new']['coordinates'][0],
            0,
        )

        self.assertEqual(
            data[0]['changes']['location']['old']['coordinates'][0],
            5,
        )

        self.assertEqual(
            data[0]['changes']['name']['new'],
            self.list_item.name,
        )

        self.assertEqual(
            data[0]['changes']['name']['old'],
            'Name Two',
        )

        self.assertEqual(
            data[0]['changes']['address']['new'],
            self.list_item.address,
        )

        self.assertEqual(
            data[0]['changes']['address']['old'],
            'Address Two',
        )

        self.assertEqual(
            len(data),
            3,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_serializes_facility_match_split(self):
        merge_facilities_url = '/api/facilities/merge/?target={}&merge={}' \
            .format(self.facility_two.id, self.facility.id)

        merge_facilities_response = self.client.post(
            merge_facilities_url,
        )

        self.assertEqual(merge_facilities_response.status_code, 200)

        self.facility_two.refresh_from_db()

        split_facility_url = '/api/facilities/{}/split/'.format(
            self.facility_two.id)

        split_facility_data = {
            'match_id': self.match.id,
        }

        split_facility_response = self.client.post(
            split_facility_url,
            split_facility_data,
        )

        self.assertEqual(split_facility_response.status_code, 200)

        self.match.refresh_from_db()

        response = self.client.get(self.facility_two_history_url)
        data = json.loads(response.content)

        self.assertEqual(
            data[0]['action'],
            'SPLIT',
        )

        self.assertEqual(
            data[0]['detail'],
            '{} was split from {}'.format(
                self.match.facility.id,
                self.facility_two.id,
            )
        )

        self.assertEqual(
            len(data),
            3,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_handles_request_for_invalid_facility_id(self):
        invalid_history_url = '/api/facilities/hello/history/'
        invalid_history_response = self.client.get(invalid_history_url)
        self.assertEqual(invalid_history_response.status_code, 404)

    @override_flag('can_get_facility_history', active=True)
    def test_includes_association_for_automatic_match(self):
        automatic_match_response = self.client.get(
            self.facility_two_history_url,
        )

        data = json.loads(automatic_match_response.content)

        self.assertEqual(
            data[0]['action'],
            'ASSOCIATE',
        )

        self.assertEqual(
            data[0]['detail'],
            'Associate facility {} with contributor {} via list {}'.format(
                self.facility_two.id,
                self.contributor.name,
                self.list_two.name,
            ),
        )

        self.assertEqual(
            len(data),
            2,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_associate_appears_after_create_in_history_data(self):
        history_response = self.client.get(
            self.history_url,
        )

        self.assertEqual(
            history_response.status_code,
            200,
        )

        data = json.loads(history_response.content)

        self.assertEqual(
            data[0]['action'],
            'ASSOCIATE',
        )

        self.assertEqual(
            data[1]['action'],
            'CREATE',
        )

        self.assertEqual(
            len(data),
            2,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_includes_association_for_confirmed_match(self):
        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        confirm_url = '/api/facility-lists/{}/confirm/'.format(
            self.list_for_confirm_or_remove.id,
        )

        confirm_data = {
            'list_item_id': self.list_item_for_confirm_or_remove.id,
            'facility_match_id': self.match_for_confirm_or_remove.id,
        }

        confirm_response = self.client.post(
            confirm_url,
            confirm_data,
        )

        self.assertEqual(
            confirm_response.status_code,
            200,
        )

        confirmed_match_response = self.client.get(
            self.facility_two_history_url,
        )

        data = json.loads(confirmed_match_response.content)

        self.assertEqual(
            data[0]['action'],
            'ASSOCIATE',
        )

        self.assertEqual(
            data[0]['detail'],
            'Associate facility {} with contributor {} via list {}'.format(
                self.facility_two.id,
                self.contributor.name,
                self.list_for_confirm_or_remove.name,
            ),
        )

        self.assertEqual(
            len(data),
            3,
        )

    @override_flag('can_get_facility_history', active=True)
    def test_includes_dissociation_record_when_match_is_severed(self):
        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        confirm_url = '/api/facility-lists/{}/confirm/'.format(
            self.list_for_confirm_or_remove.id,
        )

        confirm_data = {
            'list_item_id': self.list_item_for_confirm_or_remove.id,
            'facility_match_id': self.match_for_confirm_or_remove.id,
        }

        confirm_response = self.client.post(
            confirm_url,
            confirm_data,
        )

        self.assertEqual(
            confirm_response.status_code,
            200,
        )

        remove_item_url = '/api/facility-lists/{}/remove/'.format(
            self.list_for_confirm_or_remove.id,
        )

        remove_item_data = {
            'list_item_id': self.list_item_for_confirm_or_remove.id,
        }

        remove_item_response = self.client.post(
            remove_item_url,
            remove_item_data,
        )

        self.assertEqual(
            remove_item_response.status_code,
            200,
        )

        removed_match_response = self.client.get(
            self.facility_two_history_url,
        )

        data = json.loads(removed_match_response.content)

        self.assertEqual(
            data[0]['action'],
            'DISSOCIATE',
        )

        self.assertEqual(
            data[0]['detail'],
            'Dissociate facility {} from contributor {} via list {}'.format(
                self.facility_two.id,
                self.contributor.name,
                self.list_for_confirm_or_remove.name,
            ),
        )

        self.assertEqual(
            len(data),
            4,
        )

    @override_flag('can_get_facility_history', active=True)
    @override_switch('claim_a_facility', active=True)
    def test_includes_entry_for_claim_approval(self):
        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        claim_facility_url = '/api/facilities/{}/claim/'.format(
            self.facility_two.id,
        )

        claim_facility_data = {
            'contact_person': 'contact_person',
            'job_title': 'job_title',
            'company_name': 'company_name',
            'email': 'email@example.com',
            'phone_number': 1234567,
            'website': 'https://example.com',
            'facility_description': 'facility_description',
            'verification_method': 'verification_method',
            'preferred_contact_method': 'email',
        }

        claim_response = self.client.post(
            claim_facility_url,
            claim_facility_data,
        )

        self.assertEqual(
            claim_response.status_code,
            200,
        )

        self.client.logout()
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        claim = FacilityClaim.objects.first()

        approve_claim_url = '/api/facility-claims/{}/approve/'.format(
            claim.id,
        )

        approve_claim_response = self.client.post(
            approve_claim_url,
            {'reason': 'reason'},
        )

        self.assertEqual(
            approve_claim_response.status_code,
            200,
        )

        history_response = self.client.get(self.facility_two_history_url)

        self.assertEqual(
            history_response.status_code,
            200
        )

        data = json.loads(history_response.content)

        self.assertEqual(
            data[0]['action'],
            'CLAIM',
        )

        self.assertEqual(
            len(data),
            3,
        )

    @override_flag('can_get_facility_history', active=True)
    @override_switch('claim_a_facility', active=True)
    def test_includes_entry_for_claim_revocation(self):
        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        claim_facility_url = '/api/facilities/{}/claim/'.format(
            self.facility_two.id,
        )

        claim_facility_data = {
            'contact_person': 'contact_person',
            'job_title': 'job_title',
            'company_name': 'company_name',
            'email': 'email@example.com',
            'phone_number': 1234567,
            'website': 'https://example.com',
            'facility_description': 'facility_description',
            'verification_method': 'verification_method',
            'preferred_contact_method': 'email',
        }

        claim_response = self.client.post(
            claim_facility_url,
            claim_facility_data,
        )

        self.assertEqual(
            claim_response.status_code,
            200,
        )

        self.client.logout()
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        claim = FacilityClaim.objects.first()

        approve_claim_url = '/api/facility-claims/{}/approve/'.format(
            claim.id,
        )

        approve_claim_response = self.client.post(
            approve_claim_url,
            {'reason': 'reason'},
        )

        self.assertEqual(
            approve_claim_response.status_code,
            200,
        )

        revoke_claim_url = '/api/facility-claims/{}/revoke/'.format(
            claim.id,
        )

        revoke_claim_response = self.client.post(
            revoke_claim_url,
            {'reason': 'reason'},
        )

        self.assertEqual(
            revoke_claim_response.status_code,
            200,
        )

        history_response = self.client.get(self.facility_two_history_url)

        self.assertEqual(
            history_response.status_code,
            200
        )

        data = json.loads(history_response.content)

        self.assertEqual(
            data[0]['action'],
            'CLAIM_REVOKE',
        )

        self.assertEqual(
            len(data),
            4,
        )

    @override_flag('can_get_facility_history', active=True)
    @override_switch('claim_a_facility', active=True)
    def test_includes_entry_for_public_claimed_facility_data_changes(self):
        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        claim_facility_url = '/api/facilities/{}/claim/'.format(
            self.facility_two.id,
        )

        claim_facility_data = {
            'contact_person': 'contact_person',
            'job_title': 'job_title',
            'company_name': 'company_name',
            'email': 'email@example.com',
            'phone_number': 1234567,
            'website': 'https://example.com',
            'facility_description': 'facility_description',
            'verification_method': 'verification_method',
            'preferred_contact_method': 'email',
        }

        claim_response = self.client.post(
            claim_facility_url,
            claim_facility_data,
        )

        self.assertEqual(
            claim_response.status_code,
            200,
        )

        self.client.logout()
        self.client.login(email=self.superuser_email,
                          password=self.superuser_password)

        claim = FacilityClaim.objects.first()

        approve_claim_url = '/api/facility-claims/{}/approve/'.format(
            claim.id,
        )

        approve_claim_response = self.client.post(
            approve_claim_url,
            {'reason': 'reason'},
        )

        self.assertEqual(
            approve_claim_response.status_code,
            200,
        )

        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        update_claim_url = '/api/facility-claims/{}/claimed/'.format(
            claim.id,
        )

        update_claim_data = {
            'id': claim.id,
            'facility_name_english': 'facility_name_english',
            'facility_name_native_language': 'facility_name_native_language',
            'facility_address': 'facility_address',
            'facility_description': 'facility_description',
            'facility_phone_number': 1234567,
            'facility_phone_number_publicly_visible': True,
            'facility_website': 'https://openapparel.org',
            'facility_website_publicly_visible': True,
            'facility_minimum_order_quantity': 10,
            'facility_average_lead_time': '2 months',
            'point_of_contact_person_name': 'point_of_contact_person_name',
            'point_of_contact_email': 'point_of_contact_email',
            'facility_workers_count': 20,
            'facility_female_workers_percentage': 50,
            'point_of_contact_publicly_visible': True,
            'office_official_name': 'office_official_name',
            'office_address': 'office_address',
            'office_country_code': 'US',
            'office_phone_number': 2345678,
            'office_info_publicly_visible': True,
            'facility_type': 'Cut and Sew / RMG',
        }

        update_claim_response = self.client.put(
            update_claim_url,
            update_claim_data,
        )

        self.assertEqual(
            update_claim_response.status_code,
            200,
        )

        history_response = self.client.get(self.facility_two_history_url)

        self.assertEqual(
            history_response.status_code,
            200
        )

        data = json.loads(history_response.content)

        self.assertEqual(
            data[0]['action'],
            'CLAIM_UPDATE',
        )

        self.assertEqual(
            len(data),
            4,
        )

        non_public_keys = [
            'facility_website',
            'facility_website_publicly_visible',
            'point_of_contact_publicly_visible',
            'point_of_contact_person_name',
            'point_of_contact_email',
            'office_info_publicly_visible',
            'office_official_name',
            'office_country_code',
            'office_address',
            'office_phone_number',
        ]

        for non_public_key in non_public_keys:
            self.assertNotIn(
                non_public_key,
                data[0]['changes'],
            )

    def test_unauthenticated_receives_401(self):
        self.client.logout()
        history_response = self.client.get(self.history_url)

        self.assertEqual(
            history_response.status_code,
            401,
        )

    def test_superuser_can_access_endpoint(self):
        # superuser is already signed in via `setUp`
        history_response = self.client.get(self.history_url)

        self.assertEqual(
            history_response.status_code,
            200,
        )

    def test_not_in_group_receives_403(self):
        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        history_response = self.client.get(self.history_url)

        self.assertEqual(
            history_response.status_code,
            403,
        )

    def test_in_group_receives_200(self):
        self.client.logout()

        history_group = auth.models.Group.objects.get(
            name='can_get_facility_history',
        )

        self.user.groups.set([history_group.id])
        self.user.save()

        self.client.login(email=self.user_email,
                          password=self.user_password)

        history_response = self.client.get(self.history_url)

        self.assertEqual(
            history_response.status_code,
            200,
        )


class FacilitySubmitTest(FacilityAPITestCaseBase):
    def setUp(self):
        super(FacilitySubmitTest, self).setUp()
        self.url = reverse('facility-list')
        self.valid_facility = {
            'country': 'United States',
            'name': 'Pants Hut',
            'address': '123 Main St, Anywhereville, PA'
        }

    def join_group_and_login(self):
        self.client.logout()
        group = auth.models.Group.objects.get(
            name=FeatureGroups.CAN_SUBMIT_FACILITY,
        )
        self.user.groups.set([group.id])
        self.user.save()
        self.client.login(email=self.user_email,
                          password=self.user_password)

    def test_unauthenticated_receives_401(self):
        self.client.logout()
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 401)

    def test_not_in_group_receives_403(self):
        self.client.logout()
        self.client.login(email=self.user_email,
                          password=self.user_password)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, 403)

    def test_empty_body_is_invalid(self):
        self.join_group_and_login()
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 400)

    def test_missing_fields_are_invalid(self):
        self.join_group_and_login()

        response = self.client.post(self.url, {
            'country': 'US',
            'name': 'Something',
        })
        self.assertEqual(response.status_code, 400)

        response = self.client.post(self.url, {
            'country': 'US',
            'address': 'Some street',
        })
        self.assertEqual(response.status_code, 400)

        response = self.client.post(self.url, {
            'name': 'Something',
            'address': 'Some street',
        })
        self.assertEqual(response.status_code, 400)

    def test_valid_request(self):
        self.join_group_and_login()
        response = self.client.post(self.url, self.valid_facility)

        # TODO: Change to 200 when implemented
        self.assertEqual(response.status_code, 501)

    def test_valid_request_with_params(self):
        self.join_group_and_login()
        url_with_query = '{}?create=false&public=true'.format(self.url)
        response = self.client.post(url_with_query, self.valid_facility)

        # TODO: Change to 200 when implemented
        self.assertEqual(response.status_code, 501)

    def test_private_permission(self):
        self.join_group_and_login()
        url_with_query = '{}?public=false'.format(self.url)
        response = self.client.post(url_with_query, self.valid_facility)
        self.assertEqual(response.status_code, 403)

        group = auth.models.Group.objects.get(
            name=FeatureGroups.CAN_SUBMIT_PRIVATE_FACILITY,
        )
        self.user.groups.add(group.id)
        self.user.save()

        response = self.client.post(url_with_query, self.valid_facility)
        # TODO: Change to 200 when implemented
        self.assertEqual(response.status_code, 501)


class FacilityCreateBodySerializerTest(TestCase):
    def test_valid_data(self):
        serializer = FacilityCreateBodySerializer(data={
            'country': 'United States',
            'name': 'Pants Hut',
            'address': '123 Main St, Anywhereville, PA'
        })
        self.assertTrue(serializer.is_valid())

    def test_missing_fields(self):
        serializer = FacilityCreateBodySerializer(data={
            'name': 'Pants Hut',
            'address': '123 Main St, Anywhereville, PA'
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('country', serializer.errors)
        self.assertNotIn('name', serializer.errors)
        self.assertNotIn('address', serializer.errors)

        serializer = FacilityCreateBodySerializer(data={
            'country': 'United States',
            'address': '123 Main St, Anywhereville, PA'
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
        self.assertNotIn('country', serializer.errors)
        self.assertNotIn('address', serializer.errors)

        serializer = FacilityCreateBodySerializer(data={
            'country': 'United States',
            'name': 'Pants Hut',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('address', serializer.errors)
        self.assertNotIn('country', serializer.errors)
        self.assertNotIn('name', serializer.errors)

    def test_invalid_country(self):
        serializer = FacilityCreateBodySerializer(data={
            'country': 'Notrealia',
            'name': 'Pants Hut',
            'address': '123 Main St, Anywhereville, PA'
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('country', serializer.errors)
