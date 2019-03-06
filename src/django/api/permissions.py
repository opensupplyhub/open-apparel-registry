from rest_framework import permissions


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
