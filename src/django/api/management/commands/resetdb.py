from django.core.management import call_command
from django.core.management.base import (BaseCommand)


class Command(BaseCommand):
    help = 'Reset the DB schema, run migrations, and load fixtures.'

    def handle(self, *args, **options):
        call_command('reset_schema', '--noinput')
        call_command('migrate')
        call_command('createtrainedmodel')
        call_command('loadfixtures')
