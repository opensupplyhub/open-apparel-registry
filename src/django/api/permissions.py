from urllib.parse import urlparse

from django.conf import settings
from django.utils.http import is_same_domain
from rest_framework import permissions


def is_referer_allowed(request):
    referer = urlparse(request.META.get('HTTP_REFERER', ''))
    host = referer.netloc.split(':')[0]
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
            return is_referer_allowed(request)

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
