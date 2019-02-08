from rest_framework.serializers import (CharField,
                                        ModelSerializer,
                                        SerializerMethodField)
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from api.models import (FacilityList,
                        FacilityListItem,
                        Facility,
                        User,
                        Organization)


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()

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


class FacilityListItemSerializer(ModelSerializer):
    class Meta:
        model = FacilityListItem
        exclude = ('created_at', 'updated_at', 'geocoded_point',
                   'geocoded_address')
