from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import FacilityMatch, HistoricalFacilityMatch
from api.constants import ProcessingAction


class Command(BaseCommand):
    help = ('Reset incorrectly merged facility list items.')

    def add_arguments(self, parser):
        parser.add_argument('-d', '--dry-run', action='store_true',
                            default=False, help='Do not save cahnges')

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        if dry_run:
            print('== DRY RUN - SKIPPING ALL SAVES')

        count = 0
        now = str(timezone.now())
        for hist_match in HistoricalFacilityMatch.objects.filter(
            status='MERGED'
        ).iterator():
            try:
                prev_record = hist_match.prev_record
                if prev_record and prev_record.status in ['REJECTED',
                                                          'PENDING']:
                    list_item = prev_record.facility_list_item
                    valid_matches = FacilityMatch \
                        .objects \
                        .filter(facility_list_item_id=list_item.id,
                                status__in=['AUTOMATIC', 'CONFIRMED'])
                    if len(valid_matches) > 1:
                        print(
                            'Multiple valid matches for list item {}'.format(
                                list_item.id
                            ))
                    elif len(valid_matches) < 1:
                        print(
                            'No valid matches found for list item {}'.format(
                                list_item.id
                            ))
                    else:
                        valid_match = valid_matches[0]
                        if list_item:
                            list_item.facility_id = valid_match.facility_id
                            list_item.processing_results.append({
                                'action': ProcessingAction.UNDO_MERGE,
                                'started_at': now,
                                'error': False,
                                'finished_at': now,
                            })
                            if not dry_run:
                                list_item.save()
                                print(f'item,save,{list_item.pk}')
                            else:
                                print(f'item,dry,{list_item.pk}')

                        try:
                            match = FacilityMatch.objects.get(pk=hist_match.id)
                            if not dry_run:
                                match.status = prev_record.status
                                match.changeReason = 'Fixing merge rejection'
                                match.save()
                                print(f'match,save,{match.pk}')
                            else:
                                print(f'match,dry,{match.pk}')
                        except FacilityMatch.DoesNotExist:
                            print(f'match,missing,{hist_match.id}')
                        count = count + 1

            except Exception as e:
                # In case of an error, we should review/fix the match manually,
                # but not break the loop
                print(f'match,error,{hist_match.id},{e}')

        print('{} items adjusted'.format(count))
