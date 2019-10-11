from django.core.management.base import (BaseCommand)
from django.db import transaction

from api.models import FacilityList, FacilityListItem, Source


@transaction.atomic
def list_to_source(facility_list):
    source_qs = Source.objects.filter(
        source_type=Source.LIST, facility_list=facility_list)
    if source_qs.exists():
        source = source_qs.first()
    else:
        source = Source(source_type=Source.LIST,
                        facility_list=facility_list)

    source.contributor = facility_list.contributor
    source.is_public = facility_list.is_public
    source.is_active = facility_list.is_active
    source.save()

    # Override auto_now values by using a queryset update
    Source.objects.filter(pk=source.pk).update(
        created_at=facility_list.created_at,
        updated_at=facility_list.updated_at)

    FacilityListItem.objects \
                    .filter(facility_list=facility_list) \
                    .update(source=source)


def lists_to_sources():
    for facility_list in FacilityList.objects.all():
        list_to_source(facility_list)


class Command(BaseCommand):
    help = ('Create/update Source records from FacilityList records and '
            'connect the Source records to FacilityListItem records.')

    def handle(self, *args, **options):
        lists_to_sources()
