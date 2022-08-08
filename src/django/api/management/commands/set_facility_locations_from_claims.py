import json

from django.core.management.base import BaseCommand
from django.db import transaction

from django.contrib.gis.geos import GEOSGeometry
from api.geocoding import geocode_address
from api.countries import COUNTRY_CODES
from api.models import FacilityClaim


class Command(BaseCommand):
    help = ('')

    def print_error(self, claim):
        self.stdout.write(
            'Geocoding failed for {}: claim {}, ({}-{})'.format(
                claim.facility_id, claim.id,
                claim.facility_address, claim.facility.country_code))

    def handle(self, *args, **options):
        claims = FacilityClaim \
            .objects \
            .filter(
                facility_location__isnull=True,
                status='APPROVED',
                facility_address__isnull=False,
                )

        with transaction.atomic():
            for claim in claims:
                # Claims don't have a facility country code field,
                # so use the code from the facility.
                country_code = claim.facility.country_code
                address = claim.facility_address

                try:
                    geocode_result = geocode_address(
                        address, country_code, True)
                except ValueError:
                    self.print_error(claim)
                    continue

                # Sometimes just the country center is returned,
                # instead of an address. Treat as an error.
                geocoded_address = str(
                    geocode_result.get('geocoded_address', '')).strip()
                if geocoded_address.lower() in COUNTRY_CODES:
                    self.print_error(claim)
                    continue

                geocoded_point = geocode_result.get('geocoded_point', None)
                if geocoded_point is None:
                    self.print_error()
                    continue

                location_data = {
                    'type': 'Point',
                    'coordinates': [
                        geocoded_point.get('lng', 0.0),
                        geocoded_point.get('lat', 0.0),
                    ],
                }
                claim.facility_location = GEOSGeometry(
                    json.dumps(location_data))
                claim.save()

                claim.facility.location = claim.facility_location
                claim.facility._change_reason = \
                    'Location updated on FacilityClaim ({})'.format(
                        claim.id)
                claim.facility.save()
