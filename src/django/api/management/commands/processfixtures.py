from django.core.management import call_command
from django.core.management.base import BaseCommand

from api.models import FacilityList


class Command(BaseCommand):
    help = 'Run all processing steps on data loaded from fixtures'

    def add_arguments(self, parser):
        parser.add_argument(
            '-s',
            '--startid',
            type=int,
            help='The start of the list ID range to process',
            default=2,
        )

        parser.add_argument(
            '-e',
            '--endid',
            type=int,
            help='The end of the list ID range to process',
            default=16,
        )

    def handle(self, *args, **options):
        start_id = options['startid']
        end_id = options['endid']
        for list_id in range(start_id, end_id):
            FacilityList.objects\
                        .filter(pk=list_id)\
                        .update(status=FacilityList.APPROVED)
            for action in ('parse', 'geocode', 'match'):
                call_command('batch_process',
                             '--list-id', list_id,
                             '--action', action)
