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

from api.constants import ProcessingResultSection
from api.models import (Facility, FacilityList, FacilityListItem,
                        FacilityMatch, Organization, User)
from api.processing import (parse_facility_list_item,
                            geocode_facility_list_item,
                            match_facility_list_item)
from api.geocoding import (create_geocoding_api_url,
                           format_geocoded_address_data,
                           geocode_address)
from api.test_data import azavea_office_data, parsed_city_hall_data


class FacilityListCreateTest(APITestCase):
    def setUp(self):
        self.email = 'test@example.com'
        self.password = 'password'
        self.name = 'Test User'
        self.user = User(name=self.name, email=self.email)
        self.user.set_password(self.password)
        self.user.save()

        self.client.post('/user-login/',
                         {"email": self.email,
                          "password": self.password},
                         format="json")

        self.organization = Organization(name=self.name, admin=self.user)
        self.organization.save()
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
                         previous_item_count + len(self.test_csv_rows))
        items = list(FacilityListItem.objects.all())
        self.assertEqual(items[1].raw_data, self.test_csv_rows[1])

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
            ['FacilityList 1 has already been replaced.'])

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

    def test_upload_by_user_with_no_organization_returns_400(self):
        Organization.objects.all().delete()
        token = Token.objects.create(user=self.user)
        self.client.post('/user-logout/')
        header = {'HTTP_AUTHORIZATION': "Token {0}".format(token)}
        response = self.client.post(reverse('facility-list-list'),
                                    {'file': self.test_file},
                                    format='multipart',
                                    **header)
        self.assertEqual(response.status_code, 400)

    def test_list_request_by_user_with_no_organization_returns_400(self):
        Organization.objects.all().delete()
        response = self.client.get(reverse('facility-list-list'))
        self.assertEqual(response.status_code, 400)


class FacilityListItemParseTest(TestCase):
    def assert_successful_parse_results(self, item):
        self.assertEqual(FacilityListItem.PARSED, item.status)
        self.assertTrue(ProcessingResultSection.PARSING
                        in item.processing_results)
        results = item.processing_results[ProcessingResultSection.PARSING]
        self.assertTrue('error' in results)
        self.assertFalse(results['error'])
        self.assertTrue('started_at' in results)
        self.assertTrue('finished_at' in results)
        self.assertTrue(results['finished_at'] > results['started_at'])

    def assert_failed_parse_results(self, item, message=None):
        self.assertEqual(FacilityListItem.ERROR, item.status)
        self.assertTrue(ProcessingResultSection.PARSING
                        in item.processing_results)
        results = item.processing_results[ProcessingResultSection.PARSING]
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


class FacilityListItemGeocodingTest(TestCase):
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
            item.processing_results[ProcessingResultSection.GEOCODING]['data'],
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
            item.processing_results[ProcessingResultSection.GEOCODING],
        )


class FacilityListItemMatchingTest(TestCase):
    def test_invalid_argument_raises_error(self):
        with self.assertRaises(ValueError) as ve:
            match_facility_list_item("hello")

        self.assertEqual(
            ve.exception.args,
            ('Argument must be a FacilityListItem',)
        )

    def test_item_must_be_geocoded(self):
        with self.assertRaises(ValueError) as ve:
            match_facility_list_item(FacilityListItem())

        self.assertEqual(
            ve.exception.args,
            ('Items to be matched must be in the GEOCODED status',)
        )

    def test_creates_a_facility_and_match(self):
        self.assertEqual(Facility.objects.all().count(), 0)
        item = FacilityListItem(address='1234 Main St', country_code='US',
                                name='Shirts!', geocoded_point=Point(0, 0),
                                status=FacilityListItem.GEOCODED,
                                geocoded_address='1234 Main St, Anytown USA')
        facility, match = match_facility_list_item(item)
        self.assertEqual(FacilityListItem.MATCHED, item.status)

        self.assertIsNotNone(facility)
        self.assertEqual('', facility.pk)
        self.assertEqual(item, facility.created_from)
        self.assertEqual(item.geocoded_address, facility.address)
        self.assertEqual(item.country_code, facility.country_code)
        self.assertEqual(item.name, facility.name)

        self.assertIsNotNone(match)
        self.assertIsNone(match.pk)
        self.assertEqual(match.facility_list_item, item)
        self.assertEqual(match.facility, facility)
        self.assertEqual(FacilityMatch.AUTOMATIC, match.status)
        self.assertEqual(1.0, match.confidence)

    def test_matches_existing_facility(self):
        self.assertEqual(Facility.objects.all().count(), 0)
        user = User.objects.create(email='foo@bar.com')
        user.save()
        org = Organization(name='Foo', admin=user)
        org.save()
        list_1 = FacilityList(header='', organization=org)
        list_1.save()
        item_1 = FacilityListItem(raw_data='', row_index=0,
                                  address='1234 Main St', country_code='US',
                                  name='Shirts!', geocoded_point=Point(0, 0),
                                  status=FacilityListItem.GEOCODED,
                                  geocoded_address='1234 Main St, Anytown USA',
                                  facility_list=list_1)
        item_1.save()
        facility_1, match_1 = match_facility_list_item(item_1)
        facility_1.save()
        match_1.save()
        item_2 = FacilityListItem(row_index=1,
                                  address='1234 Main St', country_code='US',
                                  name='Shirts!', geocoded_point=Point(0, 0),
                                  status=FacilityListItem.GEOCODED,
                                  geocoded_address='1234 Main St, Anytown USA')
        facility_2, match_2 = match_facility_list_item(item_2)

        self.assertIsNotNone(facility_2)
        self.assertEqual(facility_2.pk, facility_1.pk)
        self.assertEqual(item_1.pk, facility_2.created_from.pk)

        self.assertIsNotNone(match_2)
        self.assertEqual(match_2.facility_list_item, item_2)
        self.assertEqual(match_2.facility, facility_1)
        self.assertEqual(FacilityMatch.AUTOMATIC, match_2.status)
        self.assertEqual(1.0, match_2.confidence)
