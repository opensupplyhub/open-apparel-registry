import os

from glob import glob
from urllib.parse import quote

from django.db import connection
from api.models import HistoricalFacility

_root = os.path.abspath(os.path.dirname(__file__))


def monthly_promoted_name_and_address():
    data = dict()
    historical_facilities = HistoricalFacility.objects \
        .exclude(created_from_id__isnull=True) \
        .order_by('id', 'history_date') \
        .values_list('id', 'history_date', 'created_from_id')
    for i, h in enumerate(historical_facilities):
            if i != 0:
                prev = historical_facilities[i - 1]
                if prev[0] == h[0] and h[2] != prev[2]:
                    month = h[1].strftime('%Y-%m')
                    data[month] = data.get(month, 0) + 1
    return [['month', 'facilities promoted'],
            sorted(data.items(), key=lambda x: x[0])]


NON_SQL_REPORTS = {
    'monthly_promoted_name_and_address': monthly_promoted_name_and_address
}


def get_report_names():
    file_paths = glob(os.path.join(_root, 'reports', '*.sql'))
    files = [os.path.basename(f) for f in file_paths]
    names = [os.path.splitext(f)[0].replace('_', '-') for f in files]
    names += NON_SQL_REPORTS.keys()
    names.sort()
    return names


def quote_val(val):
    if val is None:
        return val
    string_val = str(val)
    if str(string_val).isnumeric():
        return string_val
    return "\"{0}\"".format(string_val)


def run_report(name):
    if name in NON_SQL_REPORTS.keys():
        return run_non_sql_report(name)
    else:
        return run_sql_report(name)


def create_csv_data(columns, rows):
    csv_rows = [','.join([quote_val(c) for c in r]) for r in rows]
    csv_lines = [','.join([quote_val(c) for c in columns])] + csv_rows
    return quote('\n'.join(csv_lines))


def run_non_sql_report(name):
    columns, rows = NON_SQL_REPORTS[name]()
    csv_data = create_csv_data(columns, rows)
    return {
        'name': name,
        'sql': 'N/A: Custom Report',
        'columns': columns,
        'rows': rows,
        'csv_data': csv_data,
    }


def run_sql_report(name):
    report_filename = os.path.join(
        _root, 'reports', '{}.sql'.format(name.replace('-', '_')))
    with open(report_filename, 'r') as report_file:
        report_sql = report_file.read()
        with connection.cursor() as cursor:
            cursor.execute(report_sql)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            csv_data = create_csv_data(columns, rows)

            return {
                'name': name,
                'sql': report_sql,
                'columns': columns,
                'rows': rows,
                'csv_data': csv_data,
            }
