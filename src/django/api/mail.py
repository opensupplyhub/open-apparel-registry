from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import get_template
from api.models import FacilityList

from api.countries import COUNTRY_NAMES


def make_oar_url(request):
    if settings.ENVIRONMENT == 'Development':
        protocol = 'http'
        host = 'localhost:6543'
    else:
        protocol = 'https'
        if request:
            host = request.get_host()
        else:
            host = settings.EXTERNAL_DOMAIN

    return '{}://{}'.format(protocol, host)


def make_facility_url(request, facility):
    return '{}/facilities/{}'.format(
        make_oar_url(request),
        facility.id,
    )


def make_facility_list_url(request, list_id):
    return '{}/lists/{}'.format(make_oar_url(request), list_id)


def make_claimed_url(request):
    return '{}/claimed'.format(make_oar_url(request))


def send_claim_facility_confirmation_email(request, facility_claim):
    subj_template = get_template('mail/claim_facility_submitted_subject.txt')
    text_template = get_template('mail/claim_facility_submitted_body.txt')
    html_template = get_template('mail/claim_facility_submitted_body.html')

    facility_country = COUNTRY_NAMES[facility_claim.facility.country_code]

    claim_dictionary = {
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
        'facility_country': facility_country,
        'facility_url': make_facility_url(request, facility_claim.facility),
        'contact_person': facility_claim.contact_person,
        'email': facility_claim.email,
        'phone_number': facility_claim.phone_number,
        'company_name': facility_claim.company_name,
        'website': facility_claim.website,
        'facility_description': facility_claim.facility_description,
        'verification_method': facility_claim.verification_method,
        'preferred_contact_method': facility_claim.preferred_contact_method,
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(claim_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [facility_claim.email],
        html_message=html_template.render(claim_dictionary)
    )


def send_claim_facility_approval_email(request, facility_claim):
    subj_template = get_template('mail/claim_facility_approval_subject.txt')
    text_template = get_template('mail/claim_facility_approval_body.txt')
    html_template = get_template('mail/claim_facility_approval_body.html')

    facility_country = COUNTRY_NAMES[facility_claim.facility.country_code]

    approval_dictionary = {
        'approval_reason': facility_claim.status_change_reason,
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
        'facility_country': facility_country,
        'facility_url': make_facility_url(request, facility_claim.facility),
        'claimed_url': make_claimed_url(request),
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(approval_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [facility_claim.email],
        html_message=html_template.render(approval_dictionary)
    )


def send_claim_facility_denial_email(request, facility_claim):
    subj_template = get_template('mail/claim_facility_denial_subject.txt')
    text_template = get_template('mail/claim_facility_denial_body.txt')
    html_template = get_template('mail/claim_facility_denial_body.html')

    facility_country = COUNTRY_NAMES[facility_claim.facility.country_code]

    denial_dictionary = {
        'denial_reason': facility_claim.status_change_reason,
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
        'facility_country': facility_country,
        'facility_url': make_facility_url(request, facility_claim.facility),
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(denial_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [facility_claim.email],
        html_message=html_template.render(denial_dictionary)
    )


def send_claim_facility_revocation_email(request, facility_claim):
    subj_template = get_template('mail/claim_facility_revocation_subject.txt')
    text_template = get_template('mail/claim_facility_revocation_body.txt')
    html_template = get_template('mail/claim_facility_revocation_body.html')

    facility_country = COUNTRY_NAMES[facility_claim.facility.country_code]

    revocation_dictionary = {
        'revocation_reason': facility_claim.status_change_reason,
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
        'facility_country': facility_country,
        'facility_url': make_facility_url(request, facility_claim.facility),
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(revocation_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [facility_claim.email],
        html_message=html_template.render(revocation_dictionary)
    )


def send_approved_claim_notice_to_one_contributor(request, claim, contributor):
    subj_template = get_template(
        'mail/approved_facility_claim_contributor_notice_subject.txt')
    text_template = get_template(
        'mail/approved_facility_claim_contributor_notice_body.txt')
    html_template = get_template(
        'mail/approved_facility_claim_contributor_notice_body.html')

    facility_country = COUNTRY_NAMES[claim.facility.country_code]

    notice_dictionary = {
        'facility_name': claim.facility.name,
        'facility_address': claim.facility.address,
        'facility_country': facility_country,
        'facility_url': make_facility_url(request, claim.facility),
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(notice_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [contributor.admin.email],
        html_message=html_template.render(notice_dictionary)
    )


def send_approved_claim_notice_to_list_contributors(request, facility_claim):
    list_contributors = [
        source.contributor
        for source in
        facility_claim.facility.sources()
        if source.contributor is not None
    ]

    for contributor in list_contributors:
        send_approved_claim_notice_to_one_contributor(request,
                                                      facility_claim,
                                                      contributor)


def send_claim_update_note_to_one_contributor(request, claim, contributor):
    subj_template = get_template(
        'mail/facility_claim_profile_update_contributor_notice_subject.txt')
    text_template = get_template(
        'mail/facility_claim_profile_update_contributor_notice_body.txt')
    html_template = get_template(
        'mail/facility_claim_profile_update_contributor_notice_body.html')

    facility_country = COUNTRY_NAMES[claim.facility.country_code]

    changes = claim.get_changes()
    if changes:
        changes = [
            '{}: {}'.format(
                c['verbose_name'][:1].upper() + c['verbose_name'][1:],
                c['current'])
            for c in changes
        ]

    notice_dictionary = {
        'facility_name': claim.facility.name,
        'facility_address': claim.facility.address,
        'facility_country': facility_country,
        'facility_url': make_facility_url(request, claim.facility),
        'changes': changes,
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(notice_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [contributor.admin.email],
        html_message=html_template.render(notice_dictionary)
    )


def send_claim_update_notice_to_list_contributors(request, facility_claim):
    list_contributors = [
        source.contributor
        for source in
        facility_claim.facility.sources()
        if source.contributor is not None
    ]

    for contributor in list_contributors:
        send_claim_update_note_to_one_contributor(request,
                                                  facility_claim,
                                                  contributor)


def send_api_notice(contributor, limit, grace_limit=None):
    subj_template = get_template(
        'mail/api_limit_subject.txt')
    text_template = get_template(
        'mail/api_limit_body.txt')
    html_template = get_template(
        'mail/api_limit_body.html')

    notice_dictionary = {
        'limit': limit,
        'grace_limit': grace_limit
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(notice_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [contributor.admin.email],
        html_message=html_template.render(notice_dictionary)
    )


def send_admin_api_notice(contributor_name, limit, grace_limit=None):
    subj_template = get_template(
        'mail/api_limit_admin_subject.txt')
    text_template = get_template(
        'mail/api_limit_admin_body.txt')
    html_template = get_template(
        'mail/api_limit_admin_body.html')

    notice_dictionary = {
        'contributor_name': contributor_name,
        'limit': limit,
        'grace_limit': grace_limit
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(notice_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [settings.NOTIFICATION_EMAIL_TO],
        html_message=html_template.render(notice_dictionary)
    )


def send_api_warning(contributor, limit):
    subj_template = get_template(
        'mail/api_limit_warning_subject.txt')
    text_template = get_template(
        'mail/api_limit_warning_body.txt')
    html_template = get_template(
        'mail/api_limit_warning_body.html')

    notice_dictionary = {
        'limit': limit
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(notice_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [contributor.admin.email],
        html_message=html_template.render(notice_dictionary)
    )


def send_admin_api_warning(contributor_name, limit):
    subj_template = get_template(
        'mail/api_limit_warning_admin_subject.txt')
    text_template = get_template(
        'mail/api_limit_warning_admin_body.txt')
    html_template = get_template(
        'mail/api_limit_warning_admin_body.html')

    notice_dictionary = {
        'contributor_name': contributor_name,
        'limit': limit
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(notice_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [settings.NOTIFICATION_EMAIL_TO],
        html_message=html_template.render(notice_dictionary)
    )


def send_report_result(report):
    subj_template = get_template(
        'mail/report_result_subject.txt')
    text_template = get_template(
        'mail/report_result_body.txt')
    html_template = get_template(
        'mail/report_result_body.html')

    if report.closure_state == 'OPEN':
        closure_state = 're-opened'
    else:
        closure_state = 'closed'

    report_dictionary = {
        'facility_name': report.facility.name,
        'is_closure': closure_state == 'closed',
        'is_reopening': closure_state == 're-opened',
        'is_confirmed': report.status == 'CONFIRMED',
        'is_rejected': report.status == 'REJECTED',
        'closure_state': closure_state,
        'status_change_reason': report.status_change_reason,
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(report_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [report.reported_by_contributor.admin.email],
        html_message=html_template.render(report_dictionary)
    )


def notify_facility_list_complete(list_id):
    subj_template = get_template(
        'mail/facility_list_complete_subject.txt')
    text_template = get_template(
        'mail/facility_list_complete_body.txt')
    html_template = get_template(
        'mail/facility_list_complete_body.html')

    facility_list = FacilityList.objects.get(id=list_id)
    notification_to = facility_list.source.contributor.admin.email

    notification_dictionary = {
        'list_url': make_facility_list_url(None, list_id),
        'list_name': facility_list.name
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(notification_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [notification_to],
        html_message=html_template.render(notification_dictionary)
    )


def send_facility_list_rejection_email(request, facility_list):
    subj_template = get_template('mail/facility_list_rejection_subject.txt')
    text_template = get_template('mail/facility_list_rejection_body.txt')
    html_template = get_template('mail/facility_list_rejection_body.html')

    denial_dictionary = {
        'rejection_reason': facility_list.status_change_reason,
        'facility_list_name': facility_list.name,
        'facility_list_description': facility_list.description,
        'facility_list_created_at': facility_list.created_at,
        'facility_list_url': make_facility_list_url(request, facility_list.id),
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(denial_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [facility_list.source.contributor.admin.email],
        html_message=html_template.render(denial_dictionary)
    )
