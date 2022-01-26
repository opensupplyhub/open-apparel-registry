import re
import csv
import json

CONSONANT_SOUND = re.compile(r'''
one(![ir])
''', re.IGNORECASE | re.VERBOSE)

VOWEL_SOUND = re.compile(r'''
[aeio]|
u([aeiou]|[^n][^aeiou]|ni[^dmnl]|nil[^l])|
h(ier|onest|onou?r|ors\b|our(!i))|
[fhlmnrsx]\b
''', re.IGNORECASE | re.VERBOSE)


def prefix_a_an(value):
    """
    Return a string prefixed with "a" or "an" as appropriate.
    Based on https://djangosnippets.org/snippets/1519/
    """
    if not CONSONANT_SOUND.match(value) and VOWEL_SOUND.match(value):
        return 'An {}'.format(value)
    return 'A {}'.format(value)


def parse_raw_data(data):
    try:
        # try to parse as json
        return json.loads(data)
    except json.decoder.JSONDecodeError:
        try:
            # try to parse as stringified object
            return json.loads(data.replace("'", '"'))
        except json.decoder.JSONDecodeError:
            return {}


def get_csv_values(csv_data):
    values = []
    csvreader = csv.reader(csv_data.split('\n'), delimiter=',')
    for row in csvreader:
        values = values + row
    return values


def get_single_contributor_field_values(item, fields):
    data = parse_raw_data(item.raw_data)
    for f in fields:
        value = data.get(f['column_name'], None)
        if value is not None:
            f['value'] = value
    return fields


def get_list_contributor_field_values(item, fields):
    data_values = get_csv_values(item.raw_data)
    list_fields = get_csv_values(item.source.facility_list.header)
    for f in fields:
        if f['column_name'] in list_fields:
            index = list_fields.index(f['column_name'])
            f['value'] = data_values[index]
    return fields
