from django.core.management.base import BaseCommand
from django.core.mail import send_mail


class Command(BaseCommand):
    help = 'Send test email'

    def add_arguments(self, parser):
        parser.add_argument('subject', help='subject', type=str)
        parser.add_argument('body', help='body', type=str)
        parser.add_argument('from_email', help='from email', type=str)
        parser.add_argument('to_email', help='to email', type=str)

    def handle(self, *args, **options):
            success = send_mail(
                options['subject'],
                options['body'],
                options['from_email'],
                [options['to_email']],
                fail_silently=False,
            )

            if success:
                self.stdout.write(
                    'successfully sent test email to {}'
                    .format(options['to_email']))
            else:
                self.stderr.write(
                    'error sending test email to {}'
                    .format(options['to_email']))
