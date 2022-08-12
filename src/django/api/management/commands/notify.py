import logging
import requests
from django.http import QueryDict
from django.conf import settings
import sys
from django.core.management.base import BaseCommand
from api.models import ContributorWebhook, Event, Facility

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "POST notifications for an Event to configured webhook endpoints"

    def add_arguments(self, parser):
        # Create a group of arguments explicitly labeled as required,
        # because by default named arguments are considered optional.
        group = parser.add_argument_group("required arguments")
        group.add_argument(
            "-e",
            "--event-id",
            required=True,
            help="The ID of an existingEvent record."
        )

    def handle(self, *args, **options):
        notification_webhook_timeout = getattr(
            settings, "NOTIFICATION_WEBHOOK_TIMEOUT", 10
        )
        ROLLBAR = getattr(settings, "ROLLBAR", {})

        event_id = options["event_id"]
        event = Event.objects.get(pk=event_id)

        cwh = ContributorWebhook.objects.order_by("created_at")

        for contributor_webhook in cwh:
            try:
                query_params = QueryDict(
                    contributor_webhook.filter_query_string.replace("?", ""),
                    mutable=True,
                )
                query_params.update({"id": event.object_id})

                if (
                    contributor_webhook.notification_type
                    == ContributorWebhook.ASSOCIATED
                ):
                    query_params.update(
                        {"contributors": contributor_webhook.contributor_id}
                    )

                facilities_qs = Facility \
                    .objects \
                    .filter_by_query_params(query_params)

                if facilities_qs.count() > 0:
                    body = {
                        "event_type": event.event_type,
                        "event_time": event.event_time.isoformat(),
                        "event_details": event.event_details,
                    }
                    response = requests.post(
                        contributor_webhook.url,
                        json=body,
                        timeout=notification_webhook_timeout,
                    )
                    status = (
                        ContributorWebhook.DELIVERED
                        if (response.status_code >= 200
                            and response.status_code < 300)
                        else ContributorWebhook.FAILED
                    )
                else:
                    status = ContributorWebhook.SKIPPED
            except:  # noqa: E722
                status = ContributorWebhook.FAILED

                if ROLLBAR:
                    import rollbar

                    rollbar.report_exc_info(
                        sys.exc_info(),
                        extra_data={
                            "contributor_webhook_id": contributor_webhook.id,
                        },
                    )
                else:
                    logger.exception(
                        "Exception delivering event {} to webhook {}".format(
                            event_id, contributor_webhook.id))

            contributor_webhook.log_event(event, status)
