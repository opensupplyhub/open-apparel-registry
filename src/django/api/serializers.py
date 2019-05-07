from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import password_validation
from django.urls import reverse
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
                        User,
                        Contributor)
from api.countries import COUNTRY_NAMES


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()
    contributor_id = SerializerMethodField()

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
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.name
        except Contributor.DoesNotExist:
            return None

    def get_description(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.description
        except Contributor.DoesNotExist:
            return None

    def get_website(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.website
        except Contributor.DoesNotExist:
            return None

    def get_contributor_type(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_other_contributor_type(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.other_contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_contributor_id(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.id
        except Contributor.DoesNotExist:
            return None


class UserProfileSerializer(ModelSerializer):
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'description', 'website', 'contributor_type',
                  'other_contributor_type')

    def get_name(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.name
        except Contributor.DoesNotExist:
            return None

    def get_description(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.description
        except Contributor.DoesNotExist:
            return None

    def get_website(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.website
        except Contributor.DoesNotExist:
            return None

    def get_contributor_type(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_other_contributor_type(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.other_contrib_type
        except Contributor.DoesNotExist:
            return None

    def get_contributor_id(self, user):
        try:
            user_contributor = Contributor.objects.get(admin=user)
            return user_contributor.id
        except Contributor.DoesNotExist:
            return None


class FacilityListSerializer(ModelSerializer):
    item_count = SerializerMethodField()
    items_url = SerializerMethodField()
    statuses = SerializerMethodField()

    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'description', 'file_name', 'is_active',
                  'is_public', 'item_count', 'items_url', 'statuses')

    def get_item_count(self, facility_list):
        return facility_list.facilitylistitem_set.count()

    def get_items_url(self, facility_list):
        return reverse('facility-list-items',
                       kwargs={'pk': facility_list.pk})

    def get_statuses(self, facility_list):
        return (facility_list.facilitylistitem_set
                .values_list('status', flat=True)
                .distinct())


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


class FacilityListItemsQueryParamsSerializer(Serializer):
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

    class Meta:
        model = Facility
        fields = ('id', 'name', 'address', 'country_code', 'location',
                  'oar_id', 'other_names', 'other_addresses', 'contributors',
                  'country_name')
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
            (id, display_name)
            for (display_name, id)
            in facility.contributors().items()
        ]

    def get_country_name(self, facility):
        return COUNTRY_NAMES.get(facility.country_code, '')


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
