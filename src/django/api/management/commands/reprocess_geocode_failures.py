from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count

from api.models import FacilityList, FacilityListItem

from oar.settings import ENVIRONMENT

from api.aws_batch import submit_jobs


class Command(BaseCommand):
    help = ('Find all FacilityListItem objects that are in the '
            'ERROR_MATCHING status that do not have a ' 'geocoded_point. Set '
            'their status to PARSED and resubmit them for processing (or '
            'print the processing commands in development')

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
        self.stdout.write(
            'Changing status of {} items'.format(str(items.count())))
        with transaction.atomic():
            for item in items:
                list_id_set.add(item.facility_list.id)
                item.status = FacilityListItem.PARSED
                item.save()
        self.print_status_counts()

        lists = FacilityList.objects \
                            .filter(id__in=list(list_id_set)) \
                            .order_by('id')

        self.stdout.write('Reprocessing {} lists'.format(str(lists.count())))
        for facility_list in lists:
            if ENVIRONMENT in ('Staging', 'Production'):
                job_ids = submit_jobs(facility_list)
                self.stdout.write('{} {}'.format(facility_list.id, job_ids))
            else:
                command = ('./scripts/manage batch_process '
                           '--list-id {} --action {}')
                self.stdout.write(command.format(facility_list.id, 'geocode'))
                self.stdout.write(command.format(facility_list.id, 'match'))
