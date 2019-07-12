from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import get_template

from api.countries import COUNTRY_NAMES


def make_oar_url(request):
    if settings.ENVIRONMENT == 'Development':
        protocol = 'http'
        host = 'localhost:6543'
    else:
        protocol = 'https'
        host = request.get_host()

    return '{}://{}'.format(protocol, host)


def make_facility_url(request, facility):
    return '{}/facilities/{}'.format(
        make_oar_url(request),
        facility.id,
    )


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
        facility_list.contributor
        for facility_list in
        facility_claim.facility.contributors()
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
        facility_list.contributor
        for facility_list in
        facility_claim.facility.contributors()
    ]

    for contributor in list_contributors:
        send_claim_update_note_to_one_contributor(request,
                                                  facility_claim,
                                                  contributor)
