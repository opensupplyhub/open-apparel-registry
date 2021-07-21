from datetime import datetime
from django.utils import timezone

from django.db import transaction

from api.models import (Facility, FacilityActivityReport, Contributor, User)


@transaction.atomic
def close_list(list_id, user_id):
    user = User.objects.get(id=user_id)
    contributor = Contributor.objects.get(admin=user)
    now = datetime.now(tz=timezone.utc)
    reason = "Closed via bulk list closure"
    facilities = Facility.objects.filter(
        facilitylistitem__source__facility_list_id=list_id)
    for facility in facilities:
        facility.is_closed = True
        facility.save()
        FacilityActivityReport.objects.create(
            facility=facility,
            reported_by_user=user,
            reported_by_contributor=contributor,
            reason_for_report=reason,
            closure_state="CLOSED",
            approved_at=now,
            status=FacilityActivityReport.CONFIRMED,
            status_change_reason=reason,
            status_change_by=user,
            status_change_date=now,
        )
