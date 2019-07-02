import sys

from django.conf import settings

from rest_framework.authentication import get_authorization_header


from api.models import RequestLog


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
