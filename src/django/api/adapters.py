from __future__ import unicode_literals

from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter


class OARUserAccountAdapter(DefaultAccountAdapter):
    def get_from_email(self):
        return settings.DEFAULT_FROM_EMAIL

    def get_email_confirmation_url(self, request, emailconfirmation):
        is_development = settings.ENVIRONMENT == 'Development'

        if is_development:
            protocol = 'http'
            domain = 'localhost:6543'
        else:
            protocol = 'https'
            domain = request.get_host()

        uri = '/auth/confirm/' + emailconfirmation.key

        return '{}://{}{}'.format(
            protocol,
            domain,
            uri,
        )

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        current_site = get_current_site(request)

        activate_url = self.get_email_confirmation_url(
            request,
            emailconfirmation)

        ctx = {
            "activate_url": activate_url,
            "current_site": current_site,
            "key": emailconfirmation.key,
        }

        email_template = 'mail/email_confirmation'

        self.send_mail(email_template,
                       emailconfirmation.email_address.email,
                       ctx)
