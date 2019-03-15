from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Run all processing steps on data loaded from fixtures'

    def handle(self, *args, **options):
        for list_id in range(2, 16):
            for action in ('parse', 'geocode', 'match'):
                call_command('batch_process',
                             '--list-id', list_id,
                             '--action', action)
