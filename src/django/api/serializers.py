from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import password_validation
from django.urls import reverse
from django.db.models import Count
from rest_framework.serializers import (CharField,
                                        EmailField,
                                        IntegerField,
                                        ListField,
                                        ModelSerializer,
                                        SerializerMethodField,
                                        ValidationError,
                                        Serializer)
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_auth.serializers import (PasswordResetSerializer,
                                   PasswordResetConfirmSerializer)
from allauth.account.utils import setup_user_email

from api.models import (FacilityList,
                        FacilityListItem,
                        Facility,
                        FacilityMatch,
                        FacilityClaim,
                        FacilityClaimReviewNote,
                        User,
                        Contributor)
from api.countries import COUNTRY_NAMES, COUNTRY_CHOICES
from waffle import switch_is_active


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()
    contributor_id = SerializerMethodField()
    claimed_facility_ids = SerializerMethodField()

    class Meta:
        model = User
        exclude = ()

    def validate(self, data):
        user = User(**data)
        password = data.get('password')

        try:
            password_validation.validate_password(password=password, user=user)
            return super(UserSerializer, self).validate(data)
        except exceptions.ValidationError as e:
            raise ValidationError({"password": list(e.messages)})

    def create(self, validated_data):
        user = super(UserSerializer, self).create(validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    def save(self, request, **kwargs):
        user = super(UserSerializer, self).save()
        setup_user_email(request, user, [])
        return user

    def get_name(self, user):
        try:
            return user.contributor.name
        except Contributor.DoesNotExist:
            return None

    def get_description(self, user):
        try:
            return user.contributor.description
        except Contributor.DoesNotExist:
            return None

    def get_website(self, user):
        try:
            return user.contributor.website
        except Contributor.DoesNotExist:
            return None

    def get_contributor_type(self, user):
        try:
            return user.contributor.contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_other_contributor_type(self, user):
        try:
            return user.contributor.other_contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_contributor_id(self, user):
        try:
            return user.contributor.id
        except Contributor.DoesNotExist:
            return None

    def get_claimed_facility_ids(self, user):
        if not switch_is_active('claim_a_facility'):
            return []

        try:
            return FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.APPROVED) \
                .filter(contributor=user.contributor) \
                .values_list('facility__id', flat=True)
        except Contributor.DoesNotExist:
            return []


class UserProfileSerializer(ModelSerializer):
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()
    facility_lists = SerializerMethodField()
    is_verified = SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'description', 'website', 'contributor_type',
                  'other_contributor_type', 'facility_lists', 'is_verified')

    def get_name(self, user):
        try:
            return user.contributor.name
        except Contributor.DoesNotExist:
            return None

    def get_description(self, user):
        try:
            return user.contributor.description
        except Contributor.DoesNotExist:
            return None

    def get_website(self, user):
        try:
            return user.contributor.website
        except Contributor.DoesNotExist:
            return None

    def get_contributor_type(self, user):
        try:
            return user.contributor.contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_other_contributor_type(self, user):
        try:
            return user.contributor.other_contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_contributor_id(self, user):
        try:
            return user.contributor.id
        except Contributor.DoesNotExist:
            return None

    def get_facility_lists(self, user):
        try:
            contributor = user.contributor
            return FacilityListSummarySerializer(
                contributor.facilitylist_set.filter(
                    is_active=True, is_public=True).order_by('-created_at'),
                many=True,
            ).data
        except Contributor.DoesNotExist:
            return []

    def get_is_verified(self, user):
        try:
            return user.contributor.is_verified
        except Contributor.DoesNotExist:
            return False


class FacilityListSummarySerializer(ModelSerializer):
    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'description')


class FacilityListSerializer(ModelSerializer):
    item_count = SerializerMethodField()
    items_url = SerializerMethodField()
    statuses = SerializerMethodField()
    status_counts = SerializerMethodField()

    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'description', 'file_name', 'is_active',
                  'is_public', 'item_count', 'items_url', 'statuses',
                  'status_counts', 'contributor_id', 'created_at')

    def get_item_count(self, facility_list):
        return facility_list.facilitylistitem_set.count()

    def get_items_url(self, facility_list):
        return reverse('facility-list-items',
                       kwargs={'pk': facility_list.pk})

    def get_statuses(self, facility_list):
        return (facility_list.facilitylistitem_set
                .values_list('status', flat=True)
                .distinct())

    def get_status_counts(self, facility_list):
        statuses = FacilityListItem \
            .objects \
            .filter(facility_list=facility_list) \
            .values('status') \
            .annotate(status_count=Count('status')) \

        status_counts_dictionary = {
            status_dict.get('status'): status_dict.get('status_count')
            for status_dict
            in statuses
        }

        uploaded = status_counts_dictionary.get(
            FacilityListItem.UPLOADED,
            0
        )

        parsed = status_counts_dictionary.get(
            FacilityListItem.PARSED,
            0
        )

        geocoded = status_counts_dictionary.get(
            FacilityListItem.GEOCODED,
            0
        )

        geocoded_no_results = status_counts_dictionary.get(
            FacilityListItem.GEOCODED_NO_RESULTS,
            0
        )

        matched = status_counts_dictionary.get(
            FacilityListItem.MATCHED,
            0
        )

        potential_match = status_counts_dictionary.get(
            FacilityListItem.POTENTIAL_MATCH,
            0
        )

        confirmed_match = status_counts_dictionary.get(
            FacilityListItem.CONFIRMED_MATCH,
            0
        )

        error = status_counts_dictionary.get(
            FacilityListItem.ERROR,
            0
        )

        error_parsing = status_counts_dictionary.get(
            FacilityListItem.ERROR_PARSING,
            0
        )

        error_geocoding = status_counts_dictionary.get(
            FacilityListItem.ERROR_GEOCODING,
            0
        )

        error_matching = status_counts_dictionary.get(
            FacilityListItem.ERROR_MATCHING,
            0
        )

        return {
            FacilityListItem.UPLOADED: uploaded,
            FacilityListItem.PARSED: parsed,
            FacilityListItem.GEOCODED: geocoded,
            FacilityListItem.GEOCODED_NO_RESULTS: geocoded_no_results,
            FacilityListItem.MATCHED: matched,
            FacilityListItem.POTENTIAL_MATCH: potential_match,
            FacilityListItem.CONFIRMED_MATCH: confirmed_match,
            FacilityListItem.ERROR: error,
            FacilityListItem.ERROR_PARSING: error_parsing,
            FacilityListItem.ERROR_GEOCODING: error_geocoding,
            FacilityListItem.ERROR_MATCHING: error_matching,
        }


class FacilityQueryParamsSerializer(Serializer):
    name = CharField(required=False)
    contributors = ListField(
        child=IntegerField(required=False),
        required=False,
    )
    contributor_types = ListField(
        child=CharField(required=False),
        required=False,
    )
    countries = ListField(
        child=CharField(required=False),
        required=False,
    )
    page = IntegerField(required=False)
    pageSize = IntegerField(required=False)


class FacilityListQueryParamsSerializer(Serializer):
    contributor = IntegerField(required=False)


class FacilityListItemsQueryParamsSerializer(Serializer):
    search = CharField(required=False)
    status = ListField(
        child=CharField(required=False),
        required=False,
    )

    def validate_status(self, value):
        valid_statuses = ([c[0] for c in FacilityListItem.STATUS_CHOICES]
                          + [FacilityListItem.NEW_FACILITY])
        for item in value:
            if item not in valid_statuses:
                raise ValidationError(
                    '{} is not a valid status. Must be one of {}'.format(
                        item, ', '.join(valid_statuses)))


class FacilitySerializer(GeoFeatureModelSerializer):
    oar_id = SerializerMethodField()
    country_name = SerializerMethodField()

    class Meta:
        model = Facility
        fields = ('id', 'name', 'address', 'country_code', 'location',
                  'oar_id', 'country_name')
        geo_field = 'location'

    # Added to ensure including the OAR ID in the geojson properties map
    def get_oar_id(self, facility):
        return facility.id

    def get_country_name(self, facility):
        return COUNTRY_NAMES.get(facility.country_code, '')


class FacilityDetailsSerializer(GeoFeatureModelSerializer):
    oar_id = SerializerMethodField()
    other_names = SerializerMethodField()
    other_addresses = SerializerMethodField()
    contributors = SerializerMethodField()
    country_name = SerializerMethodField()
    claim_info = SerializerMethodField()

    class Meta:
        model = Facility
        fields = ('id', 'name', 'address', 'country_code', 'location',
                  'oar_id', 'other_names', 'other_addresses', 'contributors',
                  'country_name', 'claim_info')
        geo_field = 'location'

    # Added to ensure including the OAR ID in the geojson properties map
    def get_oar_id(self, facility):
        return facility.id

    def get_other_names(self, facility):
        return facility.other_names()

    def get_other_addresses(self, facility):
        return facility.other_addresses()

    def get_contributors(self, facility):
        return [
            {
                'id': facility_list.contributor.admin.id,
                'name': '{} ({})'.format(
                    facility_list.contributor.name,
                    facility_list.name),
                'is_verified': facility_list.contributor.is_verified,
            }
            for facility_list
            in facility.contributors()
        ]

    def get_country_name(self, facility):
        return COUNTRY_NAMES.get(facility.country_code, '')

    def get_claim_info(self, facility):
        if not switch_is_active('claim_a_facility'):
            return None

        try:
            claim = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.APPROVED) \
                .get(facility=facility)

            return {
                'id': claim.id,
                'facility': {
                    'description': claim.facility_description,
                    'name': claim.facility_name,
                    'address': claim.facility_address,
                    'website': claim.facility_website,
                    'phone_number': claim.facility_phone_number
                    if claim.facility_phone_number_publicly_visible else None,
                    'minimum_order': claim.facility_minimum_order_quantity,
                    'average_lead_time': claim.facility_average_lead_time,
                },
                'contact': {
                    'name': claim.point_of_contact_person_name,
                    'email': claim.point_of_contact_email,
                } if claim.point_of_contact_publicly_visible else None,
                'office': {
                    'name': claim.office_official_name,
                    'address': claim.office_address,
                    'country': claim.office_country_code,
                    'phone_number': claim.office_phone_number,
                } if claim.office_info_publicly_visible else None,
            }
        except FacilityClaim.DoesNotExist:
            return None


class FacilityClaimSerializer(ModelSerializer):
    facility_name = SerializerMethodField()
    oar_id = SerializerMethodField()
    contributor_name = SerializerMethodField()
    contributor_id = SerializerMethodField()
    facility_address = SerializerMethodField()
    facility_country_name = SerializerMethodField()

    class Meta:
        model = FacilityClaim
        fields = ('id', 'created_at', 'updated_at', 'contributor_id', 'oar_id',
                  'contributor_name', 'facility_name', 'facility_address',
                  'facility_country_name', 'status')

    def get_facility_name(self, claim):
        return claim.facility.name

    def get_oar_id(self, claim):
        return claim.facility_id

    def get_contributor_name(self, claim):
        return claim.contributor.name

    def get_contributor_id(self, claim):
        return claim.contributor.admin.id

    def get_facility_address(self, claim):
        return claim.facility.address

    def get_facility_country_name(self, claim):
        return COUNTRY_NAMES.get(claim.facility.country_code, '')


class FacilityClaimDetailsSerializer(ModelSerializer):
    contributor = SerializerMethodField()
    facility = SerializerMethodField()
    status_change = SerializerMethodField()
    notes = SerializerMethodField()

    class Meta:
        model = FacilityClaim
        fields = ('id', 'created_at', 'updated_at', 'contact_person', 'email',
                  'phone_number', 'company_name', 'website',
                  'facility_description', 'preferred_contact_method', 'status',
                  'contributor', 'facility', 'verification_method',
                  'status_change', 'notes')

    def get_contributor(self, claim):
        return UserProfileSerializer(claim.contributor.admin).data

    def get_facility(self, claim):
        return FacilitySerializer(claim.facility).data

    def get_status_change(self, claim):
        if claim.status == FacilityClaim.PENDING:
            return {
                'status_change_by': None,
                'status_change_date': None,
                'status_change_reason': None,
            }

        return {
            'status_change_by': claim.status_change_by.email,
            'status_change_date': claim.status_change_date,
            'status_change_reason': claim.status_change_reason,
        }

    def get_notes(self, claim):
        notes = FacilityClaimReviewNote \
            .objects \
            .filter(claim=claim) \
            .order_by('id')
        data = FacilityClaimReviewNoteSerializer(notes, many=True).data
        return data


class FacilityClaimReviewNoteSerializer(ModelSerializer):
    author = SerializerMethodField()

    class Meta:
        model = FacilityClaimReviewNote
        fields = ('id', 'created_at', 'updated_at', 'note', 'author')

    def get_author(self, note):
        return note.author.email


class ApprovedFacilityClaimSerializer(ModelSerializer):
    facility = SerializerMethodField()
    countries = SerializerMethodField()

    class Meta:
        model = FacilityClaim
        fields = ('id', 'facility_description', 'facility_name',
                  'facility_address', 'facility_phone_number',
                  'facility_phone_number_publicly_visible',
                  'facility_website', 'facility_minimum_order_quantity',
                  'facility_average_lead_time', 'point_of_contact_person_name',
                  'point_of_contact_email',
                  'point_of_contact_publicly_visible',
                  'office_official_name', 'office_address',
                  'office_country_code', 'office_phone_number',
                  'office_info_publicly_visible',
                  'facility', 'countries')

    def get_facility(self, claim):
        return FacilityDetailsSerializer(claim.facility).data

    def get_countries(self, claimd):
        return COUNTRY_CHOICES


class FacilityMatchSerializer(ModelSerializer):
    oar_id = SerializerMethodField()
    name = SerializerMethodField()
    address = SerializerMethodField()
    location = SerializerMethodField()

    class Meta:
        model = FacilityMatch
        fields = ('id', 'status', 'confidence', 'results',
                  'oar_id', 'name', 'address', 'location')

    def get_oar_id(self, match):
        return match.facility.id

    def get_name(self, match):
        return match.facility.name

    def get_address(self, match):
        return match.facility.address

    def get_location(self, match):
        [lng, lat] = match.facility.location

        return {
            "lat": lat,
            "lng": lng,
        }


class FacilityListItemSerializer(ModelSerializer):
    matches = SerializerMethodField()
    country_name = SerializerMethodField()
    processing_errors = SerializerMethodField()
    matched_facility = SerializerMethodField()

    class Meta:
        model = FacilityListItem
        exclude = ('created_at', 'updated_at', 'geocoded_point',
                   'geocoded_address', 'processing_results', 'facility')

    def get_matches(self, facility_list_item):
        return FacilityMatchSerializer(
            facility_list_item.facilitymatch_set.order_by('id'),
            many=True,
        ).data

    def get_country_name(self, facility_list_item):
        return COUNTRY_NAMES.get(facility_list_item.country_code, '')

    def get_processing_errors(self, facility_list_item):
        if facility_list_item.status not in FacilityListItem.ERROR_STATUSES:
            return None

        return [
            processing_result['message']
            for processing_result
            in facility_list_item.processing_results
            if processing_result['error']
        ]

    def get_matched_facility(self, facility_list_item):
        # Currently this will return None for automatic matches because the
        # matching method here
        # https://github.com/open-apparel-registry/open-apparel-registry/blob/develop/src/django/api/processing.py#L104
        # doesn't set the facility for automatic matches
        if facility_list_item.facility is None:
            return None

        [lng, lat] = facility_list_item.facility.location

        return {
            "oar_id": facility_list_item.facility.id,
            "address": facility_list_item.facility.address,
            "name": facility_list_item.facility.name,
            "created_from_id": facility_list_item.facility.created_from.id,
            "location": {
                "lat": lat,
                "lng": lng,
            },
        }


class UserPasswordResetSerializer(PasswordResetSerializer):
    email = EmailField()
    password_reset_form_class = PasswordResetForm

    def validate_email(self, user_email):
        data = self.initial_data
        self.reset_form = self.password_reset_form_class(data=data)
        if not self.reset_form.is_valid():
            raise ValidationError("Error")

        if not User.objects.filter(email=user_email).exists():
            raise ValidationError("Error")

        return user_email

    def save(self):
        request = self.context.get('request')
        # Set some values to trigger the send_email method.

        if settings.ENVIRONMENT == 'Development':
            domain_override = 'localhost:6543'
        else:
            domain_override = request.get_host()

        opts = {
            'use_https': settings.ENVIRONMENT != 'Development',
            'domain_override': domain_override,
            'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL'),
            'request': request,
            'subject_template_name':
                'mail/reset_user_password_subject.txt',
            'email_template_name':
                'mail/reset_user_password_body.txt',
            'html_email_template_name':
                'mail/reset_user_password_body.html',
        }

        self.reset_form.save(**opts)


class UserPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    @transaction.atomic
    def save(self):
        self.user.save()

        return self.set_password_form.save()
