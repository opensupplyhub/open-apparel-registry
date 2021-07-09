from datetime import datetime, time
from dateutil.relativedelta import relativedelta
from django.utils import timezone

from django.db.models import F
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.contrib.postgres.aggregates.general import ArrayAgg

from api.models import (Contributor, RequestLog, ContributorNotifications,
                        ApiLimit, ApiBlock)
from api.mail import (send_api_notice, send_admin_api_notice, send_api_warning,
                      send_admin_api_warning)


def get_end_of_year(at_datetime):
    return datetime.combine(at_datetime.replace(month=12, day=31), time.max)


def get_api_block(contributor):
    return ApiBlock.objects.filter(
                contributor=contributor).order_by('-until').first()


def get_start_date(period_start_date):
    start_date = period_start_date
    one_year_in_past = datetime.now(tz=timezone.utc) - relativedelta(years=1)
    while (start_date < one_year_in_past):
        start_date = start_date + relativedelta(years=1)
    return start_date


@transaction.atomic
def check_contributor_api_limit(at_datetime, c):
    contributor = Contributor.objects.get(id=c.get('contributor'))
    log_dates = c.get('log_dates')
    notification, created = ContributorNotifications \
        .objects \
        .get_or_create(contributor=contributor)
    try:
        apiLimit = ApiLimit.objects.get(contributor=contributor)
        limit = apiLimit.yearly_limit
        start_date = get_start_date(apiLimit.period_start_date)
    except ObjectDoesNotExist:
        limit = settings.API_FREE_REQUEST_LIMIT
        start_date = get_start_date(min(log_dates))
    if limit == 0:
        return
    logs_for_period = [x for x in log_dates if x >= start_date]
    request_count = len(logs_for_period)
    if request_count > (limit * .9) and request_count <= limit:
        warning_sent = notification.api_limit_warning_sent_on
        # If no warning was sent in this period
        if (warning_sent is None or warning_sent < start_date):
            send_api_warning(contributor, limit)
            send_admin_api_warning(contributor.name, limit)
            notification.api_limit_warning_sent_on = at_datetime
            notification.save()
    if request_count > limit:
        apiBlock = get_api_block(contributor)
        # If there is no current API block
        if apiBlock is None or apiBlock.until < at_datetime:
            until = start_date + relativedelta(years=1)
            ApiBlock.objects.create(contributor=contributor,
                                    until=until, active=True,
                                    limit=limit, actual=request_count)
            exceeded_sent = notification.api_limit_exceeded_sent_on
            if (exceeded_sent is None or
                    exceeded_sent.month < at_datetime.month):
                send_api_notice(contributor, limit)
                send_admin_api_notice(contributor.name, limit)
                notification.api_limit_exceeded_sent_on = (
                    at_datetime)
                notification.save()
        else:
            if apiBlock.active or apiBlock.grace_limit is None:
                return
            grace_limit = apiBlock.grace_limit
            if request_count > grace_limit:
                with transaction.atomic():
                    apiBlock.actual = request_count
                    apiBlock.active = True
                    apiBlock.save()
                send_api_notice(contributor, limit, grace_limit)
                send_admin_api_notice(contributor.name, limit, grace_limit)
                notification.api_grace_limit_exceeded_sent_on = (
                    at_datetime)
                notification.save()


def check_api_limits(at_datetime):
    contributor_logs = RequestLog.objects.filter(
            response_code__gte=200,
            response_code__lte=299).annotate(
                contributor=F('user__contributor__id')
            ).values('contributor').annotate(
                log_dates=ArrayAgg('created_at')
            )
    for c in contributor_logs:
        check_contributor_api_limit(at_datetime, c)
