import os

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.core.exceptions import PermissionDenied
from rest_framework import viewsets, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.generics import CreateAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_auth.views import LoginView, LogoutView

from oar.settings import MAX_UPLOADED_FILE_SIZE_IN_BYTES

from api.constants import CsvHeaderField
from api.models import FacilityList, FacilityListItem, Organization, User
from api.processing import parse_csv_line
from api.serializers import FacilityListSerializer, UserSerializer


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


class APIAuthToken(ObtainAuthToken):
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        try:
            token = Token.objects.get(user=request.user)

            token_data = {
                'token': token.key,
                'created': token.created.isoformat(),
            }

            return Response(token_data)
        except Token.DoesNotExist:
            raise NotFound()

    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        token, _ = Token.objects.get_or_create(user=request.user)

        token_data = {
            'token': token.key,
            'created': token.created.isoformat(),
        }

        return Response(token_data)

    def delete(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        try:
            token = Token.objects.get(user=request.user)
            token.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Token.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)


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


class FacilityListViewSet(viewsets.ModelViewSet):
    # TODO: Filter based on auth.
    queryset = FacilityList.objects.all()
    serializer_class = FacilityListSerializer

    def _validate_header(self, header):
        if header is None or header == '':
            raise ValidationError('Header cannot be blank.')
        parsed_header = [i.lower() for i in parse_csv_line(header)]
        if CsvHeaderField.COUNTRY not in parsed_header \
           or CsvHeaderField.NAME not in parsed_header \
           or CsvHeaderField.ADDRESS not in parsed_header:
            raise ValidationError(
                'Header must contain {0}, {1}, and {2} fields.'.format(
                    CsvHeaderField.COUNTRY, CsvHeaderField.NAME,
                    CsvHeaderField.ADDRESS))

    @transaction.atomic
    def create(self, request):
        # TODO: Require authenticated user with related organization
        if 'file' not in request.data:
            raise ValidationError('No file specified.')
        csv_file = request.data['file']
        if type(csv_file) is not InMemoryUploadedFile:
            raise ValidationError('File not submitted propertly.')
        if csv_file.size > MAX_UPLOADED_FILE_SIZE_IN_BYTES:
            mb = MAX_UPLOADED_FILE_SIZE_IN_BYTES / (1024*1024)
            raise ValidationError(
                'Uploaded file exceeds the maximum size of {:.1f}MB.'.format(
                    mb))
        header = csv_file.readline().decode().rstrip()
        self._validate_header(header)

        # TODO: Get the organization from the authenticated user
        organization = Organization.objects.first()

        if 'name' in request.data:
            name = request.data['name']
        else:
            name = os.path.splitext(csv_file.name)[0]

        replaces = None
        if 'replaces' in request.data:
            try:
                replaces = int(request.data['replaces'])
            except ValueError:
                raise ValidationError('"replaces" must be an integer ID.')
            old_list_qs = FacilityList.objects.filter(
                organization=organization, pk=replaces)
            if old_list_qs.count() == 0:
                raise ValidationError(
                    '{0} is not a valid FacilityList ID.'.format(replaces))
            replaces = old_list_qs[0]
            if FacilityList.objects.filter(replaces=replaces).count() > 0:
                raise ValidationError(
                    'FacilityList {0} has already been replaced.'.format(
                        replaces.pk))

        new_list = FacilityList(
            organization=organization,
            name=name,
            file_name=csv_file.name,
            header=header,
            replaces=replaces)
        new_list.save()

        if replaces is not None:
            replaces.is_active = False
            replaces.save()

        for line in csv_file:
            new_item = FacilityListItem(
                facility_list=new_list,
                raw_data=line.decode().rstrip()
            )
            new_item.save()

        serializer = self.get_serializer(new_list)
        return Response(serializer.data)
