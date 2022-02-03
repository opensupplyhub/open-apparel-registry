from django.conf import settings

import requests


ZERO_RESULTS = "ZERO_RESULTS"
GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"


def create_geocoding_params(address, country_code):
    return {
        'components': 'country:{}'.format(country_code),
        'address': address,
        'key': settings.GOOGLE_SERVER_SIDE_API_KEY
    }


def format_geocoded_address_data(data, result=None):
    if result is None:
        result = data['results'][0]
    geocoded_point = result["geometry"]["location"]
    geocoded_address = result["formatted_address"]

    return {
        "result_count": len(data["results"]),
        "geocoded_point": geocoded_point,
        "geocoded_address": geocoded_address,
        "full_response": data,
    }


def format_no_geocode_results(data):
    return {
        'result_count': 0,
        'geocoded_point': None,
        'geocoded_address': None,
        'full_response': data,
    }


# Results are valid if they contain a matching country-code.
# If no results with matching country codes are found,
# a result with no country-code will be accepted.
# If all results contain non-matching country codes, throw an error.
def find_valid_country_code(data, country_code):
    first_inexact_result = None
    country_codes = list()

    for result in data["results"]:
        address_components = result['address_components']
        is_inexact = True
        for component in address_components:
            short_name = component.get('short_name', '')
            # If a result with a matching country code is found
            if short_name == country_code:
                return result
            # If the component is a non-matching country code
            if 'country' in component.get('types', []):
                country_codes.append(short_name)
                is_inexact = False
        # Save the first result with no country code
        if first_inexact_result is None and is_inexact:
            first_inexact_result = result

    # If there were no results with matching country codes
    # but there is a result with no country code, return it
    if first_inexact_result is not None:
        return first_inexact_result

    # There were no results matching country codes
    # and no results with no country code; throw an error
    error = "Geocoding results of " + \
            "{} did not match provided country code of {}.".format(
                ', '.join(country_codes), country_code)
    raise ValueError(error)


def geocode_address(address, country_code):
    params = create_geocoding_params(address, country_code)
    r = requests.get(GEOCODING_URL, params=params)

    if r.status_code != 200:
        raise ValueError("Geocoding request failed with status"
                         .format(r.status_code))

    data = r.json()

    if data["status"] == ZERO_RESULTS or len(data["results"]) == 0:
        return format_no_geocode_results(data)

    valid_result = find_valid_country_code(data, country_code)

    return format_geocoded_address_data(data, valid_result)
