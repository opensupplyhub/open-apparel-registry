from rest_framework.serializers import (CharField, ModelSerializer)
from rest_auth.models import TokenModel
from api.models import FacilityList, User


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


class TokenSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = TokenModel
        fields = ('key', 'user')


class FacilityListSerializer(ModelSerializer):
    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'file_name', 'is_active', 'is_public')
