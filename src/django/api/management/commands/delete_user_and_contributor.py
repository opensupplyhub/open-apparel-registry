import sys

from django.core.management.base import BaseCommand
from django.db import transaction

from allauth.account.models import EmailAddress

from api.models import User, Contributor


class Command(BaseCommand):
    help = 'Given a User email address, delete the User and also delete the ' \
           'associated Contributor record.'

    def add_arguments(self, parser):
        group = parser.add_argument_group('required arguments')
        group.add_argument('-e', '--email',
                           required=True,
                           help='The user\'s email address')

    def handle(self, *args, **options):
        email = options['email']

        try:
            user = User.objects.get(email=email)

            with transaction.atomic():
                try:
                    contributor = Contributor.objects.get(admin=user)
                    contributor.delete()
                except Contributor.DoesNotExist:
                    pass

                try:
                    email_verification = EmailAddress \
                        .objects \
                        .get_primary(user.id)

                    if email_verification is not None:
                        email_verification.delete()

                except EmailAddress.DoesNotExist:
                    pass

                user.delete()

                self.stdout.write(
                    'User and Contributor for {} deleted'.format(email))
        except User.DoesNotExist:
            self.stderr.write('No User found for {}'.format(email))
            sys.exit(1)
