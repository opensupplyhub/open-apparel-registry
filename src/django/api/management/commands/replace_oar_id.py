from django.core.management.base import BaseCommand
from django.db.models import Q

from api.models import FacilityListItem, FacilityMatch


class Command(BaseCommand):
    help = ('Replace references to oar_id in item processing_results and '
            'match results')

    def add_arguments(self, parser):
        parser.add_argument('-d', '--dry-run', action='store_true',
                            default=False, help='Do not save cahnges')

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        if dry_run:
            print('== DRY RUN - SKIPPING ALL SAVES')

        print('-- PROCESSING ITEMS')

        filters = (
            Q(processing_results__contains=[{"action": "move_facility"}])
            | Q(processing_results__contains=[{"action": "merge_facility"}])
            | Q(processing_results__contains=[{"action": "split_facility"}])
        )

        for item in FacilityListItem.objects.filter(filters).iterator():
            did_update_key = False
            for result in item.processing_results:
                if 'previous_facility_oar_id' in result:
                    result['previous_facility_os_id'] = \
                        result.pop('previous_facility_oar_id')
                    did_update_key = True
                if 'merged_oar_id' in result:
                    result['merged_os_id'] = \
                        result.pop('merged_oar_id')
                    did_update_key = True
            if did_update_key:
                if not dry_run:
                    item.save()
                    print(f'item,save,{item.pk}')
                else:
                    print(f'item,dry,{item.pk}')
            else:
                print(f'item,skip,{item.pk}')

        print('-- PROCESSING MATCHES')

        matches = FacilityMatch.objects.filter(
            results__has_key='split_from_oar_id')

        for match in matches.iterator():
            match.results['split_from_os_id'] = \
                match.results.pop('split_from_oar_id')
            if not dry_run:
                match.save()
                print(f'match,save,{match.pk}')
            else:
                print(f'match,dry,{match.pk}')
