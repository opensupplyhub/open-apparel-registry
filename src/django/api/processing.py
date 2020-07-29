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
from api.matching import normalize_extended_facility_id, clean


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

        if CsvHeaderField.PPE_PRODUCT_TYPES in fields:
            product_types = values[
                fields.index(CsvHeaderField.PPE_PRODUCT_TYPES)]
            # The nested list comprehension ensures that we filter out
            # whitespace-only values
            item.ppe_product_types = \
                [s for s in [s.strip() for s in product_types.split('|')] if s]
        if CsvHeaderField.PPE_CONTACT_PHONE in fields:
            item.ppe_contact_phone = values[
                fields.index(CsvHeaderField.PPE_CONTACT_PHONE)]
        if CsvHeaderField.PPE_CONTACT_EMAIL in fields:
            item.ppe_contact_email = values[
                fields.index(CsvHeaderField.PPE_CONTACT_EMAIL)]
        if CsvHeaderField.PPE_WEBSITE in fields:
            item.ppe_website = values[
                fields.index(CsvHeaderField.PPE_WEBSITE)]

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

            # If there is a validation error on the `ppe_product_types` array
            # field, `full_clean` appears to set it to an empty string which
            # then causes `save` to raise an exception.
            ppe_product_types_is_valid = (
                item.ppe_product_types is None
                or isinstance(item.ppe_product_types, list))
            if not ppe_product_types_is_valid:
                item.ppe_product_types = []

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


def reduce_matches(matches):
    """
    Process a list of facility match scores to remove duplicate facilities,
    choosing the highest match score in the case of a duplicate.

    Arguments:
    matches -- A list of tuples of the format (extended_facility_id, score).

    Returns:
    A list of tuples in the format (facility_id, score). Extended facility

    Example:
        Input:
            [
                (US2020052GKF19F, 75),
                (US2020052GKF19F_MATCH-23, 88),
                (US2020052YDVKBQ, 45)
            ]
        Output:
            [
                (US2020052GKF19F, 88),
                (US2020052YDVKBQ, 45)
            ]
    """
    match_dict = {}
    for extended_id, score in matches:
        facility_id = normalize_extended_facility_id(extended_id)
        if facility_id not in match_dict or match_dict[facility_id] < score:
            match_dict[facility_id] = score
    return list(match_dict.items())


def is_string_match(item, facility):
    """
    Check if a list item is an exact string match to a facility, after
    processing both through the same string cleaning operations used by the
    matcher.

    Arguments:
    item -- A `FacilityListItem` instance being considered as a potential match
            to the specified facility.
    facility -- A `Facility` instance.

    Returns:
    True if the item is a string match to the facility
    """
    return (item.country_code == facility.country_code
            and clean(item.name) == clean(facility.name)
            and clean(item.address) == clean(facility.address))


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

    Returns:
    The list of `FacilityMatch` objects created
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

    all_matches = []
    for item_id, matches in item_matches.items():
        item = FacilityListItem.objects.get(id=item_id)
        item.status = FacilityListItem.POTENTIAL_MATCH
        matches = [make_pending_match(item_id, facility_id, score.item())
                   for facility_id, score in reduce_matches(matches)]

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
            elif len(quality_matches) > 1:
                exact_matches = [m for m in quality_matches
                                 if is_string_match(item, m.facility)]
                # We check == 1 because multiple exact matches should not
                # happen. They are an indication of duplicate facility data
                # that should be merged through moderation tools. Showing the
                # multiple potential matches to the contributor increases the
                # visibility of the issue.
                if len(exact_matches) == 1:
                    exact_matches[0].status = FacilityMatch.AUTOMATIC
                    exact_matches[0].results['match_type'] = \
                        'multiple_gazetteer_matches_with_one_exact_string_match' # NOQA
                    item.status = FacilityListItem.MATCHED
                    item.facility = exact_matches[0].facility

        item.processing_results.append({
            'action': ProcessingAction.MATCH,
            'started_at': started,
            'error': False,
            'finished_at': finished
        })
        item.save()

        if item.source.create:
            for m in matches:
                m.save()
                if m.status == FacilityMatch.AUTOMATIC:
                    should_update_ppe_product_types = (
                        item.has_ppe_product_types
                        and not m.facility.has_ppe_product_types)
                    if should_update_ppe_product_types:
                        m.facility.ppe_product_types = item.ppe_product_types

                    should_update_ppe_contact_phone = (
                        item.has_ppe_contact_phone
                        and not m.facility.has_ppe_contact_phone)
                    if should_update_ppe_contact_phone:
                        m.facility.ppe_contact_phone = item.ppe_contact_phone

                    should_update_ppe_contact_email = (
                        item.has_ppe_contact_email
                        and not m.facility.has_ppe_contact_email)
                    if should_update_ppe_contact_email:
                        m.facility.ppe_contact_email = item.ppe_contact_email

                    should_update_ppe_website = (
                        item.has_ppe_website
                        and not m.facility.has_ppe_website)
                    if should_update_ppe_website:
                        m.facility.ppe_website = item.ppe_website

                    should_save_facility = (
                        should_update_ppe_product_types
                        or should_update_ppe_contact_phone
                        or should_update_ppe_contact_email
                        or should_update_ppe_website)
                    if should_save_facility:
                        m.facility.save()

        all_matches.extend(matches)

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
            if item.source.create:
                facility = Facility(name=item.name,
                                    address=item.address,
                                    country_code=item.country_code,
                                    location=item.geocoded_point,
                                    created_from=item,
                                    ppe_product_types=item.ppe_product_types,
                                    ppe_contact_phone=item.ppe_contact_phone,
                                    ppe_contact_email=item.ppe_contact_email,
                                    ppe_website=item.ppe_website)
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

    return all_matches
