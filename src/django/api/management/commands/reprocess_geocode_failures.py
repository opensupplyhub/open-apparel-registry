from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count

from api.models import FacilityList, FacilityListItem
from api.processing import (geocode_facility_list_item,
                            match_facility_list_items,
                            save_match_details)


class Command(BaseCommand):
    help = ('Find all FacilityListItem objects that are in the '
            'ERROR_MATCHING status that do not have a '
            'geocoded_point. Attempt to geocode them again '
            'and rerun the match process on the related list.')

    def print_status_counts(self):
        statuses = FacilityListItem.objects \
                                   .all() \
                                   .values('status') \
                                   .annotate(count=Count('status')) \
                                   .order_by('status')

        self.stdout.write('Status counts:')
        for status in statuses:
            self.stdout.write('  {status} {count}'.format(**status))

    def handle(self, *args, **options):
        self.print_status_counts()

        items = FacilityListItem.objects.filter(
            geocoded_point=None, status=FacilityListItem.ERROR_MATCHING)

        list_id_set = set()
        geocode_success_count = 0
        geocode_fail_count = 0
        self.stdout.write('Geocoding {} items'.format(str(items.count())))
        for item in items:
            list_id_set.add(item.facility_list.id)
            item.status = FacilityListItem.PARSED
            geocode_facility_list_item(item)
            item.save()
            if item.status == FacilityListItem.GEOCODED:
                geocode_success_count += 1
            else:
                geocode_fail_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        '{} {} {} {}'.format(
                            item.status,
                            item.id,
                            item.country_code,
                            item.address)))
        self.stdout.write(
            '{} successes {} failures'.format(
                geocode_success_count, geocode_fail_count))

        lists = FacilityList.objects \
                            .filter(id__in=list(list_id_set)) \
                            .order_by('id')
        self.stdout.write('Matching {} lists'.format(str(lists.count())))
        for facility_list in lists:
            result = match_facility_list_items(facility_list)
            with transaction.atomic():
                save_match_details(result)

        self.print_status_counts()
