from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import get_template


def send_claim_facility_confirmation_email(request, facility_claim):
    subj_template = get_template('mail/claim_facility_submitted_subject.txt')
    text_template = get_template('mail/claim_facility_submitted_body.txt')
    html_template = get_template('mail/claim_facility_submitted_body.html')

    if settings.ENVIRONMENT == 'Development':
        protocol = 'http'
        host = 'localhost:6543'
    else:
        protocol = 'https'
        host = request.get_host()

    facility_url = '{}://{}/facilities/{}'.format(
        protocol,
        host,
        facility_claim.facility.id,
    )

    claim_dictionary = {
        'facility_name': facility_claim.facility.name,
        'facility_address': facility_claim.facility.address,
        'facility_url': facility_url,
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
