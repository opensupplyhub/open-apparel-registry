import sys

from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

from api.models import User


class Command(BaseCommand):
    help = ('Given a User email address and a command, add or remove a '
            'group membership for that user  ')

    def add_arguments(self, parser):
        group = parser.add_argument_group('required arguments')
        group.add_argument('-e', '--email',
                           required=True,
                           help='The user\'s email address')
        group.add_argument('-a', '--action',
                           required=True,
                           help='The action (add or remove)')
        group.add_argument('-g', '--group',
                           required=True,
                           help='The name of a group')

    def handle(self, *args, **options):
        email = options['email']
        action = options['action']
        group_name = options['group']

        try:
            user = User.objects.get(email=email)
            group_name = group_name.lower()
            group = Group.objects.get(name=group_name)
            action = action.lower()
            if action not in ('add', 'remove'):
                self.stderr.write('Action must be "add" or "remove"')
                sys.exit(1)

            if action == 'add':
                user.groups.add(group)
            if action == 'remove':
                user.groups.remove(group)
            user.save()

        except User.DoesNotExist:
            self.stderr.write('No User found for {}'.format(email))
            sys.exit(1)
        except Group.DoesNotExist:
            self.stderr.write('No group found for {}'.format(group_name))
            group_names = ', '.join(Group.objects.values_list('name',
                                                              flat=True))
            self.stderr.write('Choices are: {}'.format(group_names))
            sys.exit(1)
