import json

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from django.contrib import auth
from django.conf import settings
from django.contrib.gis.geos import Point

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.constants import ProcessingAction
from api.models import (Facility, FacilityList, FacilityListItem,
                        FacilityMatch, Contributor, User)
from api.oar_id import make_oar_id, validate_oar_id
from api.processing import (parse_facility_list_item,
                            geocode_facility_list_item,
                            match_facility_list_items)
from api.geocoding import (create_geocoding_api_url,
                           format_geocoded_address_data,
                           geocode_address)
from api.test_data import azavea_office_data, parsed_city_hall_data


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

    def post_header_only_file(self, **kwargs):
        if kwargs is None:
            kwargs = {}
        csv_file = SimpleUploadedFile('facilities.csv',
                                      b'country,name,address\n',
                                      content_type='text/csv')
        return self.client.post(reverse('facility-list-list'),
                                {'file': csv_file, **kwargs},
                                format='multipart')

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
        items = list(FacilityListItem.objects.all())
        self.assertEqual(items[0].raw_data, self.test_csv_rows[1])

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
        self.assertEqual(FacilityListItem.ERROR, item.status)
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
        facility_list = FacilityList(header='address,country,name')
        item = FacilityListItem(raw_data='1234 main st,de,Shirts!',
                                facility_list=facility_list)
        parse_facility_list_item(item)
        self.assert_successful_parse_results(item)
        self.assertEqual('DE', item.country_code)
        self.assertEqual('Shirts!', item.name)
        self.assertEqual('1234 main st', item.address)

    def test_converts_country_name_to_code(self):
        facility_list = FacilityList(header='address,country,name')
        item = FacilityListItem(raw_data='1234 main st,ChInA,Shirts!',
                                facility_list=facility_list)
        parse_facility_list_item(item)
        self.assert_successful_parse_results(item)
        self.assertEqual('CN', item.country_code)
        self.assertEqual('Shirts!', item.name)
        self.assertEqual('1234 main st', item.address)

    def test_error_status_if_country_is_unknown(self):
        facility_list = FacilityList(header='address,country,name')
        item = FacilityListItem(raw_data='1234 main st,Unknownistan,Shirts!',
                                facility_list=facility_list)
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
        settings.GOOGLE_GEOCODING_API_KEY = "world"

    def test_geocoding_api_url_is_created_correctly(self):
        self.assertEqual(
            create_geocoding_api_url("hello", "US"),
            (
                "https://maps.googleapis.com/maps/api/geocode/json"
                "?components=country:US&address=hello&key=world"
            )
        )

    def test_geocoded_address_data_is_formatted_correctly(self):
        formatted_data = format_geocoded_address_data(
            parsed_city_hall_data['full_response'])
        self.assertEqual(formatted_data, parsed_city_hall_data)


class GeocodingTest(TestCase):
    def test_correct_address_is_geocoded_properly(self):
        geocoded_data = geocode_address('990 Spring Garden St, Philly', 'US')
        self.assertDictEqual(geocoded_data, azavea_office_data)

    def test_ungeocodable_address_returns_value_error(self):
        with self.assertRaises(ValueError) as cm:
            geocode_address('hello world', '$#')

        self.assertEqual(cm.exception.args, ('No results were found',))


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
        item = FacilityListItem(
            raw_data='1400 JFK Blvd, Philly,us,Shirts!',
            facility_list=facility_list
        )

        with self.assertRaises(ValueError) as cm:
            geocode_facility_list_item(item)

        self.assertEqual(
            cm.exception.args,
            ('Items to be geocoded must be in the PARSED status',),
        )

    def test_successfully_geocoded_item_has_correct_results(self):
        facility_list = FacilityList(header='address,country,name')
        item = FacilityListItem(
            raw_data='"City Hall, Philly, PA",us,Shirts!',
            facility_list=facility_list
        )
        parse_facility_list_item(item)
        geocode_facility_list_item(item)

        self.assertEqual(
            item.geocoded_address,
            "1400 John F Kennedy Blvd, Philadelphia, PA 19107, USA",
        )
        self.assertIsInstance(item.geocoded_point, Point)
        self.assertEqual(item.status, FacilityListItem.GEOCODED)
        self.assertIn(
            'results',
            self.get_first_status(item, ProcessingAction.GEOCODE)['data']
        )

    def test_failed_geocoded_item_has_error_results(self):
        facility_list = FacilityList(header='address,country,name')
        item = FacilityListItem(
            raw_data='"hello, world, foo, bar, baz",us,Shirts!',
            facility_list=facility_list
        )
        parse_facility_list_item(item)
        item.country_code = "$%"
        geocode_facility_list_item(item)

        self.assertEqual(item.status, FacilityListItem.ERROR)
        self.assertIsNone(item.geocoded_address)
        self.assertIsNone(item.geocoded_point)
        self.assertIn(
            'error',
            self.get_first_status(item, ProcessingAction.GEOCODE)
        )


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
                    name=self.list_one_name,
                    is_active=True,
                    is_public=True,
                    contributor=self.contrib_one)

        self.list_item_one = FacilityListItem \
            .objects \
            .create(name=self.name_one,
                    address=self.address_one,
                    country_code=self.country_code,
                    facility_list=self.list_one,
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH)

        self.list_two = FacilityList \
            .objects \
            .create(header="header",
                    file_name="two",
                    name=self.list_two_name,
                    is_active=True,
                    is_public=True,
                    contributor=self.contrib_two)

        self.list_item_two = FacilityListItem \
            .objects \
            .create(name=self.name_two,
                    address=self.address_two,
                    country_code=self.country_code,
                    facility_list=self.list_two,
                    row_index="2",
                    status=FacilityListItem.CONFIRMED_MATCH)

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
        contributors = self.facility.contributors()
        contributor_one = "{} ({})".format(self.contrib_one_name,
                                           self.list_one_name)
        contributor_two = "{} ({})".format(self.contrib_two_name,
                                           self.list_two_name)
        self.assertIn(contributor_one, contributors)
        self.assertIn(contributor_two, contributors)
        self.assertEqual(len(contributors), 2)

    def test_excludes_canonical_name_from_other_names(self):
        other_names = self.facility.other_names()
        self.assertIn(self.name_two, other_names)
        self.assertNotIn(self.name_one, other_names)

    def test_excludes_canonical_address_from_other_addresses(self):
        other_addresses = self.facility.other_addresses()
        self.assertIn(self.address_two, other_addresses)
        self.assertNotIn(self.address_one, other_addresses)

    def test_excludes_other_names_from_inactive_lists(self):
        self.list_two.is_active = False
        self.list_two.save()
        other_names = self.facility.other_names()
        self.assertNotIn(self.name_two, other_names)
        self.assertEqual(len(other_names), 0)

    def test_excludes_other_addresses_from_inactive_lists(self):
        self.list_two.is_active = False
        self.list_two.save()
        other_addresses = self.facility.other_addresses()
        self.assertNotIn(self.address_two, other_addresses)
        self.assertEqual(len(other_addresses), 0)

    def test_excludes_contributors_from_inactive_lists(self):
        self.list_two.is_active = False
        self.list_two.save()
        contributors = self.facility.contributors()
        contributor_one = "{} ({})".format(self.contrib_one_name,
                                           self.list_one_name)
        contributor_two = "{} ({})".format(self.contrib_two_name,
                                           self.list_two_name)
        self.assertIn(contributor_one, contributors)
        self.assertNotIn(contributor_two, contributors)

    def test_excludes_other_names_from_non_public_lists(self):
        self.list_two.is_public = False
        self.list_two.save()
        other_names = self.facility.other_names()
        self.assertNotIn(self.name_two, other_names)
        self.assertEqual(len(other_names), 0)

    def test_excludes_other_addresses_from_non_public_lists(self):
        self.list_two.is_public = False
        self.list_two.save()
        other_addresses = self.facility.other_addresses()
        self.assertNotIn(self.address_two, other_addresses)
        self.assertEqual(len(other_addresses), 0)

    def test_excludes_contributors_from_non_public_lists(self):
        self.list_two.is_public = False
        self.list_two.save()
        contributors = self.facility.contributors()
        contributor_one = "{} ({})".format(self.contrib_one_name,
                                           self.list_one_name)
        contributor_two = "{} ({})".format(self.contrib_two_name,
                                           self.list_two_name)
        self.assertIn(contributor_one, contributors)
        self.assertNotIn(contributor_two, contributors)

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
        contributors = self.facility.contributors()
        contributor_one = "{} ({})".format(self.contrib_one_name,
                                           self.list_one_name)
        contributor_two = "{} ({})".format(self.contrib_two_name,
                                           self.list_two_name)
        self.assertIn(contributor_one, contributors)
        self.assertNotIn(contributor_two, contributors)
        self.assertEqual(len(contributors), 1)


class ConfirmAndRejectFacilityMatchTest(TestCase):
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

        self.prior_contrib = Contributor \
            .objects \
            .create(admin=self.prior_user,
                    name=self.prior_contrib_name,
                    contrib_type=Contributor.OTHER_CONTRIB_TYPE)

        self.prior_list = FacilityList \
            .objects \
            .create(header="header",
                    file_name="one",
                    name=self.prior_list_name,
                    is_active=True,
                    is_public=True,
                    contributor=self.prior_contrib)

        self.prior_list_item_one = FacilityListItem \
            .objects \
            .create(name=self.prior_name_one,
                    address=self.prior_address_one,
                    country_code=self.country_code,
                    facility_list=self.prior_list,
                    row_index=1,
                    status=FacilityListItem.CONFIRMED_MATCH)

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
                    facility_list=self.prior_list,
                    row_index=2,
                    status=FacilityListItem.CONFIRMED_MATCH)

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
                    name=self.current_list_name,
                    is_active=True,
                    is_public=True,
                    contributor=self.current_contrib)

        self.current_list_item = FacilityListItem \
            .objects \
            .create(name=self.current_name,
                    address=self.current_address,
                    country_code=self.country_code,
                    facility_list=self.current_list,
                    row_index=1,
                    geocoded_point=Point(0, 0),
                    status=FacilityListItem.POTENTIAL_MATCH)

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


def interspace(string):
    half = int(len(string) / 2)
    return ' '.join(string[:half]) + string[half:]


def junk_chars(string):
    return string + 'YY'


class DedupeMatchingTests(TestCase):
    fixtures = ['users', 'contributors', 'facility_lists',
                'facility_list_items', 'facilities', 'facility_matches']

    def setUp(self):
        self.contributor = Contributor.objects.first()

    def create_list(self, items):
        facility_list = FacilityList(
            contributor=self.contributor, name='test', description='',
            file_name='test.csv', header='country,name,address')
        facility_list.save()
        for index, item in enumerate(items):
            country_code, name, address = item
            list_item = FacilityListItem(
                facility_list=facility_list, row_index=index, raw_data='',
                status=FacilityListItem.GEOCODED, name=name, address=address,
                country_code=country_code, geocoded_address='')
            list_item.save()
        return facility_list

    def test_matches(self):
        facility = Facility.objects.last()
        facility_list = self.create_list([
            (facility.country_code, interspace(facility.name),
             junk_chars(facility.address.upper()))])
        result = match_facility_list_items(facility_list)
        matches = result['item_matches']
        item_id = str(facility_list.facilitylistitem_set.all()[0].id)
        self.assertIn(item_id, matches)
        self.assertEqual(1, len(matches[item_id]))
        self.assertEqual(str(facility.id), matches[item_id][0][0])
        self.assertEqual(0.5, result['results']['gazetteer_threshold'])
        self.assertFalse(result['results']['no_gazetteer_matches'])

    def test_does_not_match(self):
        facility_list = self.create_list([
            ('US', 'Azavea', '990 Spring Garden St.')])
        result = match_facility_list_items(facility_list)
        matches = result['item_matches']
        self.assertEqual(0, len(matches))
        self.assertTrue(result['results']['no_gazetteer_matches'])


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
