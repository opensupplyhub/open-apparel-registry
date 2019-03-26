import os
import sys

from django.core.management.base import BaseCommand
from django.db import transaction

from api.constants import ProcessingAction
from api.models import FacilityList, FacilityListItem
from api.processing import (parse_facility_list_item,
                            geocode_facility_list_item,
                            match_facility_list_items,
                            save_match_details)

LINE_ITEM_ACTIONS = {
    ProcessingAction.PARSE: parse_facility_list_item,
    ProcessingAction.GEOCODE: geocode_facility_list_item,
}

LIST_ACTIONS = set([ProcessingAction.MATCH])

VALID_ACTIONS = list(LINE_ITEM_ACTIONS.keys()) + list(LIST_ACTIONS)


class Command(BaseCommand):
    help = 'Run an action on all items in a facility list. If ' \
           'AWS_BATCH_JOB_ARRAY_INDEX environment variable is set, will ' \
           'process those items whose row_index matches it. Otherwise, will ' \
           'process all items for the given facility list.'

    def add_arguments(self, parser):
        # Create a group of arguments explicitly labeled as required,
        # because by default named arguments are considered optional.
        group = parser.add_argument_group('required arguments')
        group.add_argument('-a', '--action',
                           required=True,
                           help='The processing action to perform. '
                                'One of "parse", "geocode", "match"')
        group.add_argument('-l', '--list-id',
                           required=True,
                           help='The id of the facility list to process.')

    def handle(self, *args, **options):
        action = options['action']
        list_id = options['list_id']

        # Crash if invalid action specified
        if (action not in VALID_ACTIONS):
            self.stderr.write('Validation Error: Invalid action "{0}". '
                              'Must be one of {1}'
                              .format(action, ', '.join(VALID_ACTIONS)))
            sys.exit(1)

        if action in LINE_ITEM_ACTIONS.keys():
            process = LINE_ITEM_ACTIONS[action]

        # Crash if invalid list_id specified
        try:
            facility_list = FacilityList.objects.get(pk=list_id)
        except FacilityList.DoesNotExist:
            self.stderr.write('Validation Error: '
                              'No facility list with id {}.'.format(list_id))
            sys.exit(1)

        if action in LINE_ITEM_ACTIONS.keys():
            self.process_items(facility_list, action, process)
        elif action == ProcessingAction.MATCH:
            facility_list = FacilityList.objects.get(id=list_id)
            total_item_count = facility_list.facilitylistitem_set.count()

            result = match_facility_list_items(facility_list)
            success_count = len(result['processed_list_item_ids'])
            fail_count = total_item_count - success_count

            with transaction.atomic():
                save_match_details(result)

            if success_count > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        '{}: {} successes'.format(
                            action, success_count)))
            if fail_count > 0:
                self.stdout.write(
                    self.style.ERROR(
                        '{}: {} failures'.format(
                            action, fail_count)))

    def process_items(self, facility_list, action, process):
        row_index = os.environ.get('AWS_BATCH_JOB_ARRAY_INDEX')
        if row_index:
            items = FacilityListItem.objects.filter(
                facility_list=facility_list,
                row_index=row_index)
        else:
            items = FacilityListItem.objects.filter(
                facility_list=facility_list)

        result = {
            'success': 0,
            'failure': 0,
        }

        # Process all items, save affected items, facilities, matches,
        # and tally successes and failures
        for item in items:
            try:
                with transaction.atomic():
                    if action == ProcessingAction.MATCH:
                        matches = process(item)
                        item.save()

                        if len(matches) == 1:
                            [match] = matches

                            if match.facility.created_from == item:
                                item.facility = match.facility
                                item.save()
                            elif match.confidence == 1.0:
                                item.facility = match.facility
                                item.save()
                    else:
                        process(item)
                        item.save()

                if item.status in FacilityListItem.ERROR_STATUSES:
                    result['failure'] += 1
                else:
                    result['success'] += 1
            except ValueError as e:
                self.stderr.write('Value Error: {}'.format(e))
                result['failure'] += 1

        # Print successes
        if result['success'] > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    '{}: {} successes'.format(
                        action, result['success'])))

        # Print failures
        if result['failure'] > 0:
            self.stdout.write(
                self.style.ERROR(
                    '{}: {} failures'.format(
                        action, result['failure'])))
