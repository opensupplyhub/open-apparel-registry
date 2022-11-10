from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import FacilityMatch, HistoricalFacilityMatch, FacilityListItem
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

        now = str(timezone.now())

        def update_list_item(item, facility_id):
            if item:
                item.facility_id = facility_id
                item.processing_results.append({
                    'action': ProcessingAction.UNDO_MERGE,
                    'started_at': now,
                    'error': False,
                    'finished_at': now,
                })
                if not dry_run:
                    item.save()
                    print(f'item,save,{item.pk}')
                else:
                    print(f'item,dry,{item.pk}')

        def update_match(hist_match, prev_record, note=''):
            try:
                match = FacilityMatch.objects.get(pk=hist_match.id)
                if not dry_run:
                    match.status = prev_record.status
                    match.changeReason = 'Fixing incorrect merge'
                    match.save()
                    print(f'match,save,{match.pk},{note}')
                else:
                    print(f'match,dry,{match.pk},{note}')
            except FacilityMatch.DoesNotExist:
                print(f'match,missing,{hist_match.id},{note}')

        count = 0
        no_valid_matches = set()
        multiple_valid_matches = set()
        for hist_match in HistoricalFacilityMatch.objects.filter(
            status='MERGED'
        ).order_by('history_date').iterator():
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
                        multiple_valid_matches.add(list_item.id)
                    elif len(valid_matches) < 1:
                        no_valid_matches.add(list_item.id)
                    else:
                        valid_match = valid_matches[0]
                        if list_item:
                            update_list_item(list_item,
                                             valid_match.facility_id)

                        update_match(hist_match, prev_record)

                        count = count + 1

            except Exception as e:
                # In case of an error, we should review/fix the match manually,
                # but not break the loop
                print(f'match,error,{hist_match.id},{e}')

        print(f'handling items with no valid matches,{no_valid_matches}')
        for item_id in no_valid_matches:
            try:
                hist_matches = HistoricalFacilityMatch.objects.filter(
                     facility_list_item_id=item_id,
                     status='MERGED'
                ).order_by('history_date')

                valid_match = None
                all_items_invalid = True
                for hist_match in hist_matches:
                    prev_match = hist_match.prev_record
                    if prev_match:
                        status = prev_match.status
                        if status in ['AUTOMATIC', 'CONFIRMED']:
                            # This match was merged through normal channels.
                            # The list item should point to its facility.
                            valid_match = prev_match
                            all_items_invalid = False
                        elif status not in ['REJECTED', 'PENDING']:
                            # This match has items that are neither definitely
                            # valid or definitely invalid.
                            all_items_invalid = False

                if valid_match:
                    item = None
                    try:
                        item = FacilityListItem.objects.get(pk=item_id)
                        update_list_item(item,
                                         valid_match.facility_id)
                        for hist_match in hist_matches:
                            prev_record = hist_match.prev_record
                            if prev_record and prev_record.status in [
                                    'REJECTED', 'PENDING']:
                                update_match(hist_match,
                                             hist_match.prev_record,
                                             'undo_merged_with_valid')
                        count = count + 1
                    except FacilityListItem.DoesNotExist:
                        print(f'item,missing,{item_id}')
                elif all_items_invalid:
                    try:
                        item = FacilityListItem.objects.get(pk=item_id)
                        update_list_item(item, None)
                        for hist_match in hist_matches:
                            prev_record = hist_match.prev_record
                            if prev_record and prev_record.status in [
                                    'REJECTED', 'PENDING']:
                                update_match(hist_match,
                                             hist_match.prev_record,
                                             'undo_all_invalid_merged')
                        count = count + 1
                    except FacilityListItem.DoesNotExist:
                        print(f'item,missing,{item_id}')
                else:
                    print('No valid matches for list item {}'.format(
                            item_id
                         ))
            except Exception as e:
                # In case of an error, we should review/fix the match manually,
                # but not break the loop
                print(f'match,error,{hist_match.id},{e}')
        print(f'Multiple valid matches for {multiple_valid_matches}')
        print('{} items adjusted'.format(count))
