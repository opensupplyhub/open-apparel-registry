from rest_framework.serializers import (CharField,
                                        ModelSerializer,
                                        SerializerMethodField)
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from api.models import (FacilityList,
                        FacilityListItem,
                        Facility,
                        FacilityMatch,
                        User,
                        Organization)
from api.countries import COUNTRY_NAMES


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()
    organization_id = SerializerMethodField()

    class Meta:
        model = User
        exclude = ()

    def create(self, validated_data):
        user = super(UserSerializer, self).create(validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    def get_name(self, user):
        try:
            user_organization = Organization.objects.get(admin=user)
            return user_organization.name
        except Organization.DoesNotExist:
            return None

    def get_description(self, user):
        try:
            user_organization = Organization.objects.get(admin=user)
            return user_organization.description
        except Organization.DoesNotExist:
            return None

    def get_website(self, user):
        try:
            user_organization = Organization.objects.get(admin=user)
            return user_organization.website
        except Organization.DoesNotExist:
            return None

    def get_contributor_type(self, user):
        try:
            user_organization = Organization.objects.get(admin=user)
            return user_organization.org_type
        except Organization.DoesNotExist:
            return None

    def get_other_contributor_type(self, user):
        try:
            user_organization = Organization.objects.get(admin=user)
            return user_organization.other_org_type
        except Organization.DoesNotExist:
            return None

    def get_organization_id(self, user):
        try:
            user_organization = Organization.objects.get(admin=user)
            return user_organization.id
        except Organization.DoesNotExist:
            return None


class FacilityListSerializer(ModelSerializer):
    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'description', 'file_name', 'is_active',
                  'is_public')


class FacilitySerializer(GeoFeatureModelSerializer):
    oar_id = SerializerMethodField()
    other_names = SerializerMethodField()
    other_addresses = SerializerMethodField()
    contributors = SerializerMethodField()

    class Meta:
        model = Facility
        fields = ('id', 'name', 'address', 'country_code', 'location',
                  'created_at', 'updated_at', 'oar_id', 'other_names',
                  'other_addresses', 'contributors')
        geo_field = 'location'

    # Added to ensure including the OAR ID in the geojson properties map
    def get_oar_id(self, facility):
        return facility.id

    def get_other_names(self, facility):
        return facility.other_names()

    def get_other_addresses(self, facility):
        return facility.other_addresses()

    def get_contributors(self, facility):
        return facility.contributors()


class FacilityMatchSerializer(ModelSerializer):
    oar_id = SerializerMethodField()
    name = SerializerMethodField()
    address = SerializerMethodField()

    class Meta:
        model = FacilityMatch
        fields = ('id', 'status', 'confidence', 'results',
                  'oar_id', 'name', 'address')

    def get_oar_id(self, match):
        return match.facility.id

    def get_name(self, match):
        return match.facility.name

    def get_address(self, match):
        return match.facility.address


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
        if facility_list_item.status != FacilityListItem.ERROR:
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

        return {
            "oar_id": facility_list_item.facility.id,
            "address": facility_list_item.facility.address,
            "name": facility_list_item.facility.name,
        }
