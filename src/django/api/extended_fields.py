import re
from api.models import Contributor, ExtendedField


def extract_range_value(value):
    values = [int(x) for x
              in re.findall(r'([0-9]+)', str(value).replace(',', ''))]
    return {"min": min(values, default=0), "max": max(values, default=0)}


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
        ExtendedField.objects.create(
            contributor=contributor,
            facility_list_item=item,
            field_name=field,
            value=field_value
        )


RAW_DATA_FIELDS = (ExtendedField.NUMBER_OF_WORKERS,
                   ExtendedField.NATIVE_LANGUAGE_NAME,
                   ExtendedField.PARENT_COMPANY)


def create_extendedfields_for_single_item(item, raw_data):
    if item.id is None:
        return False
    contributor = item.source.contributor
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
