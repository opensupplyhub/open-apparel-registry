import re
import csv
import json
from unidecode import unidecode

from api.constants import NumberOfWorkersRanges

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


def clean(column):
    """
    Remove punctuation and excess whitespace from a value before using it to
    find matches. This should be the same function used when developing the
    training data read from training.json as part of train_gazetteer.
    """
    column = unidecode(column)
    column = re.sub('\n', ' ', column)
    column = re.sub('-', '', column)
    column = re.sub('/', ' ', column)
    column = re.sub("'", '', column)
    column = re.sub(",", '', column)
    column = re.sub(":", ' ', column)
    column = re.sub(' +', ' ', column)
    column = column.strip().strip('"').strip("'").lower().strip()
    if not column:
        column = None
    return column


def value_is_in_range(range_value, range):
    range_min = range.get('min', 0)
    range_max = range.get('max', None)
    value_min = range_value.get('min', 0)
    value_max = range_value.get('max', value_min)
    if value_min < range_min:
        return value_max >= range_min
    if value_min >= range_min:
        return range_max is None or value_min <= range_max


def convert_to_standard_ranges(number_of_workers, overlapping_ranges=None):
    if overlapping_ranges is None:
        overlapping_ranges = set()
    for range in NumberOfWorkersRanges.STANDARD_RANGES:
        if value_is_in_range(number_of_workers, range):
            overlapping_ranges.add(range.get('label', ''))
    return overlapping_ranges


def format_custom_text(contributor_id, value):
    return '{}|{}'.format(contributor_id, value.strip().lower())
