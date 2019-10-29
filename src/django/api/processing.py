import csv
import traceback
import sys

import xlrd

from datetime import datetime

from django.conf import settings
from django.contrib.gis.geos import Point
from django.core.exceptions import ValidationError

from api.constants import CsvHeaderField, ProcessingAction
from api.models import Facility, FacilityMatch, FacilityListItem
from api.countries import COUNTRY_CODES, COUNTRY_NAMES
from api.geocoding import geocode_address


def _report_error_to_rollbar(file, request):
    ROLLBAR = getattr(settings, 'ROLLBAR', {})
    if ROLLBAR:
        import rollbar
        rollbar.report_exc_info(
            sys.exc_info(),
            extra_data={
                'user_id': request.user.id,
                'contributor_id': request.user.contributor.id,
                'file_name': file.name})


def get_excel_sheet(file, request):
    import defusedxml
    from defusedxml.common import EntitiesForbidden

    defusedxml.defuse_stdlib()

    try:
        return xlrd.open_workbook(file_contents=file.read(),
                                  on_demand=True).sheet_by_index(0)
    except EntitiesForbidden:
        _report_error_to_rollbar(file, request)
        raise ValidationError('This file may be damaged and '
                              'cannot be processed safely')


def parse_excel(file, request):
    try:
        sheet = get_excel_sheet(file, request)

        header = ','.join(sheet.row_values(0))
        rows = ['"{}"'.format('","'.join(sheet.row_values(idx)))
                for idx in range(1, sheet.nrows)]

        return header, rows
    except Exception:
        _report_error_to_rollbar(file, request)
        raise ValidationError('Error parsing Excel file')


def parse_csv(file, request):
    rows = []

    try:
        header = file.readline().decode(encoding='utf-8-sig').rstrip()
    except UnicodeDecodeError:
        _report_error_to_rollbar(file, request)
        raise ValidationError('Unsupported file encoding. Please '
                              'submit a UTF-8 CSV.')

    for idx, line in enumerate(file):
        if idx > 0:
            try:
                rows.append(line.decode(encoding='utf-8-sig').rstrip())
            except UnicodeDecodeError:
                _report_error_to_rollbar(file, request)
                raise ValidationError('Unsupported file encoding. Please '
                                      'submit a UTF-8 CSV.')

    return header, rows


def parse_csv_line(line):
    return list(csv.reader([line]))[0]


def get_country_code(country):
    # TODO: Handle minor spelling errors in country names
    country = str(country)
    if country.upper() in COUNTRY_NAMES:
        return country.upper()
    elif country.lower() in COUNTRY_CODES:
        return COUNTRY_CODES[country.lower()]
    else:
        raise ValueError(
            'Could not find a country code for "{0}".'.format(country))


def parse_facility_list_item(item):
    started = str(datetime.utcnow())
    if type(item) != FacilityListItem:
        raise ValueError('Argument must be a FacilityListItem')
    if item.status != FacilityListItem.UPLOADED:
        raise ValueError('Items to be parsed must be in the UPLOADED status')
    try:
        is_geocoded = False
        fields = [f.lower()
                  for f in parse_csv_line(item.source.facility_list.header)]
        values = parse_csv_line(item.raw_data)
        if CsvHeaderField.COUNTRY in fields:
            item.country_code = get_country_code(
                values[fields.index(CsvHeaderField.COUNTRY)])
        if CsvHeaderField.NAME in fields:
            item.name = values[fields.index(CsvHeaderField.NAME)]
        if CsvHeaderField.ADDRESS in fields:
            item.address = values[fields.index(CsvHeaderField.ADDRESS)]
        if CsvHeaderField.LAT in fields and CsvHeaderField.LNG in fields:
            lat = float(values[fields.index(CsvHeaderField.LAT)])
            lng = float(values[fields.index(CsvHeaderField.LNG)])
            item.geocoded_point = Point(lng, lat)
            is_geocoded = True
        try:
            item.full_clean(exclude=('processing_started_at',
                                     'processing_completed_at',
                                     'processing_results', 'geocoded_point',
                                     'facility'))
            item.status = FacilityListItem.PARSED
            item.processing_results.append({
                'action': ProcessingAction.PARSE,
                'started_at': started,
                'error': False,
                'finished_at': str(datetime.utcnow()),
                'is_geocoded': is_geocoded,
            })
        except ValidationError as ve:
            messages = []
            for name, errors in ve.error_dict.items():
                # We need to clear the invalid value so we can save the row
                setattr(item, name, '')
                error_str = ''.join(''.join(e.messages) for e in errors)
                messages.append(
                    'There is a problem with the {0}: {1}'.format(name,
                                                                  error_str)
                )
            item.status = FacilityListItem.ERROR_PARSING
            item.processing_results.append({
                'action': ProcessingAction.PARSE,
                'started_at': started,
                'error': True,
                'message': '\n'.join(messages),
                'trace': traceback.format_exc(),
                'finished_at': str(datetime.utcnow()),
            })
    except Exception as e:
        item.status = FacilityListItem.ERROR_PARSING
        item.processing_results.append({
            'action': ProcessingAction.PARSE,
            'started_at': started,
            'error': True,
            'message': str(e),
            'trace': traceback.format_exc(),
            'finished_at': str(datetime.utcnow()),
        })


def geocode_facility_list_item(item):
    started = str(datetime.utcnow())
    if type(item) != FacilityListItem:
        raise ValueError('Argument must be a FacilityListItem')
    if item.status != FacilityListItem.PARSED:
        raise ValueError('Items to be geocoded must be in the PARSED status')
    try:
        if item.geocoded_point is None:
            data = geocode_address(item.address, item.country_code)
            if data['result_count'] > 0:
                item.status = FacilityListItem.GEOCODED
                item.geocoded_point = Point(
                    data["geocoded_point"]["lng"],
                    data["geocoded_point"]["lat"]
                )
                item.geocoded_address = data["geocoded_address"]
            else:
                item.status = FacilityListItem.GEOCODED_NO_RESULTS
            item.processing_results.append({
                'action': ProcessingAction.GEOCODE,
                'started_at': started,
                'error': False,
                'skipped_geocoder': False,
                'data': data['full_response'],
                'finished_at': str(datetime.utcnow()),
               })
        else:
            item.status = FacilityListItem.GEOCODED
            item.geocoded_address = item.address
            item.processing_results.append({
                'action': ProcessingAction.GEOCODE,
                'started_at': started,
                'error': False,
                'skipped_geocoder': True,
                'finished_at': str(datetime.utcnow()),
            })

    except Exception as e:
        item.status = FacilityListItem.ERROR_GEOCODING
        item.processing_results.append({
            'action': ProcessingAction.GEOCODE,
            'started_at': started,
            'error': True,
            'message': str(e),
            'trace': traceback.format_exc(),
            'finished_at': str(datetime.utcnow()),
        })


def save_match_details(match_results):
    """
    Save the results of a call to match_facility_list_items by creating
    Facility and FacilityMatch instances and updating the state of the affected
    FacilityListItems.

    Should be called in a transaction to ensure that all the updates are
    applied atomically.

    Arguments:
    match_results -- The dict return value from a call to
                     match_facility_list_items.
    """
    processed_list_item_ids = match_results['processed_list_item_ids']
    item_matches = match_results['item_matches']
    results = match_results['results']
    started = match_results['started']
    finished = match_results['finished']

    automatic_threshold = results['automatic_threshold']

    def make_pending_match(item_id, facility_id, score):
        return FacilityMatch(
            facility_list_item_id=item_id,
            facility_id=facility_id,
            confidence=score,
            status=FacilityMatch.PENDING,
            results=results)

    for item_id, matches in item_matches.items():
        item = FacilityListItem.objects.get(id=item_id)
        item.status = FacilityListItem.POTENTIAL_MATCH
        matches = [make_pending_match(item_id, facility_id, score.item())
                   for facility_id, score in matches]

        if len(matches) == 1:
            if matches[0].confidence >= automatic_threshold:
                matches[0].status = FacilityMatch.AUTOMATIC
                matches[0].results['match_type'] = 'single_gazetteer_match'
                item.status = FacilityListItem.MATCHED
                item.facility = matches[0].facility
        else:
            quality_matches = [m for m in matches
                               if m.confidence > automatic_threshold]
            if len(quality_matches) == 1:
                matches[0].status = FacilityMatch.AUTOMATIC
                matches[0].results['match_type'] = \
                    'one_gazetteer_match_greater_than_threshold'
                item.status = FacilityListItem.MATCHED
                item.facility = matches[0].facility

        item.processing_results.append({
            'action': ProcessingAction.MATCH,
            'started_at': started,
            'error': False,
            'finished_at': finished
        })
        item.save()

        for m in matches:
            m.save()

    unmatched = (FacilityListItem.objects
                 .filter(id__in=processed_list_item_ids)
                 .exclude(id__in=item_matches.keys()))
    for item in unmatched:
        if item.status == FacilityListItem.GEOCODED_NO_RESULTS:
            item.status = FacilityListItem.ERROR_MATCHING
            item.processing_results.append({
                'action': ProcessingAction.MATCH,
                'started_at': started,
                'error': True,
                'message': ('No match to an existing facility and cannot '
                            'create a new facility without a geocode result'),
                'finished_at': finished
            })
        else:
            facility = Facility(name=item.name,
                                address=item.address,
                                country_code=item.country_code,
                                location=item.geocoded_point,
                                created_from=item)
            facility.save()

            match = make_pending_match(item.id, facility.id, 1.0)
            match.results['match_type'] = 'no_gazetteer_match'
            match.status = FacilityMatch.AUTOMATIC
            match.save()

            item.facility = facility
            item.status = FacilityListItem.MATCHED
            item.processing_results.append({
                'action': ProcessingAction.MATCH,
                'started_at': started,
                'error': False,
                'finished_at': finished
            })
        item.save()
