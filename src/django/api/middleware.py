import sys
import datetime
import json

from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.authentication import get_authorization_header
from rest_framework.authtoken.models import Token

from django.http import HttpResponse

from api.models import RequestLog
from api.limits import get_api_block


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
    try:
        token = get_token(request)
        if token is None:
            return False

        contributor = token.user.contributor
        apiBlock = get_api_block(contributor)
        at_datetime = datetime.datetime.now(tz=timezone.utc)
        return (apiBlock is not None and
                apiBlock.until > at_datetime and apiBlock.active)
    except ObjectDoesNotExist:
        return False
    return False


def token_has_contributor(request):
    try:
        token = get_token(request)
        if token is None:
            return True
        return token.user.contributor is not None
    except ObjectDoesNotExist:
        return False


class RequestMeterMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        is_docs = request.get_full_path() == '/api/docs/?format=openapi'
        is_blocked = has_active_block(request)
        if is_blocked and not is_docs:
            return HttpResponse(json.dumps({'detail': 'API limit exceeded'}),
                                content_type='application/json',
                                status=402)

        if not token_has_contributor(request) and not is_docs:
            return HttpResponse(json.dumps({'detail': 'User has no ' +
                                            'associated contributor'}),
                                content_type='application/json',
                                status=402)

        response = self.get_response(request)
        return response
