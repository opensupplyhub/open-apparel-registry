from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import get_template


def make_facility_url(request, facility):
    if settings.ENVIRONMENT == 'Development':
        protocol = 'http'
        host = 'localhost:6543'
    else:
        protocol = 'https'
        host = request.get_host()

    return '{}://{}/facilities/{}'.format(
        protocol,
        host,
        facility.id,
    )


def send_claim_facility_confirmation_email(request, facility_claim):
    subj_template = get_template('mail/claim_facility_submitted_subject.txt')
    text_template = get_template('mail/claim_facility_submitted_body.txt')
    html_template = get_template('mail/claim_facility_submitted_body.html')

    claim_dictionary = {
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
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

    approval_dictionary = {
        'approval_reason': facility_claim.status_change_reason,
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
        'facility_url': make_facility_url(request, facility_claim.facility),
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

    denial_dictionary = {
        'denial_reason': facility_claim.status_change_reason,
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
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

    revocation_dictionary = {
        'revocation_reason': facility_claim.status_change_reason,
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
        'facility_url': make_facility_url(request, facility_claim.facility),
    }

    send_mail(
        subj_template.render().rstrip(),
        text_template.render(revocation_dictionary),
        settings.DEFAULT_FROM_EMAIL,
        [facility_claim.email],
        html_message=html_template.render(revocation_dictionary)
    )
