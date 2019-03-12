from django.conf import settings

import requests


ZERO_RESULTS = "ZERO_RESULTS"


def create_geocoding_api_url(address, country_code):
    return (
        "https://maps.googleapis.com/maps/api/geocode/json"
        "?components=country:{0}"
        "&address={1}"
        "&key={2}"
    ).format(country_code, address, settings.GOOGLE_SERVER_SIDE_API_KEY)


def format_geocoded_address_data(data):
    first_result, *_ = data["results"]

    geocoded_point = first_result["geometry"]["location"]
    geocoded_address = first_result["formatted_address"]

    return {
        "geocoded_point": geocoded_point,
        "geocoded_address": geocoded_address,
        "full_response": data,
    }


def geocode_address(address, country_code):
    request_url = create_geocoding_api_url(address, country_code)
    r = requests.get(request_url)

    if r.status_code != 200:
        raise ValueError("Geocoding request failed with status"
                         .format(r.status_code))

    data = r.json()

    if data["status"] == ZERO_RESULTS or len(data["results"]) == 0:
        raise ValueError("No results were found")

    return format_geocoded_address_data(data)
