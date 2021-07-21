import os
import pytz

from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from glob import glob
from urllib.parse import quote

from django.db import connection
from django.db.models import Func, F
from api.models import HistoricalFacility, FacilityListItem
from api.constants import ProcessingAction, DateFormats

_root = os.path.abspath(os.path.dirname(__file__))


def sort_by_first_column(array):
    return sorted(array, key=lambda x: x[0])


def try_parsing_date(text):
    for fmt in (DateFormats.STANDARD, DateFormats.SECOND):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            pass
    raise ValueError('no valid date format found')


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
                    month = h[1].strftime(DateFormats.MONTH)
                    data[month] = data.get(month, 0) + 1
    return [['month', 'facilities promoted'],
            sort_by_first_column(data.items())]


def geocoding_time_without_queue(date_format):
    temp_data = dict()

    start_date = datetime.now(tz=timezone.utc) - relativedelta(months=4)
    processing_results = FacilityListItem.objects.filter(
        created_at__gte=start_date,
        processing_results__contains=[{"action": "geocode"}]
    ).annotate(pr_element=Func(
        F('processing_results'),
        function='jsonb_array_elements')
    ).values_list('pr_element', flat=True)

    for r in processing_results:
        if r['action'] == ProcessingAction.GEOCODE:
            try:
                started = try_parsing_date(r['started_at'])
                finished = try_parsing_date(r['finished_at'])
                date = started.strftime(date_format)
                time = finished - started
                counts = temp_data.get(date, (0, 0))
                temp_data[date] = (counts[0] + 1,
                                   counts[1] + time.total_seconds())
            except ValueError:
                pass
    data = dict()
    for d, c in temp_data.items():
        data[d] = c[1] / c[0]
    return sort_by_first_column(data.items())


def monthly_geocoding_time_without_queue():
    rows = geocoding_time_without_queue(DateFormats.MONTH)
    return [['month', 'average_geocoding_time_in_seconds'], rows]


def weekly_geocoding_time_without_queue():
    rows = geocoding_time_without_queue(DateFormats.WEEK)
    return [['week', 'average_geocoding_time_in_seconds'], rows]


def geocoding_time_with_queue(date_format):
    temp_data = dict()
    start_date = datetime.now(tz=timezone.utc) - relativedelta(months=4)
    listitems = FacilityListItem.objects.filter(
        created_at__gte=start_date,
        processing_results__contains=[{"action": "geocode"}]
    ).order_by('-created_at').values_list('created_at', 'processing_results')
    for (created_at, processing_results) in listitems:
        for r in processing_results:
            if r['action'] == ProcessingAction.GEOCODE:
                try:
                    finished = try_parsing_date(r['finished_at']).replace(
                        tzinfo=pytz.UTC)
                    date = created_at.strftime(date_format)
                    time = finished - created_at
                    counts = temp_data.get(date, (0, 0))
                    temp_data[date] = (counts[0] + 1,
                                       counts[1] + time.total_seconds())
                except ValueError:
                    pass
    data = dict()
    for d, c in temp_data.items():
        data[d] = c[1] / c[0]
    return sort_by_first_column(data.items())


def monthly_geocoding_time_with_queue():
    rows = geocoding_time_with_queue(DateFormats.MONTH)
    return [['month', 'average_geocoding_time_in_seconds'], rows]


def weekly_geocoding_time_with_queue():
    rows = geocoding_time_with_queue(DateFormats.WEEK)
    return [['week', 'average_geocoding_time_in_seconds'], rows]


NON_SQL_REPORTS = {
    'monthly_promoted_name_and_address': monthly_promoted_name_and_address,
    'recent_monthly_geocoding_time_without_queue':
    monthly_geocoding_time_without_queue,
    'recent_weekly_geocoding_time_without_queue':
    weekly_geocoding_time_without_queue,
    'recent_monthly_geocoding_time_with_queue':
    monthly_geocoding_time_with_queue,
    'recent_weekly_geocoding_time_with_queue': weekly_geocoding_time_with_queue
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
