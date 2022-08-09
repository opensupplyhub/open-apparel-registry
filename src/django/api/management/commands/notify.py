from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'POST notifications for an Event to configured webhook endpoints'

    def add_arguments(self, parser):
        # Create a group of arguments explicitly labeled as required,
        # because by default named arguments are considered optional.
        group = parser.add_argument_group('required arguments')
        group.add_argument('-e', '--event-id',
                           required=True,
                           help='The ID of an existingEvent record.')

    def handle(self, *args, **options):
        print('TODO: REPLACE THIS STUB IMPLEMENTATION')
