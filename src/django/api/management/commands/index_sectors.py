from django.core.management.base import BaseCommand

from api.models import FacilityIndex, get_sector_dict


class Command(BaseCommand):
    help = 'Adds custom text to the index table based on the provided id(s).'

    def add_arguments(self, parser):
        parser.add_argument('facility_ids', type=str, nargs='*')

    def handle(self, *args, **options):
        facility_ids = options.get('facility_ids', [])
        for facility_id, sectors in get_sector_dict(facility_ids).items():
            FacilityIndex.objects.filter(id=facility_id).update(sector=sectors)
