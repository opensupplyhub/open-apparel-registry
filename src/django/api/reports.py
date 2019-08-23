import os

from glob import glob
from urllib.parse import quote

from django.db import connection


_root = os.path.abspath(os.path.dirname(__file__))


def get_report_names():
    file_paths = glob(os.path.join(_root, 'reports', '*.sql'))
    files = [os.path.basename(f) for f in file_paths]
    names = [os.path.splitext(f)[0].replace('_', '-') for f in files]
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
    report_filename = os.path.join(
        _root, 'reports', '{}.sql'.format(name.replace('-', '_')))
    with open(report_filename, 'r') as report_file:
        report_sql = report_file.read()
        with connection.cursor() as cursor:
            cursor.execute(report_sql)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            csv_rows = [','.join([quote_val(c) for c in r]) for r in rows]
            csv_lines = [','.join([quote_val(c) for c in columns])] + csv_rows
            csv_data = quote('\n'.join(csv_lines))
            return {
                'name': name,
                'sql': report_sql,
                'columns': columns,
                'rows': rows,
                'csv_data': csv_data,
            }
