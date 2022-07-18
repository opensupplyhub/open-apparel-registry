from django.core.management.base import BaseCommand

from api.models import index_sectors


class Command(BaseCommand):
    help = 'Adds custom text to the index table based on the provided id(s).'

    def add_arguments(self, parser):
        parser.add_argument('facility_ids', type=str, nargs='*')

    def handle(self, *args, **options):
        facility_ids = options.get('facility_ids', [])
        index_sectors(facility_ids)
