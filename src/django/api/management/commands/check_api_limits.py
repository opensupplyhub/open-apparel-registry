import datetime
from django.utils import timezone

from django.core.management.base import BaseCommand

from api.limits import check_api_limits


class Command(BaseCommand):
    help = 'Manages Api Limits for Contributors.'

    def handle(self, *args, **options):
        check_api_limits(datetime.datetime.now(tz=timezone.utc))
