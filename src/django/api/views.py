import os

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.core.exceptions import PermissionDenied
from django.contrib.auth import (authenticate, login, logout)
from django.contrib.auth.hashers import check_password
from rest_framework import viewsets, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import (ValidationError,
                                       NotFound,
                                       AuthenticationFailed)
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.decorators import (api_view,
                                       permission_classes,
                                       action)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_auth.views import LoginView, LogoutView

from oar.settings import MAX_UPLOADED_FILE_SIZE_IN_BYTES, ENVIRONMENT

from api.constants import CsvHeaderField, FacilitiesQueryParams
from api.models import (FacilityList,
                        FacilityListItem,
                        Facility,
                        FacilityMatch,
                        Contributor,
                        User)
from api.processing import parse_csv_line
from api.serializers import (FacilityListSerializer,
                             FacilityListItemSerializer,
                             FacilitySerializer,
                             UserSerializer,
                             UserProfileSerializer)
from api.countries import COUNTRY_CHOICES
from api.aws_batch import submit_jobs


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

            name = request.data.get('name')
            description = request.data.get('description')
            website = request.data.get('website')
            contrib_type = request.data.get('contributor_type')
            other_contrib_type = request.data.get('other_contributor_type')

            if name is None:
                raise ValidationError('name cannot be blank')

            if description is None:
                raise ValidationError('description cannot be blank')

            if contrib_type is None:
                raise ValidationError('contributor type cannot be blank')

            if contrib_type == Contributor.OTHER_CONTRIB_TYPE:
                if other_contrib_type is None or len(other_contrib_type) == 0:
                    raise ValidationError(
                        'contributor type description required for Contributor'
                        ' Type \'Other\''
                    )

            Contributor.objects.create(
                admin=user,
                name=name,
                description=description,
                website=website,
                contrib_type=contrib_type,
                other_contrib_type=other_contrib_type,
            )

            return Response(UserSerializer(user).data)


class LoginToOARClient(LoginView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if email is None or password is None:
            raise AuthenticationFailed('Email and password are required')

        user = authenticate(email=email, password=password)

        if user is None:
            raise AuthenticationFailed(
                'Unable to login with those credentials')

        login(request, user)

        return Response(UserSerializer(user).data)

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        return Response(UserSerializer(request.user).data)


class LogoutOfOARClient(LogoutView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        logout(request)

        return Response(status=status.HTTP_204_NO_CONTENT)


class UserProfile(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get(self, request, pk=None, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
            response_data = UserProfileSerializer(user).data
            return Response(response_data)
        except User.DoesNotExist:
            raise NotFound()

    def patch(self, request, pk, *args, **kwargs):
        pass

    @transaction.atomic
    def put(self, request, pk, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        try:
            user_for_update = User.objects.get(pk=pk)

            if request.user != user_for_update:
                raise PermissionDenied

            password = request.data.get('password')

            if not check_password(password, user_for_update.password):
                raise PermissionDenied

            name = request.data.get('name')
            description = request.data.get('description')
            website = request.data.get('website')
            contrib_type = request.data.get('contributor_type')
            other_contrib_type = request.data.get('other_contributor_type')

            if name is None:
                raise ValidationError('name cannot be blank')

            if description is None:
                raise ValidationError('description cannot be blank')

            if contrib_type is None:
                raise ValidationError('contributor type cannot be blank')

            if contrib_type == Contributor.OTHER_CONTRIB_TYPE:
                if other_contrib_type is None or len(other_contrib_type) == 0:
                    raise ValidationError(
                        'contributor type description required for Contributor'
                        ' Type \'Other\''
                    )

            user_contributor = request.user.contributor
            user_contributor.name = name
            user_contributor.description = description
            user_contributor.website = website
            user_contributor.contrib_type = contrib_type
            user_contributor.other_contrib_type = other_contrib_type
            user_contributor.save()
            user_for_update.save()

            response_data = UserProfileSerializer(user_for_update).data
            return Response(response_data)
        except User.DoesNotExist:
            raise NotFound()
        except Contributor.DoesNotExist:
            raise NotFound()


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


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
def token_auth_example(request):
    name = request.user.name
    return Response({'name': name})


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_contributors(request):
    response_data = [
        (contributor.id, contributor.name)
        for contributor
        in Contributor.objects.all().order_by('name')
    ]
    return Response(response_data)


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_contributor_types(request):
    return Response(Contributor.CONTRIB_TYPE_CHOICES)


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_countries(request):
    return Response(COUNTRY_CHOICES)


class FacilitiesViewSet(ReadOnlyModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = (AllowAny,)

    def list(self, request):
        name = request.query_params.get(FacilitiesQueryParams.NAME,
                                        None)
        contributors = request.query_params \
                              .getlist(FacilitiesQueryParams.CONTRIBUTORS)
        contributor_types = request \
            .query_params \
            .getlist(FacilitiesQueryParams.CONTRIBUTOR_TYPES)
        countries = request.query_params \
                           .getlist(FacilitiesQueryParams.COUNTRIES)

        queryset = Facility.objects.all()

        if name is not None:
            queryset = queryset.filter(name__icontains=name)

        if countries is not None and len(countries):
            queryset = queryset.filter(country_code__in=countries)

        if len(contributor_types):
            type_match_facility_ids = [
                match['facility__id']
                for match
                in FacilityMatch
                .objects
                .filter(status__in=[FacilityMatch.AUTOMATIC,
                                    FacilityMatch.CONFIRMED])
                .filter(facility_list_item__facility_list__contributor__contrib_type__in=contributor_types) # NOQA
                .values('facility__id')
            ]

            queryset = queryset.filter(id__in=type_match_facility_ids)

        if len(contributors):
            name_match_facility_ids = [
                match['facility__id']
                for match
                in FacilityMatch
                .objects
                .filter(status__in=[FacilityMatch.AUTOMATIC,
                                    FacilityMatch.CONFIRMED])
                .filter(facility_list_item__facility_list__contributor__id__in=contributors) # NOQA
                .values('facility__id')
            ]

            queryset = queryset.filter(id__in=name_match_facility_ids)

        response_data = FacilitySerializer(queryset, many=True).data

        return Response(response_data)

    def retrieve(self, request, pk=None):
        try:
            queryset = Facility.objects.get(pk=pk)
            response_data = FacilitySerializer(queryset).data
            return Response(response_data)
        except Facility.DoesNotExist:
            raise NotFound()


class FacilityListViewSet(viewsets.ModelViewSet):
    queryset = FacilityList.objects.all()
    serializer_class = FacilityListSerializer
    permission_classes = [IsAuthenticated]

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
        if 'file' not in request.data:
            raise ValidationError('No file specified.')
        csv_file = request.data['file']
        if type(csv_file) is not InMemoryUploadedFile:
            raise ValidationError('File not submitted properly.')
        if csv_file.size > MAX_UPLOADED_FILE_SIZE_IN_BYTES:
            mb = MAX_UPLOADED_FILE_SIZE_IN_BYTES / (1024*1024)
            raise ValidationError(
                'Uploaded file exceeds the maximum size of {:.1f}MB.'.format(
                    mb))
        header = csv_file.readline().decode().rstrip()
        self._validate_header(header)

        try:
            contributor = request.user.contributor
        except Contributor.DoesNotExist:
            raise ValidationError('User contributor cannot be None')

        if 'name' in request.data:
            name = request.data['name']
        else:
            name = os.path.splitext(csv_file.name)[0]

        if 'description' in request.data:
            description = request.data['description']
        else:
            description = None

        replaces = None
        if 'replaces' in request.data:
            try:
                replaces = int(request.data['replaces'])
            except ValueError:
                raise ValidationError('"replaces" must be an integer ID.')
            old_list_qs = FacilityList.objects.filter(
                contributor=contributor, pk=replaces)
            if old_list_qs.count() == 0:
                raise ValidationError(
                    '{0} is not a valid FacilityList ID.'.format(replaces))
            replaces = old_list_qs[0]
            if FacilityList.objects.filter(replaces=replaces).count() > 0:
                raise ValidationError(
                    'FacilityList {0} has already been replaced.'.format(
                        replaces.pk))

        new_list = FacilityList(
            contributor=contributor,
            name=name,
            description=description,
            file_name=csv_file.name,
            header=header,
            replaces=replaces)
        new_list.save()

        if replaces is not None:
            replaces.is_active = False
            replaces.save()

        for idx, line in enumerate(csv_file):
            if idx > 0:
                new_item = FacilityListItem(
                    row_index=(idx - 1),
                    facility_list=new_list,
                    raw_data=line.decode().rstrip()
                )
                new_item.save()

        if ENVIRONMENT in ('Staging', 'Production'):
            submit_jobs(ENVIRONMENT, new_list)

        serializer = self.get_serializer(new_list)
        return Response(serializer.data)

    def list(self, request):
        try:
            contributor = request.user.contributor
            queryset = FacilityList.objects.filter(contributor=contributor)
            response_data = self.serializer_class(queryset, many=True).data
            return Response(response_data)
        except Contributor.DoesNotExist:
            raise ValidationError('User contributor cannot be None')

    def retrieve(self, request, pk):
        try:
            user_contributor = request.user.contributor
            facility_list = FacilityList \
                .objects \
                .filter(contributor=user_contributor) \
                .get(pk=pk)
            queryset = FacilityListItem \
                .objects \
                .filter(facility_list=facility_list) \
                .order_by('row_index')

            response_data = self.serializer_class(facility_list).data

            response_data.update({
                "items": FacilityListItemSerializer(queryset, many=True).data,
            })

            return Response(response_data)
        except FacilityList.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True,
            methods=['post'],
            url_path='confirm')
    def confirm_match(self, request, pk=None):
        try:
            list_item_id = request.data.get('list_item_id')
            facility_match_id = request.data.get('facility_match_id')

            if list_item_id is None:
                raise ValidationError('missing required list_item_id')

            if facility_match_id is None:
                raise ValidationError('missing required facility_match_id')

            user_contributor = request.user.contributor
            facility_list = FacilityList \
                .objects \
                .filter(contributor=user_contributor) \
                .get(pk=pk)
            facility_list_item = FacilityListItem \
                .objects \
                .filter(facility_list=facility_list) \
                .get(pk=list_item_id)
            facility_match = FacilityMatch \
                .objects \
                .filter(facility_list_item=facility_list_item) \
                .get(pk=facility_match_id)

            if facility_list_item.status != FacilityListItem.POTENTIAL_MATCH:
                raise ValidationError(
                    'facility list item status must be POTENTIAL_MATCH')

            if facility_match.status != FacilityMatch.PENDING:
                raise ValidationError('facility match status must be PENDING')

            facility_match.status = FacilityMatch.CONFIRMED
            facility_match.save()

            FacilityMatch \
                .objects \
                .filter(facility_list_item=facility_list_item) \
                .exclude(pk=facility_match_id) \
                .update(status=FacilityMatch.REJECTED)

            facility_list_item.status = FacilityListItem.CONFIRMED_MATCH
            facility_list_item.facility = facility_match.facility
            facility_list_item.save()

            response_data = FacilityListItemSerializer(facility_list_item).data
            return Response(response_data)
        except FacilityList.DoesNotExist:
            raise NotFound()
        except FacilityListItem.DoesNotExist:
            raise NotFound()
        except FacilityMatch.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True,
            methods=['post'],
            url_path='reject')
    def reject_match(self, request, pk=None):
        try:
            list_item_id = request.data.get('list_item_id')
            facility_match_id = request.data.get('facility_match_id')

            if list_item_id is None:
                raise ValidationError('missing required list_item_id')

            if facility_match_id is None:
                raise ValidationError('missing required facility_match_id')

            user_contributor = request.user.contributor
            facility_list = FacilityList \
                .objects \
                .filter(contributor=user_contributor) \
                .get(pk=pk)
            facility_list_item = FacilityListItem \
                .objects \
                .filter(facility_list=facility_list) \
                .get(pk=list_item_id)
            facility_match = FacilityMatch \
                .objects \
                .filter(facility_list_item=facility_list_item) \
                .get(pk=facility_match_id)

            if facility_list_item.status != FacilityListItem.POTENTIAL_MATCH:
                raise ValidationError(
                    'facility list item status must be POTENTIAL_MATCH')

            if facility_match.status != FacilityMatch.PENDING:
                raise ValidationError('facility match status must be PENDING')

            facility_match.status = FacilityMatch.REJECTED
            facility_match.save()

            remaining_potential_matches = FacilityMatch \
                .objects \
                .filter(facility_list_item=facility_list_item) \
                .filter(status=FacilityMatch.PENDING)

            # Create a new facility if no potential matches remain
            if remaining_potential_matches.count() == 0:
                new_facility = Facility \
                    .objects \
                    .create(name=facility_list_item.name,
                            address=facility_list_item.address,
                            country_code=facility_list_item.country_code,
                            location=facility_list_item.geocoded_point,
                            created_from=facility_list_item)

                # also create a new facility match
                FacilityMatch \
                    .objects \
                    .create(facility_list_item=facility_list_item,
                            facility=new_facility,
                            confidence=1.0,
                            status=FacilityMatch.CONFIRMED,
                            results={
                                "match_type": "all_potential_matches_rejected",
                            })

                facility_list_item.facility = new_facility

                facility_list_item.status = FacilityListItem.CONFIRMED_MATCH
                facility_list_item.save()

            response_data = FacilityListItemSerializer(facility_list_item).data
            return Response(response_data)
        except FacilityList.DoesNotExist:
            raise NotFound()
        except FacilityListItem.DoesNotExist:
            raise NotFound()
        except FacilityMatch.DoesNotExist:
            raise NotFound()
