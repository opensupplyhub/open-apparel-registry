from django.db import transaction
from django.core.exceptions import PermissionDenied
from rest_framework.generics import CreateAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_auth.views import LoginView, LogoutView

from api.models import Organization, User
from api.serializers import UserSerializer


@permission_classes((AllowAny,))
class SubmitNewUserForm(CreateAPIView):
    serializer_class = UserSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            pk = serializer.data['id']
            user = User.objects.get(pk=pk)

            Organization.objects.create(
                admin=user,
                name=user.name,
                org_type=user.contributor_type,
            )

            return Response(UserSerializer(user).data)


class LoginToOARClient(LoginView):
    def post(self, request, *args, **kwargs):
        return super(LoginToOARClient, self).post(request,
                                                  *args,
                                                  **kwargs)

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        return Response(UserSerializer(request.user).data)


class LogoutOfOARClient(LogoutView):
    pass


# TODO: Remove the following URLS once Django versions have been
# implemented. These are here as imitations of the URLS available via
# the legacy Restify API.
@api_view(['GET'])
@permission_classes((AllowAny,))
def get_lists(request):
    return Response({"lists": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def get_list(request):
    return Response({"temps": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def confirm_temp(request):
    return Response({"temp": None})


@api_view(['POST'])
@permission_classes((AllowAny,))
def update_source_name(request):
    return Response({"source": None})


@api_view(['POST'])
@permission_classes((AllowAny,))
def upload_temp_factory(request):
    return Response("0 TEMP factories have been successfully uploaded")


@api_view(['GET'])
@permission_classes((AllowAny,))
def generate_key(request):
    return Response({"key": "key"})


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_source(request):
    return Response({"sources": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_country(request):
    return Response({"countries": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def total_factories(request):
    return Response({"total": 0})


@api_view(['GET'])
@permission_classes((AllowAny,))
def search_factories(request):
    return Response([])
