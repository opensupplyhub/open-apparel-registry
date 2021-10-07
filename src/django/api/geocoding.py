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


def format_geocoded_address_data(data):
    first_result, *_ = data["results"]

    geocoded_point = first_result["geometry"]["location"]
    geocoded_address = first_result["formatted_address"]

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


def validate_country_code(data, country_code):
    address_components = data["results"][0]['address_components']
    for component in address_components:
        if component['short_name'] == country_code:
            return True
    raise ValueError("Geocoding results did not match provided country code.")


def geocode_address(address, country_code):
    params = create_geocoding_params(address, country_code)
    r = requests.get(GEOCODING_URL, params=params)

    if r.status_code != 200:
        raise ValueError("Geocoding request failed with status"
                         .format(r.status_code))

    data = r.json()

    if data["status"] == ZERO_RESULTS or len(data["results"]) == 0:
        return format_no_geocode_results(data)

    validate_country_code(data, country_code)

    return format_geocoded_address_data(data)
