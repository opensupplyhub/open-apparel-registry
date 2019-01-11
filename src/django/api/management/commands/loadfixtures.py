from django.core.management import call_command
from django.core.management.base import (BaseCommand,
                                         CommandError)


class Command(BaseCommand):
    help = 'Load fixture data for development and staging'

    def handle(self, *args, **options):
        try:
            call_command('loaddata',
                         'users.json',
                         'organizations.json',
                         'facility_lists.json',
                         'facility_list_items.json',
                         'facilities.json',
                         'facility_matches.json')
        except CommandError as e:
            self.stderr.write("Error loading fixture data: {}".format(e))
