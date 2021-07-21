from django.core.management.base import BaseCommand

from api.close_list import close_list


class Command(BaseCommand):
    help = 'Closes all the facilities in a list.'

    def add_arguments(self, parser):
        # Create a group of arguments explicitly labeled as required,
        # because by default named arguments are considered optional.
        group = parser.add_argument_group('required arguments')
        group.add_argument('-l', '--list-id',
                           required=True,
                           help='The id of the facility list to close.')
        group.add_argument('-u', '--user-id',
                           required=True,
                           help='The id of the user to record as responsible' +
                           ' for the closures.')

    def handle(self, *args, **options):
        list_id = options['list_id']
        user_id = options['user_id']
        close_list(list_id, user_id)
