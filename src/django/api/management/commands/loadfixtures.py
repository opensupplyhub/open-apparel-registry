from django.core.management import call_command
from django.core.management.base import (BaseCommand,
                                         CommandError)


class Command(BaseCommand):
    help = 'Load fixture data for development and staging'

    def add_arguments(self, parser):
        parser.add_argument('-m', '--match', action='store_true',
                            help='Create facilities and matches')

    def handle(self, *args, **options):
        match = options['match']
        try:
            call_command('loaddata',
                         'users.json',
                         'contributors.json',
                         'facility_lists.json',
                         'sources.json',
                         'facility_list_items.json',
                         'sectors.json',
                         'trainedmodel.json',
                         'dedupe_indexed_records.json')
            if match:
                call_command('loaddata',
                             'facilities.json',
                             'facility_matches.json')
            else:
                self.stderr.write('Skipped loading facilities and matches')
        except CommandError as e:
            self.stderr.write("Error loading fixture data: {}".format(e))
