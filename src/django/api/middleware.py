import sys
import datetime
import logging

from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.authentication import get_authorization_header
from rest_framework.authtoken.models import Token

from django.http import HttpResponse

from api.models import RequestLog
from api.limits import get_api_block

logger = logging.getLogger(__name__)


def _report_error_to_rollbar(request, auth):
    ROLLBAR = getattr(settings, 'ROLLBAR', {})
    if ROLLBAR:
        import rollbar
        rollbar.report_exc_info(
            sys.exc_info(),
            extra_data={'auth': auth})


class RequestLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        auth = None
        try:
            if request.user and request.user.is_authenticated:
                auth = get_authorization_header(request)
                if auth and auth.split()[0].lower() == 'token'.encode():
                    token = auth.split()[1].decode()
                    RequestLog.objects.create(
                        user=request.user,
                        token=token,
                        method=request.method,
                        path=request.get_full_path(),
                        response_code=response.status_code,
                    )
        except Exception:
            try:
                _report_error_to_rollbar(request, auth)
            except Exception:
                pass  # We don't want this logging middleware to fail a request

        return response


def get_token(request):
    auth_header = get_authorization_header(request).decode()
    if auth_header and auth_header.split()[0].lower() == 'token':
        try:
            return Token.objects.get(key=auth_header.split()[1])
        except Token.DoesNotExist:
            # This function is designed to be called as part middleware and may
            # execute before Django REST Framework has processed the token
            # auth. A non-existent (invalid) token will be handled by that
            # process, so at this point we just want to quietly return None
            # rather than raise.
            return None
    else:
        return None


def has_active_block(request):
    def debug_log(msg):
        if request.path != '/health-check/':
            logger.debug(msg)
    debug_log('has_active_block handling request {0}'.format(
        request.__dict__))
    try:
        token = get_token(request)
        if token is None:
            debug_log('has_active_block did not find a token')
            return False
        debug_log(
            'has_active_block fetched token {0}...'.format(
                token.pk[:4]))

        contributor = token.user.contributor
        debug_log(
            'has_active_block fetched contributor {0}'.format(
                contributor.id))
        apiBlock = get_api_block(contributor)
        if apiBlock is not None:
            debug_log(
                'has_active_block fetched block {0}'.format(
                    apiBlock.__dict__))
        else:
            debug_log(
                'has_active_block no block found for contributor {0}'
                .format(contributor.id))

        at_datetime = datetime.datetime.now(tz=timezone.utc)
        debug_log(
            'has_active_block at_datetime is {0}'.format(
                at_datetime))
        return (apiBlock is not None and
                apiBlock.until > at_datetime and apiBlock.active)
        debug_log('has_active_block did not see a token header')
    except ObjectDoesNotExist:
        debug_log('has_active_block caught ObjectDoesNotExist exception')
        debug_log('has_active_block returning False from the except block')
        return False
    debug_log('has_active_block returning False')
    return False


class RequestMeterMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        is_docs = request.get_full_path() == '/api/docs/?format=openapi'
        is_blocked = has_active_block(request)

        if is_blocked and not is_docs:
            return HttpResponse('API limit exceeded', status=402)
        else:
            response = self.get_response(request)
            return response
