from dateutil.relativedelta import relativedelta

from django.db.models import Count, F
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings

from api.models import (Contributor, RequestLog, ContributorNotifications,
                        ApiLimit, ApiBlock)
from api.mail import (send_api_notice, send_admin_api_notice, send_api_warning,
                      send_admin_api_warning)


def get_end_of_month(at_datetime):
    return (at_datetime.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0)
            + relativedelta(months=1) - relativedelta(seconds=1))


@transaction.atomic
def check_contributor_api_limit(at_datetime, c):
    contributor = Contributor.objects.get(id=c.get('contributor'))
    notification, created = ContributorNotifications \
        .objects \
        .get_or_create(contributor=contributor)
    try:
        apiLimit = ApiLimit.objects.get(contributor=contributor)
        limit = apiLimit.monthly_limit
    except ObjectDoesNotExist:
        limit = settings.API_FREE_REQUEST_LIMIT
    if limit == 0:
        return
    request_count = c.get('request_count', 0)
    if request_count > (limit * .9) and request_count <= limit:
        warning_sent = notification.api_limit_warning_sent_on
        if (warning_sent is None or
                warning_sent.month < at_datetime.month):
            send_api_warning(contributor, limit)
            send_admin_api_warning(contributor.name, limit)
            notification.api_limit_warning_sent_on = at_datetime
            notification.save()
    if request_count > limit:
        apiBlock = ApiBlock.objects.filter(
                    contributor=contributor).order_by('-until').first()
        if apiBlock is None or apiBlock.until < at_datetime:
            until = get_end_of_month(at_datetime)
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
            created_at__year=at_datetime.year,
            created_at__month=at_datetime.month,
            response_code__gte=200,
            response_code__lte=299).annotate(
                contributor=F('user__contributor__id')
            ).values('contributor').annotate(request_count=Count('id'))
    for c in contributor_logs:
        check_contributor_api_limit(at_datetime, c)
