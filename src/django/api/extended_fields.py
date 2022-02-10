import re
from django.core import exceptions as core_exceptions
from api.models import Contributor, ExtendedField
from api.facility_type_processing_type import (
    get_facility_and_processing_type,
    ALL_PROCESSING_TYPES
)


def extract_range_value(value):
    values = [int(x) for x
              in re.findall(r'([0-9]+)', str(value).replace(',', ''))]
    return {"min": min(values, default=0), "max": max(values, default=0)}


MAX_PRODUCT_TYPE_COUNT = 50


def create_extendedfield(field, field_value, item, contributor):
    if field_value is not None and field_value != "":
        if field == ExtendedField.NUMBER_OF_WORKERS:
            field_value = extract_range_value(field_value)
        elif field == ExtendedField.PARENT_COMPANY:
            matches = Contributor.objects.filter_by_name(field_value)
            if matches.exists():
                field_value = {
                    'raw_value': field_value,
                    'contributor_name': matches[0].name,
                    'contributor_id': matches[0].id
                }
            else:
                field_value = {
                    'raw_value': field_value,
                    'name': field_value
                }
        elif field == ExtendedField.PRODUCT_TYPE:
            if isinstance(field_value, str):
                field_value = field_value.split('|')
            if not isinstance(field_value, list):
                raise core_exceptions.ValidationError(
                    'Expected product_type to be a list or string '
                    f'but got {field_value}')
            if len(field_value) > MAX_PRODUCT_TYPE_COUNT:
                raise core_exceptions.ValidationError(
                    f'You may submit a maximum of {MAX_PRODUCT_TYPE_COUNT} '
                    f'product types, not {len(field_value)}')
            field_value = {
                'raw_values':  field_value,
            }
        elif (field == ExtendedField.FACILITY_TYPE or
              field == ExtendedField.PROCESSING_TYPE):
            values = field_value

            if isinstance(field_value, str):
                values = (field_value.split('|') if '|' in field_value
                          else [field_value])

            deduped_values = list(dict.fromkeys(values))
            results = []

            for value in deduped_values:
                result = get_facility_and_processing_type(value)
                if result[0] is None:
                    raise ValueError(
                        f'No match found for {field}. Value must '
                        'be one of the following: '
                        f'{", ".join(list(ALL_PROCESSING_TYPES.keys()))}'
                    )
                results.append(result)

            field_value = {
                'raw_values': field_value,
                'matched_values': results,
            }

        ExtendedField.objects.create(
            contributor=contributor,
            facility_list_item=item,
            field_name=field,
            value=field_value
        )


RAW_DATA_FIELDS = (ExtendedField.NUMBER_OF_WORKERS,
                   ExtendedField.NATIVE_LANGUAGE_NAME,
                   ExtendedField.PARENT_COMPANY,
                   ExtendedField.PRODUCT_TYPE,
                   ExtendedField.FACILITY_TYPE,
                   ExtendedField.PROCESSING_TYPE)


def create_extendedfields_for_single_item(item, raw_data):
    if item.id is None:
        return False
    contributor = item.source.contributor

    # Add a facility_type extended field if the user only
    # submitted a processing_type
    if (raw_data.get('processing_type') and
       raw_data.get('facility_type') is None):
        raw_data['facility_type'] = raw_data['processing_type']
    # Add a processing_type extended field if the user only
    # submitted a facility_type
    elif (raw_data.get('facility_type') and
          raw_data.get('processing_type') is None):
        raw_data['processing_type'] = raw_data['facility_type']

    for field in RAW_DATA_FIELDS:
        field_value = raw_data.get(field)
        create_extendedfield(field, field_value, item, contributor)


def create_extendedfields_for_listitem(item, fields, values):
    if item.id is None:
        return False
    contributor = item.source.contributor

    for field in RAW_DATA_FIELDS:
        if field in fields:
            field_value = values[fields.index(field)]
            create_extendedfield(field, field_value, item, contributor)

            # Add a facility_type extended field if the user only
            # submitted a processing_type
            if (field == 'processing_type' and
               'facility_type' not in fields):
                create_extendedfield('facility_type', field_value, item,
                                     contributor)
            # Add a processing_type extended field if the user only
            # submitted a facility_type
            elif (field == 'facility_type' and
                  'processing_type' not in fields):
                create_extendedfield('processing_type', field_value, item,
                                     contributor)


def update_extendedfields_for_list_item(list_item):
    for extended_field in ExtendedField.objects.filter(
            facility_list_item=list_item):
        extended_field.facility = list_item.facility
        extended_field.save()


CLAIM_FIELDS = (
          ('facility_name_english', ExtendedField.NAME),
          ('facility_address', ExtendedField.ADDRESS),
          ('facility_workers_count', ExtendedField.NUMBER_OF_WORKERS),
          ('facility_name_native_language', ExtendedField.NATIVE_LANGUAGE_NAME)
         )


def create_extendedfields_for_claim(claim):
    if claim.id is None:
        return False
    c = claim.contributor
    f = claim.facility

    for claim_field, extended_field in CLAIM_FIELDS:
        field_value = getattr(claim, claim_field)
        if field_value is not None and field_value != "":
            if extended_field == ExtendedField.NUMBER_OF_WORKERS:
                field_value = extract_range_value(field_value)
            try:
                field = ExtendedField.objects.get(facility_claim=claim,
                                                  field_name=extended_field)
                field.value = field_value
                field.save()
            except ExtendedField.DoesNotExist:
                ExtendedField.objects.create(contributor=c,
                                             facility=f,
                                             facility_claim=claim,
                                             field_name=extended_field,
                                             value=field_value)
        else:
            ExtendedField.objects.filter(facility_claim=claim,
                                         field_name=extended_field).delete()
