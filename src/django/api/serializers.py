from rest_framework.serializers import (CharField,
                                        ModelSerializer,
                                        SerializerMethodField)
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from api.models import FacilityList, Facility, User


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)

    class Meta:
        model = User
        exclude = ()

    def create(self, validated_data):
        user = super(UserSerializer, self).create(validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class FacilityListSerializer(ModelSerializer):
    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'description', 'file_name', 'is_active',
                  'is_public')


class FacilitySerializer(GeoFeatureModelSerializer):
    oar_id = SerializerMethodField()

    class Meta:
        model = Facility
        fields = ('id', 'name', 'address', 'country_code', 'location',
                  'created_at', 'updated_at', 'oar_id')
        geo_field = 'location'

    # Added to ensure including the OAR ID in the geojson properties map
    def get_oar_id(self, facility):
        return facility.id
