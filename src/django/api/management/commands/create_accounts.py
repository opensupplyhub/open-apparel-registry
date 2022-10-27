import sys

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from api.models import Contributor, User

VALID_CONTRIBUTOR_TYPES = [k for k, v in Contributor.CONTRIB_TYPE_CHOICES]


class Command(BaseCommand):
    help = 'Create user and contributor accounts.'

    def add_arguments(self, parser):
        # Create a group of arguments explicitly labeled as required,
        # because by default named arguments are considered optional.
        group = parser.add_argument_group('required arguments')
        group.add_argument('-c', '--contributors',
                           required=True,
                           nargs='+',
                           help='Space separated list of double-quoted '
                                'contributor names.')
        group.add_argument('-t', '--type',
                           required=True,
                           help='Type of contributor. '
                                'One of "{}".'.format(
                                    '", "'.join(VALID_CONTRIBUTOR_TYPES)))
        group.add_argument('-p', '--password',
                           required=True,
                           help='Password to set for all new accounts.')

    def handle(self, *args, **options):
        contributors = options['contributors']
        contrib_type = options['type']
        password = options['password']

        # Crash if invalid contributor type specified
        if contrib_type not in VALID_CONTRIBUTOR_TYPES:
            self.stderr.write(
                'Validation Error: Invalid contributor type "{0}". '
                'Must be one of "{1}".'.format(
                    contrib_type, '", "'.join(VALID_CONTRIBUTOR_TYPES)))

            sys.exit(1)

        # Crash if invalid password specified
        try:
            validate_password(password)
        except ValidationError as e:
            self.stderr.write(
                'Validation Error: Password "{0}" is invalid. '
                '\n{1}'.format(password, '\n'.join(list(e.messages))))

            sys.exit(1)

        with transaction.atomic():
            for name in contributors:
                user = User.objects._create_user(
                    email='info+{}@opensupplyhub.org'.format(
                        slugify(name, allow_unicode=True)),
                    password=password,
                    is_superuser=False,
                    is_staff=False,
                    is_active=True,
                    should_receive_newsletter=False,
                    has_agreed_to_terms_of_service=True,
                )

                contributor = Contributor(
                    name='{} [Public List]'.format(name),
                    description='Public facility lists for {} '
                                'managed by the OS Hub team'.format(name),
                    website='',
                    contrib_type=contrib_type,
                    other_contrib_type=(
                        Contributor.OTHER_CONTRIB_TYPE
                        if contrib_type == Contributor.OTHER_CONTRIB_TYPE
                        else None),
                    admin=user,
                )
                contributor.save()

        self.stdout.write('Created accounts for {} contributors.'.format(
            len(contributors)))
