from django.core.management.base import BaseCommand
from django.db.models import F

from api.models import Version


class Command(BaseCommand):
    help = ('Increment the version number in the database to invalidate the '
            'tile cache')

    def handle(self, *args, **options):
        Version.objects \
               .filter(name='tile_version') \
               .update(version=F('version') + 1)
