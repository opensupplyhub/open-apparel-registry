from urllib.parse import urlparse

from django.conf import settings
from django.utils.http import is_same_domain
from rest_framework import permissions


def _report_warning_to_rollbar(message, extra_data=None):
    ROLLBAR = getattr(settings, 'ROLLBAR', {})
    if ROLLBAR:
        import rollbar
        rollbar.report_message(message, level='warning', extra_data=extra_data)


def referring_host(request):
    referer = urlparse(request.META.get('HTTP_REFERER', ''))
    return referer.netloc.split(':')[0]


def referring_host_is_allowed(host):
    for pattern in settings.ALLOWED_HOSTS:
        if is_same_domain(host, pattern):
            return True
    return False


class IsAuthenticatedOrWebClient(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return True

        if settings.OAR_CLIENT_KEY == '':
            return True

        client_key = request.META.get('HTTP_X_OAR_CLIENT_KEY')
        if client_key == settings.OAR_CLIENT_KEY:
            host = referring_host(request)
            if referring_host_is_allowed(host):
                return True
            else:
                _report_warning_to_rollbar(
                    'Unallowed referring host passed with API request',
                    extra_data={'host': host})
        else:
            _report_warning_to_rollbar(
                'Incorrect client key submitted with API request',
                extra_data={'client_key': client_key})

        return False


class IsRegisteredAndConfirmed(permissions.BasePermission):
    message = 'Insufficient permissions'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        if not request.user.did_register_and_confirm_email:
            return False

        return True
