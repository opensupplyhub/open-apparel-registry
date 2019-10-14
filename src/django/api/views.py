import operator
import os
import sys

from datetime import datetime
from functools import reduce

from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.db.models import F, Q
from django.core import exceptions as core_exceptions
from django.core.validators import validate_email
from django.contrib.auth import (authenticate, login, logout)
from django.contrib.auth import password_validation
from django.contrib.auth.hashers import check_password
from django.contrib.gis.geos import Point
from django.utils import timezone
from django.views.decorators.cache import cache_control
from rest_framework import viewsets, status, mixins, schemas
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import (ValidationError,
                                       NotFound,
                                       AuthenticationFailed,
                                       PermissionDenied,
                                       NotAuthenticated)
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.decorators import (api_view,
                                       permission_classes,
                                       renderer_classes,
                                       action,
                                       schema)
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.filters import BaseFilterBackend
from rest_framework.schemas.coreapi import AutoSchema
from rest_framework_swagger.renderers import OpenAPIRenderer, SwaggerUIRenderer
from rest_auth.views import LoginView, LogoutView
from allauth.account.models import EmailAddress
from allauth.account.utils import complete_signup
import coreapi
from waffle import switch_is_active
from waffle.decorators import waffle_switch


from oar import urls
from oar.settings import MAX_UPLOADED_FILE_SIZE_IN_BYTES, ENVIRONMENT

from api.constants import (CsvHeaderField,
                           FacilityListQueryParams,
                           FacilityListItemsQueryParams,
                           FacilityMergeQueryParams,
                           ProcessingAction,
                           LogDownloadQueryParams,
                           UpdateLocationParams)
from api.models import (FacilityList,
                        FacilityListItem,
                        FacilityClaim,
                        FacilityClaimReviewNote,
                        Facility,
                        FacilityMatch,
                        FacilityAlias,
                        Contributor,
                        User,
                        DownloadLog,
                        Version,
                        FacilityLocation,
                        Source)
from api.processing import parse_csv_line, parse_csv, parse_excel
from api.serializers import (FacilityListSerializer,
                             FacilityListItemSerializer,
                             FacilityListItemsQueryParamsSerializer,
                             FacilityQueryParamsSerializer,
                             FacilityListQueryParamsSerializer,
                             FacilitySerializer,
                             FacilityDetailsSerializer,
                             UserSerializer,
                             UserProfileSerializer,
                             FacilityClaimSerializer,
                             FacilityClaimDetailsSerializer,
                             ApprovedFacilityClaimSerializer,
                             FacilityMergeQueryParamsSerializer,
                             LogDownloadQueryParamsSerializer,
                             FacilityUpdateLocationParamsSerializer)
from api.countries import COUNTRY_CHOICES
from api.aws_batch import submit_jobs
from api.permissions import IsRegisteredAndConfirmed, IsAllowedHost
from api.pagination import FacilitiesGeoJSONPagination
from api.mail import (send_claim_facility_confirmation_email,
                      send_claim_facility_approval_email,
                      send_claim_facility_denial_email,
                      send_claim_facility_revocation_email,
                      send_approved_claim_notice_to_list_contributors,
                      send_claim_update_notice_to_list_contributors)
from api.exceptions import BadRequestException
from api.tiler import (get_facilities_vector_tile,
                       get_facility_grid_vector_tile)
from api.renderers import MvtRenderer
from api.facility_history import (create_facility_history_list,
                                  create_associate_match_change_reason,
                                  create_dissociate_match_change_reason)


def _report_facility_claim_email_error_to_rollbar(claim):
    ROLLBAR = getattr(settings, 'ROLLBAR', {})

    if ROLLBAR:
        import rollbar
        rollbar.report_exc_info(
            sys.exc_info(),
            extra_data={
                'claim_id': claim.id,
            }
        )


@api_view()
@permission_classes([AllowAny])
@renderer_classes([SwaggerUIRenderer, OpenAPIRenderer])
def schema_view(request):
    generator = schemas.SchemaGenerator(title='Open Apparel Registry API',
                                        patterns=urls.public_apis)
    return Response(generator.get_schema())


class SubmitNewUserForm(CreateAPIView):
    serializer_class = UserSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save(request)
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

            complete_signup(self.request._request, user, 'optional', None)

            return Response(status=status.HTTP_204_NO_CONTENT)


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

        if not request.user.did_register_and_confirm_email:
            # Mimic the behavior of django-allauth and resend the confirmation
            # email if an unconfirmed user tries to log in.
            email_address = EmailAddress.objects.get(email=email)
            email_address.send_confirmation(request)

            raise AuthenticationFailed(
                'Account is not verified. '
                'Check your email for a confirmation link.'
            )

        return Response(UserSerializer(user).data)

    def get(self, request, *args, **kwargs):
        if not request.user.is_active:
            raise AuthenticationFailed('Unable to sign in')
        if not request.user.did_register_and_confirm_email:
            raise AuthenticationFailed('Unable to sign in')

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

    @permission_classes((IsRegisteredAndConfirmed,))
    def put(self, request, pk, *args, **kwargs):
        if not request.user.is_authenticated:
            raise core_exceptions.PermissionDenied

        if not request.user.did_register_and_confirm_email:
            raise core_exceptions.PermissionDenied

        try:
            user_for_update = User.objects.get(pk=pk)

            if request.user != user_for_update:
                raise core_exceptions.PermissionDenied

            current_password = request.data.get('current_password', '')
            new_password = request.data.get('new_password', '')
            confirm_new_password = request.data.get('confirm_new_password', '')

            if current_password != '' and new_password != '':
                if new_password != confirm_new_password:
                    raise ValidationError(
                        'New password and confirm new password do not match')

                if not check_password(current_password,
                                      user_for_update.password):
                    raise ValidationError('Your current password is incorrect')

                try:
                    password_validation.validate_password(
                        password=new_password, user=user_for_update)
                except core_exceptions.ValidationError as e:
                    raise ValidationError({"new_password": list(e.messages)})

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

            if new_password != '':
                user_for_update.set_password(new_password)

            user_for_update.save()

            # Changing the password causes the user to be logged out, which we
            # don't want
            if new_password != '':
                login(request, user_for_update)

            response_data = UserProfileSerializer(user_for_update).data
            return Response(response_data)
        except User.DoesNotExist:
            raise NotFound()
        except Contributor.DoesNotExist:
            raise NotFound()


class APIAuthToken(ObtainAuthToken):
    permission_classes = (IsRegisteredAndConfirmed,)

    def get(self, request, *args, **kwargs):
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
        token, _ = Token.objects.get_or_create(user=request.user)

        token_data = {
            'token': token.key,
            'created': token.created.isoformat(),
        }

        return Response(token_data)

    def delete(self, request, *args, **kwargs):
        try:
            token = Token.objects.get(user=request.user)
            token.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Token.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def all_contributors(request):
    """
    Returns list contributors as a list of tuples of contributor IDs and names.

    ## Sample Response

        [
            [1, "Contributor One"]
            [2, "Contributor Two"]
        ]
    """
    response_data = [
        (contributor.id, contributor.name)
        for contributor
        in Contributor.objects.filter(
            source__is_active=True,
            source__is_public=True).distinct().order_by('name')
    ]

    return Response(response_data)


@api_view(['GET'])
def all_contributor_types(request):
    """
    Returns a list of contributor type choices as tuples of values and display
    names.

    ## Sample Response

        [
            ["Auditor", "Auditor"],
            ["Brand/Retailer", "Brand/Retailer"],
            ["Civil Society Organization", "Civil Society Organization"],
            ["Factory / Facility", "Factory / Facility"]
        ]
    """
    return Response(Contributor.CONTRIB_TYPE_CHOICES)


@api_view(['GET'])
def all_countries(request):
    """
    Returns a list of country choices as tuples of country codes and names.

    ## Sample Response

        [
            ["AF", "Afghanistan"],
            ["AX", "Åland Islands"]
            ["AL", "Albania"]
        ]

    """
    return Response(COUNTRY_CHOICES)


@api_view(['GET'])
def current_tile_cache_key(request):
    return Response(Facility.current_tile_cache_key())


class RootAutoSchema(AutoSchema):
    def get_link(self, path, method, base_url):
        if 'log-download' in path:
            return None

        return super(RootAutoSchema, self).get_link(
            path, method, base_url)


@api_view(['POST'])
@permission_classes([IsRegisteredAndConfirmed])
@schema(RootAutoSchema())
def log_download(request):
    params = LogDownloadQueryParamsSerializer(data=request.query_params)
    if not params.is_valid():
        raise ValidationError(params.errors)

    path = request.query_params.get(LogDownloadQueryParams.PATH)
    record_count = request.query_params.get(
        LogDownloadQueryParams.RECORD_COUNT)

    DownloadLog.objects.create(
        user=request.user,
        path=path,
        record_count=record_count,
    )

    return Response(status=status.HTTP_204_NO_CONTENT)


class FacilitiesAPIFilterBackend(BaseFilterBackend):
    def get_schema_fields(self, view):
        if view.action == 'list':
            return [
                coreapi.Field(
                    name='q',
                    location='query',
                    type='string',
                    required=False,
                    description='Facility Name or OAR ID',
                ),
                coreapi.Field(
                    name='name',
                    location='query',
                    type='string',
                    required=False,
                    description='Facility Name (DEPRECATED; use `q` instead)'
                ),
                coreapi.Field(
                    name='contributors',
                    location='query',
                    type='integer',
                    required=False,
                    description='Contributor ID',
                ),
                coreapi.Field(
                    name='contributor_types',
                    location='query',
                    type='string',
                    required=False,
                    description='Contributor Type',
                ),
                coreapi.Field(
                    name='countries',
                    location='query',
                    type='string',
                    required=False,
                    description='Country Code',
                ),
            ]

        return []


class FacilitiesAutoSchema(AutoSchema):
    def get_link(self, path, method, base_url):
        if method == 'DELETE':
            return None
        if 'merge' in path:
            return None

        if 'claim' in path:
            return None

        if 'split' in path:
            return None

        if 'promote' in path:
            return None

        if 'update-location' in path:
            return None

        if 'history' in path and not switch_is_active('facility_history'):
            return None

        return super(FacilitiesAutoSchema, self).get_link(
            path, method, base_url)


@schema(FacilitiesAutoSchema())
class FacilitiesViewSet(mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    Get facilities in GeoJSON format.
    """
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    pagination_class = FacilitiesGeoJSONPagination
    filter_backends = (FacilitiesAPIFilterBackend,)

    def list(self, request):
        """
        Returns a list of facilities in GeoJSON format for a given query.
        (Maximum of 500 facilities per page.)

        ### Sample Response
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "id": "OAR_ID_1",
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [1, 1]
                        },
                        "properties": {
                            "name": "facility_name_1",
                            "address" "facility address_1",
                            "country_code": "US",
                            "country_name": "United States",
                            "oar_id": "OAR_ID_1"
                        }
                    },
                    {
                        "id": "OAR_ID_2",
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [2, 2]
                        },
                        "properties": {
                            "name": "facility_name_2",
                            "address" "facility address_2",
                            "country_code": "US",
                            "country_name": "United States",
                            "oar_id": "OAR_ID_2"
                        }
                    }
                ]
            }
        """
        params = FacilityQueryParamsSerializer(data=request.query_params)

        if not params.is_valid():
            raise ValidationError(params.errors)

        queryset = Facility \
            .objects \
            .filter_by_query_params(request.query_params) \
            .order_by('name')

        page_queryset = self.paginate_queryset(queryset)

        if page_queryset is not None:
            serializer = FacilitySerializer(page_queryset, many=True)
            return self.get_paginated_response(serializer.data)

        response_data = FacilitySerializer(queryset, many=True).data
        return Response(response_data)

    def retrieve(self, request, pk=None):
        """
        Returns the facility specified by a given OAR ID in GeoJSON format.

        ### Sample Response
            {
                "id": "OAR_ID",
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [1, 1]
                },
                "properties": {
                    "name": "facility_name",
                    "address" "facility address",
                    "country_code": "US",
                    "country_name": "United States",
                    "oar_id": "OAR_ID",
                    "other_names": [],
                    "other_addresses": [],
                    "contributors": [
                        {
                            "id": 1,
                            "name": "Brand A (2019 Q1 List)",
                            "is_verified": true
                        }
                    ]
                }
            }
        """
        try:
            queryset = Facility.objects.get(pk=pk)
            response_data = FacilityDetailsSerializer(queryset).data
            return Response(response_data)
        except Facility.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    def destroy(self, request, pk=None):
        if request.user.is_anonymous:
            raise NotAuthenticated()
        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            facility = Facility.objects.get(pk=pk)
        except Facility.DoesNotExist:
            raise NotFound()

        if facility.get_approved_claim():
            raise BadRequestException(
                'Facilities with approved claims cannot be deleted'
            )

        now = str(datetime.utcnow())
        list_item = facility.created_from
        list_item.status = FacilityListItem.DELETED
        list_item.processing_results.append({
            'action': ProcessingAction.DELETE_FACILITY,
            'started_at': now,
            'error': False,
            'finished_at': now,
            'deleted_oar_id': facility.id,
        })
        list_item.facility = None
        list_item.save()

        match = facility.get_created_from_match()
        match.changeReason = 'Deleted {}'.format(facility.id)
        match.delete()

        other_matches = facility.get_other_matches()
        if other_matches.count() > 0:
            try:
                best_match = max(
                    other_matches.filter(
                        status__in=(FacilityMatch.AUTOMATIC,
                                    FacilityMatch.CONFIRMED)),
                    key=lambda m: m.confidence)
            except ValueError:
                # Raised when there are no AUTOMATIC or CONFIRMED matches
                best_match = None
            if best_match:
                best_item = best_match.facility_list_item

                promoted_facility = Facility.objects.create(
                    name=best_item.name,
                    address=best_item.address,
                    country_code=best_item.country_code,
                    location=best_item.geocoded_point,
                    created_from=best_item)
                FacilityAlias.objects.create(
                    oar_id=facility.id,
                    facility=promoted_facility,
                    reason=FacilityAlias.DELETE
                )

                best_match.facility = promoted_facility
                best_match.changeReason = (
                    'Deleted {} and promoted {}'.format(
                        facility.id,
                        promoted_facility.id
                    )
                )
                best_match.save()

                best_item.facility = promoted_facility
                best_item.processing_results.append({
                    'action': ProcessingAction.PROMOTE_MATCH,
                    'started_at': now,
                    'error': False,
                    'finished_at': now,
                    'promoted_oar_id': promoted_facility.id,
                })
                best_item.save()

                for other_match in other_matches:
                    if other_match.id != best_match.id:
                        other_match.facility = promoted_facility
                        other_match.changeReason = (
                            'Deleted {} and promoted {}'.format(
                                facility.id,
                                promoted_facility.id
                            )
                        )
                        other_match.save()

                        other_item = other_match.facility_list_item
                        other_item.facility = promoted_facility
                        other_item.processing_results.append({
                            'action': ProcessingAction.PROMOTE_MATCH,
                            'started_at': now,
                            'error': False,
                            'finished_at': now,
                            'promoted_oar_id': promoted_facility.id,
                        })
                        other_item.save()

                for alias in FacilityAlias.objects.filter(facility=facility):
                    oar_id = alias.oar_id
                    alias.changeReason = 'Deleted {} and promoted {}'.format(
                        facility.id,
                        promoted_facility.id)
                    alias.delete()
                    FacilityAlias.objects.create(
                        facility=promoted_facility,
                        oar_id=oar_id,
                        reason=FacilityAlias.DELETE)
            else:
                for other_match in other_matches:
                    other_match.changeReason = 'Deleted {}'.format(facility.id)
                    other_match.delete()

                    other_item = other_match.facility_list_item
                    other_item.status = FacilityListItem.DELETED
                    other_item.processing_results.append({
                        'action': ProcessingAction.DELETE_FACILITY,
                        'started_at': now,
                        'error': False,
                        'finished_at': now,
                        'deleted_oar_id': facility.id,
                    })
                    other_item.facility = None
                    other_item.save()

        for claim in FacilityClaim.objects.filter(facility=facility):
            claim.changeReason = 'Deleted {}'.format(facility.id)
            claim.delete()

        for alias in FacilityAlias.objects.filter(facility=facility):
            alias.changeReason = 'Deleted {}'.format(facility.id)
            alias.delete()

        facility.delete()

        try:
            tile_version = Version.objects.get(name='tile_version')
            tile_version.version = F('version') + 1
            tile_version.save()
        except Version.DoesNotExist:
            pass

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Returns a count of total Facilities available in the Open Apparel
        Registry.

        ### Sample Response
            { "count": 100000 }
        """
        count = Facility.objects.count()
        return Response({"count": count})

    @action(detail=True, methods=['POST'],
            permission_classes=(IsRegisteredAndConfirmed,))
    @transaction.atomic
    def claim(self, request, pk=None):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        try:
            facility = Facility.objects.get(pk=pk)
            contributor = request.user.contributor

            contact_person = request.data.get('contact_person')
            job_title = request.data.get('job_title')
            email = request.data.get('email')
            phone_number = request.data.get('phone_number')
            company_name = request.data.get('company_name')
            parent_company = request.data.get('parent_company')
            website = request.data.get('website')
            facility_description = request.data.get('facility_description')
            verification_method = request.data.get('verification_method')
            preferred_contact_method = request \
                .data \
                .get('preferred_contact_method', '')
            linkedin_profile = request.data.get('linkedin_profile', '')

            try:
                validate_email(email)
            except core_exceptions.ValidationError:
                raise ValidationError('Valid email is required')

            if not company_name:
                raise ValidationError('Company name is required')

            if parent_company:
                parent_company_contributor = Contributor \
                    .objects \
                    .get(pk=parent_company)
            else:
                parent_company_contributor = None

            user_has_pending_claims = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.PENDING) \
                .filter(facility=facility) \
                .filter(contributor=contributor) \
                .count() > 0

            if user_has_pending_claims:
                raise BadRequestException(
                    'User already has a pending claim on this facility'
                )

            facility_claim = FacilityClaim.objects.create(
                facility=facility,
                contributor=contributor,
                contact_person=contact_person,
                job_title=job_title,
                email=email,
                phone_number=phone_number,
                company_name=company_name,
                parent_company=parent_company_contributor,
                website=website,
                facility_description=facility_description,
                verification_method=verification_method,
                preferred_contact_method=preferred_contact_method,
                linkedin_profile=linkedin_profile)

            send_claim_facility_confirmation_email(request, facility_claim)

            approved = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.APPROVED) \
                .filter(contributor=contributor) \
                .values_list('facility__id', flat=True)

            pending = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.PENDING) \
                .filter(contributor=contributor) \
                .values_list('facility__id', flat=True)

            return Response({
                'pending': pending,
                'approved': approved,
            })
        except Facility.DoesNotExist:
            raise NotFound()
        except Contributor.DoesNotExist:
            raise NotFound()

    @action(detail=False, methods=['GET'],
            permission_classes=(IsRegisteredAndConfirmed,))
    @transaction.atomic
    def claimed(self, request):
        """
        Returns a list of facility claims made by the authenticated user that
        have been approved.
         ### Sample Response
            [
                {
                    "id": 1,
                    "created_at": "2019-06-10T17:28:17.155025Z",
                    "updated_at": "2019-06-10T17:28:17.155042Z",
                    "contributor_id": 1,
                    "oar_id": "US2019161ABC123",
                    "contributor_name": "A Contributor",
                    "facility_name": "Clothing, Inc.",
                    "facility_address": "1234 Main St",
                    "facility_country": "United States",
                    "status": "APPROVED"
                }
            ]
        """

        if not switch_is_active('claim_a_facility'):
            raise NotFound()
        try:
            claims = FacilityClaim.objects.filter(
                contributor=request.user.contributor,
                status=FacilityClaim.APPROVED)
        except Contributor.DoesNotExist:
            raise NotFound(
                'The current User does not have an associated Contributor')
        return Response(FacilityClaimSerializer(claims, many=True).data)

    @action(detail=False, methods=['POST'],
            permission_classes=(IsRegisteredAndConfirmed,))
    @transaction.atomic
    def merge(self, request):
        if not request.user.is_superuser:
            raise PermissionDenied()

        params = FacilityMergeQueryParamsSerializer(data=request.query_params)

        if not params.is_valid():
            raise ValidationError(params.errors)
        target_id = request.query_params.get(FacilityMergeQueryParams.TARGET,
                                             None)
        merge_id = request.query_params.get(FacilityMergeQueryParams.MERGE,
                                            None)
        if target_id == merge_id:
            raise ValidationError({
                FacilityMergeQueryParams.TARGET: [
                    'Cannot be the same as {}.'.format(
                        FacilityMergeQueryParams.MERGE)],
                FacilityMergeQueryParams.MERGE: [
                    'Cannot be the same as {}.'.format(
                        FacilityMergeQueryParams.TARGET)]
            })

        target = Facility.objects.get(id=target_id)
        merge = Facility.objects.get(id=merge_id)

        now = str(datetime.utcnow())
        for merge_match in merge.facilitymatch_set.all():
            merge_match.facility = target
            merge_match.status = FacilityMatch.MERGED
            merge_match.changeReason = 'Merged {} into {}'.format(
                merge.id, target.id)
            merge_match.save()

            merge_item = merge_match.facility_list_item
            merge_item.facility = target
            merge_item.processing_results.append({
                'action': ProcessingAction.MERGE_FACILITY,
                'started_at': now,
                'error': False,
                'finished_at': now,
                'merged_oar_id': merge.id,
            })
            merge_item.save()

        for alias in FacilityAlias.objects.filter(facility=merge):
            oar_id = alias.oar_id
            alias.changeReason = 'Merging {} into {}'.format(
                merge.id,
                target.id)
            alias.delete()
            FacilityAlias.objects.create(
                facility=target,
                oar_id=oar_id,
                reason=FacilityAlias.MERGE)

        FacilityAlias.objects.create(
            oar_id=merge.id,
            facility=target,
            reason=FacilityAlias.MERGE)
        # any change to this message will also need to
        # be made in the `facility_history.py` module's
        # `create_facility_history_dictionary` function
        merge.changeReason = 'Merged with {}'.format(target.id)
        merge.delete()

        target.refresh_from_db()
        response_data = FacilityDetailsSerializer(target).data
        return Response(response_data)

    @action(detail=True, methods=['GET', 'POST'],
            permission_classes=(IsRegisteredAndConfirmed,))
    @transaction.atomic
    def split(self, request, pk=None):
        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            if request.method == 'GET':
                facility = Facility.objects.get(pk=pk)

                facility_data = FacilityDetailsSerializer(facility).data

                facility_data['properties']['matches'] = [
                    {
                        'name': m.facility_list_item.name,
                        'address': m.facility_list_item.address,
                        'country_code': m.facility_list_item.country_code,
                        'list_id':
                        m.facility_list_item.source.facility_list.id,
                        'list_name':
                        m.facility_list_item.source.facility_list.name,
                        'list_description':
                        m.facility_list_item.source.facility_list.description,
                        'list_contributor_name':
                        m.facility_list_item.source.contributor.name,
                        'list_contributor_id':
                        m.facility_list_item.source.contributor.id,
                        'match_id': m.id,
                    }
                    for m
                    in facility.get_other_matches()
                ]

                return Response(facility_data)

            match_id = request.data.get('match_id')

            if match_id is None:
                raise BadRequestException('Missing required param match_id')

            match_for_new_facility = FacilityMatch \
                .objects \
                .get(pk=match_id)

            old_facility_id = match_for_new_facility.facility.id

            list_item_for_match = match_for_new_facility.facility_list_item

            new_facility = Facility \
                .objects \
                .create(name=list_item_for_match.name,
                        address=list_item_for_match.address,
                        country_code=list_item_for_match.country_code,
                        location=list_item_for_match.geocoded_point,
                        created_from=list_item_for_match)

            match_for_new_facility.facility = new_facility
            match_for_new_facility.confidence = 1.0
            match_for_new_facility.status = FacilityMatch.CONFIRMED
            match_for_new_facility.results = {
                'match_type': 'split_by_administator',
                'split_from_oar_id': match_for_new_facility.facility.id,
            }

            match_for_new_facility.save()

            now = str(datetime.utcnow())

            list_item_for_match.facility = new_facility
            list_item_for_match.processing_results.append({
                'action': ProcessingAction.SPLIT_FACILITY,
                'started_at': now,
                'error': False,
                'finished_at': now,
                'previous_facility_oar_id': old_facility_id,
            })

            list_item_for_match.save()

            return Response({
                'match_id': match_for_new_facility.id,
                'new_oar_id': new_facility.id,
            })
        except FacilityListItem.DoesNotExist:
            raise NotFound()
        except FacilityMatch.DoesNotExist:
            raise NotFound()
        except Facility.DoesNotExist:
            raise NotFound()

    @action(detail=True, methods=['POST'],
            permission_classes=(IsRegisteredAndConfirmed,))
    @transaction.atomic
    def promote(self, request, pk=None):
        if not request.user.is_superuser:
            raise PermissionDenied()
        match_id = request.data.get('match_id')

        if match_id is None:
            raise BadRequestException('Missing required param match_id')

        try:
            facility = Facility \
                .objects \
                .get(pk=pk)

            match = FacilityMatch \
                .objects \
                .get(pk=match_id)

            matched_statuses = [
                FacilityListItem.MATCHED,
                FacilityListItem.CONFIRMED_MATCH,
            ]

            if match.facility_list_item.status not in matched_statuses:
                raise BadRequestException('Incorrect list item status')

            if match.facility.id != facility.id:
                raise BadRequestException('Match is not to facility')

            if facility.created_from.id == match.facility_list_item.id:
                raise BadRequestException('Facility is created from item.')

            previous_created_from_id = facility.created_from.id

            previous_list_id = facility.created_from.source.facility_list.id

            reason = 'Promoted item {} in list {} over item {} in list {}' \
                .format(
                    match.facility_list_item.id,
                    match.facility_list_item.source.facility_list.id,
                    previous_created_from_id,
                    previous_list_id,
                )

            facility.name = match.facility_list_item.name
            facility.address = match.facility_list_item.address
            facility.country_code = match.facility_list_item.country_code
            facility.location = match.facility_list_item.geocoded_point
            facility.created_from = match.facility_list_item
            facility.changeReason = reason
            facility.save()

            now = str(datetime.utcnow())

            match.facility_list_item.processing_results.append({
                'action': ProcessingAction.PROMOTE_MATCH,
                'started_at': now,
                'error': False,
                'finished_at': now,
                'previous_created_from_id': previous_created_from_id,
            })

            match.facility_list_item.save()

            facility.refresh_from_db()

            facility_data = FacilityDetailsSerializer(facility).data

            facility_data['properties']['matches'] = [
                {
                    'name': m.facility_list_item.name,
                    'address': m.facility_list_item.address,
                    'country_code': m.facility_list_item.country_code,
                    'list_id': m.facility_list_item.source.facility_list.id,
                    'list_name':
                    m.facility_list_item.source.facility_list.name,
                    'list_description':
                    m.facility_list_item.source.facility_list.description,
                    'list_contributor_name':
                    m.facility_list_item.source.contributor.name,
                    'list_contributor_id':
                    m.facility_list_item.source.contributor.id,
                    'match_id': m.id,
                }
                for m
                in facility.get_other_matches()
            ]

            return Response(facility_data)
        except FacilityListItem.DoesNotExist:
            raise NotFound()
        except FacilityMatch.DoesNotExist:
            raise NotFound()
        except Facility.DoesNotExist:
            raise NotFound()

    @action(detail=True, methods=['POST'],
            permission_classes=(IsRegisteredAndConfirmed,),
            url_path='update-location')
    @transaction.atomic
    def update_location(self, request, pk=None):
        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            facility = Facility.objects.get(pk=pk)
        except Facility.DoesNotExist:
            raise NotFound()

        params = FacilityUpdateLocationParamsSerializer(data=request.data)
        if not params.is_valid():
            raise ValidationError(params.errors)
        facility_location = FacilityLocation(
            facility=facility,
            location=Point(float(request.data[UpdateLocationParams.LNG]),
                           float(request.data[UpdateLocationParams.LAT])),
            notes=request.data.get('notes', ''),
            created_by=request.user,
        )
        contributor_id = request.data.get(
            UpdateLocationParams.CONTRIBUTOR_ID, None)
        if contributor_id is not None:
            facility_location.contributor = \
                Contributor.objects.get(id=contributor_id)
        facility_location.save()

        facility.location = facility_location.location
        # any change to this message will also need to
        # be made in the `facility_history.py` module's
        # `create_facility_history_dictionary` function
        facility.changeReason = \
            'Submitted a new FacilityLocation ({})'.format(
                facility_location.id)
        facility.save()

        facility_data = FacilityDetailsSerializer(facility).data
        return Response(facility_data)

    @waffle_switch('facility_history')
    @action(detail=True, methods=['GET'],
            permission_classes=(IsRegisteredAndConfirmed,),
            url_path='history')
    def get_facility_history(self, request, pk=None):
        """
        Returns the history of changes to a facility as a list of dictionaries
        describing the changes.

        ### Sample Response
            [
                {
                    "updated_at": "2019-09-12T02:43:19Z",
                    "action": "DELETE",
                    "detail": "Deleted facility"
                },
                {
                    "updated_at": "2019-09-05T13:15:30Z",
                    "action": "UPDATE",
                    "changes": {
                        "location": {
                            "old": {
                                "type": "Point",
                                "coordinates": [125.6, 10.1]
                            },
                            "new": {
                                "type": "Point",
                                "coordinates": [125.62, 10.14]
                            }
                        }
                    },
                    "detail": "FacilityLocation was changed"
                },
                {
                    "updated_at": "2019-09-02T21:04:30Z",
                    "action": "MERGE",
                    "detail": "Merged with US2019123AG4RD"
                },
                {
                    "updated_at": "2019-09-01T21:04:30Z",
                    "action": "CREATE",
                    "detail": "Facility was created"
                }
            ]
        """
        historical_facility_queryset = Facility.history.filter(id=pk)

        if historical_facility_queryset.count() == 0:
            raise NotFound()

        facility_history = create_facility_history_list(
            historical_facility_queryset,
            pk,
        )

        return Response(facility_history)


class FacilityListViewSetSchema(AutoSchema):
    def get_serializer_fields(self, path, method):
        if path[-7:] == '/items/':
            statuses = ', '.join(
                [c[0] for c in FacilityListItem.STATUS_CHOICES])
            return [
                coreapi.Field(
                    name='status',
                    location='query',
                    type='string',
                    required=False,
                    description=('Only return items matching this status.'
                                 'Must be one of {}').format(statuses),
                ),
            ]

        return []

    # This suppresses the FacilityList documentation altogether. See:
    # https://github.com/open-apparel-registry/open-apparel-registry/issues/349
    def get_link(self, path, method, base_url):
        return None


class FacilityListViewSet(viewsets.ModelViewSet):
    """
    Upload and update facility lists for an authenticated Contributor.
    """
    queryset = FacilityList.objects.all()
    serializer_class = FacilityListSerializer
    permission_classes = [IsRegisteredAndConfirmed]
    http_method_names = ['get', 'post', 'head', 'options', 'trace']

    schema = FacilityListViewSetSchema()

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

    def _extract_header_rows(self, file, request):
        ext = file.name[-4:]

        if ext in ['.xls', 'xlsx']:
            header, rows = parse_excel(file, request)
        elif ext == '.csv':
            header, rows = parse_csv(file, request)
        else:
            raise ValidationError('Unsupported file type. Please submit Excel '
                                  'or UTF-8 CSV.')

        self._validate_header(header)
        return header, rows

    @transaction.atomic
    def create(self, request):
        """
        Upload a new Facility List.

        ## Request Body

        *Required*

        `file` (`file`): CSV file to upload.

        *Optional*

        `name` (`string`): Name of the uploaded file.

        `description` (`string`): Description of the uploaded file.

        `replaces` (`number`): An optional ID for an existing list to replace
                   with the new list

        ### Sample Response

            {
                "id": 1,
                "name": "list name",
                "description": "list description",
                "file_name": "list-1.csv",
                "is_active": true,
                "is_public": true
            }
        """
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
                source__contributor=contributor, pk=replaces)
            if old_list_qs.count() == 0:
                raise ValidationError(
                    '{0} is not a valid FacilityList ID.'.format(replaces))
            replaces = old_list_qs[0]
            if FacilityList.objects.filter(replaces=replaces).count() > 0:
                raise ValidationError(
                    'FacilityList {0} has already been replaced.'.format(
                        replaces.pk))

        header, rows = self._extract_header_rows(csv_file, request)

        new_list = FacilityList(
            contributor=contributor,
            name=name,
            description=description,
            file_name=csv_file.name,
            header=header,
            replaces=replaces)
        new_list.save()

        source = Source.objects.create(
            contributor=contributor,
            source_type=Source.LIST,
            facility_list=new_list)

        if replaces is not None:
            replaces_source_qs = Source.objects.filter(facility_list=replaces)
            if replaces_source_qs.exists():
                replaces_source_qs.update(is_active=False)

        items = [FacilityListItem(row_index=idx,
                                  facility_list=new_list,
                                  raw_data=row,
                                  source=source)
                 for idx, row in enumerate(rows)]
        FacilityListItem.objects.bulk_create(items)

        if ENVIRONMENT in ('Staging', 'Production'):
            submit_jobs(ENVIRONMENT, new_list)

        serializer = self.get_serializer(new_list)
        return Response(serializer.data)

    def list(self, request):
        """
        Returns Facility Lists for an authenticated Contributor.

        ## Sample Response
            [
                {
                    "id":16,
                    "name":"11",
                    "description":"list 11",
                    "file_name":"11.csv",
                    "is_active":true,
                    "is_public":true
                },
                {
                    "id":15,
                    "name":"old list 11",
                    "description":"old list 11",
                    "file_name":"11.csv",
                    "is_active":false,
                    "is_public":true
                }
            ]
        """
        try:
            if request.user.is_superuser:
                params = FacilityListQueryParamsSerializer(
                    data=request.query_params)
                if not params.is_valid():
                    raise ValidationError(params.errors)

                contributor = params.data.get(
                    FacilityListQueryParams.CONTRIBUTOR)

                if contributor is not None:
                    facility_lists = FacilityList.objects.filter(
                        source__contributor=contributor)
                else:
                    facility_lists = FacilityList.objects.filter(
                        source__contributor=request.user.contributor)
            else:
                facility_lists = FacilityList.objects.filter(
                    source__contributor=request.user.contributor)

            facility_lists = facility_lists.order_by('-created_at')

            response_data = self.serializer_class(facility_lists,
                                                  many=True).data
            return Response(response_data)
        except Contributor.DoesNotExist:
            raise ValidationError('User contributor cannot be None')

    def retrieve(self, request, pk):
        """
        Returns data describing a single Facility List.

        ## Sample Response
            {
                "id": 16,
                "name": "list 11",
                "description": "list 11 description",
                "file_name": "11.csv",
                "is_active": true,
                "is_public": true,
                "item_count": 100,
                "item_url": "/api/facility-lists/16/items/"
            }
        """
        try:
            if request.user.is_superuser:
                facility_lists = FacilityList.objects.all()
            else:
                facility_lists = FacilityList.objects.filter(
                    source__contributor=request.user.contributor)

            facility_list = facility_lists.get(pk=pk)
            response_data = self.serializer_class(facility_list).data

            return Response(response_data)
        except FacilityList.DoesNotExist:
            raise NotFound()

    @action(detail=True, methods=['get'])
    def items(self, request, pk):
        """
        Returns data about a single page of Facility List Items.

        ## Sample Response
            {
                "count": 25,
                "next": "/api/facility-lists/16/items/?page=2&pageSize=20",
                "previous": null,
                "results": [
                    "id": 1,
                    "matches": [],
                    "country_name": "United States",
                    "processing_errors": null,
                    "matched_facility": null,
                    "row_index": 1,
                    "raw_data": "List item 1, List item address 1",
                    "status": "GEOCODED",
                    "processing_started_at": null,
                    "processing_completed_at": null,
                    "name": "List item 1",
                    "address": "List item address 1",
                    "country_code": "US",
                    "facility_list": 16
                ],
                ...
            }
        """

        special_case_q_statements = {
            FacilityListItem.NEW_FACILITY: Q(
                        Q(status__in=('MATCHED', 'CONFIRMED_MATCH')) &
                        Q(facility__created_from_id=F('id')) &
                        ~Q(facilitymatch__is_active=False)),
            FacilityListItem.MATCHED: Q(
                        Q(status='MATCHED') &
                        ~Q(facility__created_from_id=F('id')) &
                        ~Q(facilitymatch__is_active=False)),
            FacilityListItem.CONFIRMED_MATCH: Q(
                        Q(status='CONFIRMED_MATCH') &
                        ~Q(facility__created_from_id=F('id')) &
                        ~Q(facilitymatch__is_active=False)),
            FacilityListItem.REMOVED: Q(facilitymatch__is_active=False),
        }

        def make_q_from_status(status):
            if status in special_case_q_statements:
                return(special_case_q_statements[status])
            else:
                return Q(status=status)

        params = FacilityListItemsQueryParamsSerializer(
            data=request.query_params)

        if not params.is_valid():
            raise ValidationError(params.errors)

        search = request.query_params.get(
            FacilityListItemsQueryParams.SEARCH)
        status = request.query_params.getlist(
            FacilityListItemsQueryParams.STATUS)

        if search is not None:
            search = search.strip()

        try:
            if request.user.is_superuser:
                facility_lists = FacilityList.objects.all()
            else:
                facility_lists = FacilityList.objects.filter(
                    source__contributor=request.user.contributor)

            facility_list = facility_lists.get(pk=pk)
        except FacilityList.DoesNotExist:
            raise NotFound()

        queryset = FacilityListItem \
            .objects \
            .filter(source=facility_list.source)
        if search is not None and len(search) > 0:
            queryset = queryset.filter(
                Q(facility__name__icontains=search) |
                Q(facility__address__icontains=search) |
                Q(name__icontains=search) |
                Q(address__icontains=search))
        if status is not None and len(status) > 0:
            q_statements = [make_q_from_status(s) for s in status]
            queryset = queryset.filter(reduce(operator.or_, q_statements))

        queryset = queryset.order_by('row_index')

        page_queryset = self.paginate_queryset(queryset)
        if page_queryset is not None:
            serializer = FacilityListItemSerializer(page_queryset,
                                                    many=True)
            return self.get_paginated_response(serializer.data)

        serializer = FacilityListItemSerializer(queryset, many=True)
        return Response(serializer.data)

    @transaction.atomic
    @action(detail=True,
            methods=['post'],
            url_path='confirm')
    def confirm_match(self, request, pk=None):
        """
        Confirm a potential match between an existing Facility and a Facility
        List Item from an authenticated Contributor's Facility List.

        Returns an updated Facility List Item with the confirmed match's status
        changed to `CONFIRMED` and the Facility List Item's status changed to
        `CONFIRMED_MATCH`. On confirming a potential match, all other
        potential matches will have their status changed to `REJECTED`.

        ## Request Body

        **Required**

        `list_item_id` (`number`): ID for the Facility List Item rejecting a
                       match with an existing Facility.

        `facility_match_id` (`number`): ID for the potential Facility Match
                            rejected as a match for the Facility List Item.

        **Example**

            {
                "list_item_id": 1,
                "facility_match_id": 1
            }

        ## Sample Response

            {
                "id": 1,
                "matches": [
                    {
                        "id": 1,
                        "status": "CONFIRMED",
                        "confidence": 0.6,
                        "results": {
                            "match_type": "single_gazetteer_match",
                            "code_version": "12asdf",
                            "recall_weight": 1,
                            "automatic_threshold": 0.8,
                            "gazetteer_threshold": 0.5,
                            "no_gazetteer_matches": false
                        }
                        "oar_id": "oar_id_1",
                        "name": "facility match name 1",
                        "address": "facility match address 1",
                        "location": {
                            "lat": 1,
                            "lng": 1
                        },
                        "is_active": true
                    },
                    {
                        "id": 2,
                        "status": "REJECTED",
                        "confidence": 0.7,
                        "results": {
                            "match_type": "single_gazetteer_match",
                            "code_version": "34asdf",
                            "recall_weight": 1,
                            "automatic_threshold": 0.8,
                            "gazetteer_threshold": 0.5,
                            "no_gazetteer_matches": false
                        }
                        "oar_id": "oar_id_2",
                        "name": "facility match name 2",
                        "address": "facility match address 2",
                        "location": {
                            "lat": 2,
                            "lng": 2
                        },
                        "is_active": true
                    }
                ],
                "row_index": 1,
                "address": "facility list item address",
                "name": "facility list item name",
                "raw_data": "facility liste item name, facility list item address", # noqa
                "status": "CONFIRMED_MATCH",
                "processing_started_at": null,
                "processing_completed_at": null,
                "country_code": "US",
                "facility_list": 1,
                "country_name": "United States",
                "processing_errors": null,
                "list_statuses": ["CONFIRMED_MATCH"],
                "matched_facility": {
                    "oar_id": "oar_id_1",
                    "name": "facility match name 1",
                    "address": "facility match address 1",
                    "location": {
                        "lat": 1,
                        "lng": 1
                    },
                    "created_from_id": 12345
                }
            }
        """
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
                .filter(source__contributor=user_contributor) \
                .get(pk=pk)
            facility_list_item = FacilityListItem \
                .objects \
                .filter(source=facility_list.source) \
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
            facility_match.changeReason = create_associate_match_change_reason(
                facility_list_item,
                facility_match.facility,
            )

            facility_match.save()

            matches_to_reject = FacilityMatch \
                .objects \
                .filter(facility_list_item=facility_list_item) \
                .exclude(pk=facility_match_id)
            # Call `save` in a loop rather than use `update` to make sure that
            # django-simple-history can log the changes
            for match in matches_to_reject:
                match.status = FacilityMatch.REJECTED
                match.save()

            facility_list_item.status = FacilityListItem.CONFIRMED_MATCH
            facility_list_item.facility = facility_match.facility
            facility_list_item.save()

            response_data = FacilityListItemSerializer(facility_list_item).data

            response_data['list_statuses'] = (facility_list
                                              .source
                                              .facilitylistitem_set
                                              .values_list('status', flat=True)
                                              .distinct())

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
        """
        Reject a potential match between an existing Facility and a Facility
        List Item from an authenticated Contributor's Facility List.

        Returns an updated Facility List Item with the potential match's status
        changed to `REJECTED`.

        If all potential matches have been rejected and the Facility List Item
        has been successfully geocoded, creates a new Facility from the
        Facility List Item.

        ## Request Body

        **Required**

        `list_item_id` (`number`): ID for the Facility List Item rejecting a
                       match with an existing Facility.

        `facility_match_id` (`number`): ID for the potential Facility Match
                            rejected as a match for the Facility List Item.

        **Example**

            {
                "list_item_id": 1,
                "facility_match_id": 2
            }

        ## Sample Response

            {
                "id": 1,
                "matches": [
                    {
                        "id": 1,
                        "status": "PENDING",
                        "confidence": 0.6,
                        "results": {
                            "match_type": "single_gazetteer_match",
                            "code_version": "12asdf",
                            "recall_weight": 1,
                            "automatic_threshold": 0.8,
                            "gazetteer_threshold": 0.5,
                            "no_gazetteer_matches": false
                        }
                        "oar_id": "oar_id_1",
                        "name": "facility match name 1",
                        "address": "facility match address 1",
                        "location": {
                            "lat": 1,
                            "lng": 1
                        },
                        "is_active": true
                    },
                    {
                        "id": 2,
                        "status": "REJECTED",
                        "confidence": 0.7,
                        "results": {
                            "match_type": "single_gazetteer_match",
                            "code_version": "34asdf",
                            "recall_weight": 1,
                            "automatic_threshold": 0.8,
                            "gazetteer_threshold": 0.5,
                            "no_gazetteer_matches": false
                        }
                        "oar_id": "oar_id_2",
                        "name": "facility match name 2",
                        "address": "facility match address 2",
                        "location": {
                            "lat": 2,
                            "lng": 2
                        },
                        "is_active": true
                    }
                ]
                "row_index": 1,
                "address": "facility list item address",
                "name": "facility list item name",
                "raw_data": "facility liste item name, facility list item address", # noqa
                "status": "POTENTIAL_MATCH",
                "processing_started_at": null,
                "processing_completed_at": null,
                "country_code": "US",
                "country_name": "United States",
                "matched_facility": null,
                "processing_errors": null,
                "facility_list": 1,
                "list_statuses": ["POTENTIAL_MATCH"],
            }
        """
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
                .filter(source__contributor=user_contributor) \
                .get(pk=pk)
            facility_list_item = FacilityListItem \
                .objects \
                .filter(source=facility_list.source) \
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

            # If no potential matches remain:
            #
            # - create a new facility for a list item with a geocoded point
            # - set status to `ERROR_MATCHING` for list item with no point
            if remaining_potential_matches.count() == 0:
                no_location = facility_list_item.geocoded_point is None
                no_geocoding_results = facility_list_item.status == \
                    FacilityListItem.GEOCODED_NO_RESULTS

                if (no_location or no_geocoding_results):
                    facility_list_item.status = FacilityListItem.ERROR_MATCHING
                    timestamp = str(datetime.utcnow())
                    facility_list_item.processing_results.append({
                        'action': ProcessingAction.CONFIRM,
                        'started_at': timestamp,
                        'error': True,
                        'message': ('Unable to create a new facility from an '
                                    'item with no geocoded location'),
                        'finished_at': timestamp,
                    })
                else:
                    new_facility = Facility \
                        .objects \
                        .create(name=facility_list_item.name,
                                address=facility_list_item.address,
                                country_code=facility_list_item.country_code,
                                location=facility_list_item.geocoded_point,
                                created_from=facility_list_item)

                    # also create a new facility match
                    match_results = {
                        "match_type": "all_potential_matches_rejected",
                    }

                    FacilityMatch \
                        .objects \
                        .create(facility_list_item=facility_list_item,
                                facility=new_facility,
                                confidence=1.0,
                                status=FacilityMatch.CONFIRMED,
                                results=match_results)

                    facility_list_item.facility = new_facility

                    facility_list_item.status = FacilityListItem \
                        .CONFIRMED_MATCH

                facility_list_item.save()

            response_data = FacilityListItemSerializer(facility_list_item).data

            response_data['list_statuses'] = (facility_list
                                              .source
                                              .facilitylistitem_set
                                              .values_list('status', flat=True)
                                              .distinct())

            return Response(response_data)
        except FacilityList.DoesNotExist:
            raise NotFound()
        except FacilityListItem.DoesNotExist:
            raise NotFound()
        except FacilityMatch.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True, methods=['post'],
            url_path='remove')
    def remove_item(self, request, pk=None):
        try:
            facility_list = FacilityList \
                .objects \
                .filter(source__contributor=request.user.contributor) \
                .get(pk=pk)

            facility_list_item = FacilityListItem \
                .objects \
                .filter(source=facility_list.source) \
                .get(pk=request.data.get('list_item_id'))

            matches_to_deactivate = FacilityMatch \
                .objects \
                .filter(facility_list_item=facility_list_item)
            # Call `save` in a loop rather than use `update` to make sure that
            # django-simple-history can log the changes
            for item in matches_to_deactivate:
                item.is_active = False

                item.changeReason = create_dissociate_match_change_reason(
                    facility_list_item,
                    item.facility,
                )

                item.save()

            facility_list_item.refresh_from_db()

            response_data = FacilityListItemSerializer(facility_list_item).data

            response_data['list_statuses'] = (facility_list
                                              .source
                                              .facilitylistitem_set
                                              .values_list('status', flat=True)
                                              .distinct())

            return Response(response_data)
        except FacilityList.DoesNotExist:
            raise NotFound()
        except FacilityListItem.DoesNotExist:
            raise NotFound()
        except FacilityMatch.DoesNotExist:
            raise NotFound()


@api_view(['GET'])
@permission_classes((AllowAny,))
def api_feature_flags(request):
    response_data = {
        'claim_a_facility': switch_is_active('claim_a_facility'),
        'vector_tile': switch_is_active('vector_tile'),
    }

    return Response(response_data)


class FacilityClaimsAutoSchema(AutoSchema):
    def get_link(self, path, method, base_url):
        return None


@schema(FacilityClaimsAutoSchema())
class FacilityClaimViewSet(viewsets.ModelViewSet):
    """
    Viewset for admin operations on FacilityClaims.
    """
    queryset = FacilityClaim.objects.all()
    serializer_class = FacilityClaimSerializer
    permission_classes = [IsAdminUser]

    def create(self, request):
        pass

    def delete(self, request):
        pass

    def list(self, request):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        if not request.user.is_superuser:
            raise PermissionDenied()

        response_data = FacilityClaimSerializer(
            FacilityClaim.objects.all().order_by('-id'),
            many=True
        ).data

        return Response(response_data)

    def retrieve(self, request, pk=None):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            claim = FacilityClaim.objects.get(pk=pk)
            response_data = FacilityClaimDetailsSerializer(claim).data

            return Response(response_data)
        except FacilityClaim.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True,
            methods=['post'],
            url_path='approve')
    def approve_claim(self, request, pk=None):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            claim = FacilityClaim.objects.get(pk=pk)

            if claim.status != FacilityClaim.PENDING:
                raise BadRequestException(
                    'Only PENDING claims can be approved.',
                )

            approved_claims_for_facility_count = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.APPROVED) \
                .filter(facility=claim.facility) \
                .count()

            if approved_claims_for_facility_count > 0:
                raise BadRequestException(
                    'A facility may have at most one approved facility claim'
                )

            claim.status_change_reason = request.data.get('reason', '')
            claim.status_change_by = request.user
            claim.status_change_date = datetime.now(tz=timezone.utc)
            claim.status = FacilityClaim.APPROVED
            claim.save()

            note = 'Status was updated to {} for reason: {}'.format(
                FacilityClaim.APPROVED,
                claim.status_change_reason,
            )

            FacilityClaimReviewNote.objects.create(
                claim=claim,
                author=request.user,
                note=note,
            )

            send_claim_facility_approval_email(request, claim)

            try:
                send_approved_claim_notice_to_list_contributors(request,
                                                                claim)
            except Exception:
                _report_facility_claim_email_error_to_rollbar(claim)

            response_data = FacilityClaimDetailsSerializer(claim).data
            return Response(response_data)
        except FacilityClaim.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True,
            methods=['post'],
            url_path='deny')
    def deny_claim(self, request, pk=None):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            claim = FacilityClaim.objects.get(pk=pk)

            if claim.status != FacilityClaim.PENDING:
                raise BadRequestException(
                    'Only PENDING claims can be denied.',
                )

            claim.status_change_reason = request.data.get('reason', '')
            claim.status_change_by = request.user
            claim.status_change_date = datetime.now(tz=timezone.utc)
            claim.status = FacilityClaim.DENIED
            claim.save()

            note = 'Status was updated to {} for reason: {}'.format(
                FacilityClaim.DENIED,
                claim.status_change_reason,
            )

            FacilityClaimReviewNote.objects.create(
                claim=claim,
                author=request.user,
                note=note,
            )

            send_claim_facility_denial_email(request, claim)

            response_data = FacilityClaimDetailsSerializer(claim).data
            return Response(response_data)
        except FacilityClaim.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True,
            methods=['post'],
            url_path='revoke')
    def revoke_claim(self, request, pk=None):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            claim = FacilityClaim.objects.get(pk=pk)

            if claim.status != FacilityClaim.APPROVED:
                raise BadRequestException(
                    'Only APPROVED claims can be revoked.',
                )

            claim.status_change_reason = request.data.get('reason', '')
            claim.status_change_by = request.user
            claim.status_change_date = datetime.now(tz=timezone.utc)
            claim.status = FacilityClaim.REVOKED
            claim.save()

            note = 'Status was updated to {} for reason: {}'.format(
                FacilityClaim.REVOKED,
                claim.status_change_reason,
            )

            FacilityClaimReviewNote.objects.create(
                claim=claim,
                author=request.user,
                note=note,
            )

            send_claim_facility_revocation_email(request, claim)

            response_data = FacilityClaimDetailsSerializer(claim).data
            return Response(response_data)
        except FacilityClaim.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True,
            methods=['post'],
            url_path='note')
    def add_note(self, request, pk=None):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        if not request.user.is_superuser:
            raise PermissionDenied()

        try:
            claim = FacilityClaim.objects.get(pk=pk)

            FacilityClaimReviewNote.objects.create(
                claim=claim,
                author=request.user,
                note=request.data.get('note')
            )

            response_data = FacilityClaimDetailsSerializer(claim).data
            return Response(response_data)
        except FacilityClaim.DoesNotExist:
            raise NotFound()

    @transaction.atomic
    @action(detail=True,
            methods=['GET', 'PUT'],
            url_path='claimed',
            permission_classes=(IsRegisteredAndConfirmed,))
    def get_claimed_details(self, request, pk=None):
        if not switch_is_active('claim_a_facility'):
            raise NotFound()

        try:
            claim = FacilityClaim \
                .objects \
                .filter(contributor=request.user.contributor) \
                .filter(status=FacilityClaim.APPROVED) \
                .get(pk=pk)

            if request.user.contributor != claim.contributor:
                raise NotFound()

            if request.method == 'GET':
                response_data = ApprovedFacilityClaimSerializer(claim).data
                return Response(response_data)

            parent_company_data = request.data.get('facility_parent_company')

            if not parent_company_data:
                parent_company = None
            elif 'id' not in parent_company_data:
                parent_company = None
            else:
                parent_company = Contributor \
                    .objects \
                    .get(pk=parent_company_data['id'])

            claim.parent_company = parent_company

            try:
                workers_count = int(request.data.get('facility_workers_count'))
            except ValueError:
                workers_count = None
            except TypeError:
                workers_count = None

            claim.facility_workers_count = workers_count

            try:
                female_workers_percentage = int(
                    request.data.get('facility_female_workers_percentage')
                )
            except ValueError:
                female_workers_percentage = None
            except TypeError:
                female_workers_percentage = None

            claim \
                .facility_female_workers_percentage = female_workers_percentage

            facility_type = request.data.get('facility_type')

            claim.facility_type = facility_type

            if facility_type == FacilityClaim.OTHER:
                other_facility_type = request.data.get('other_facility_type')
            else:
                other_facility_type = None

            claim.other_facility_type = other_facility_type

            facility_affiliations = request.data.get('facility_affiliations')

            if facility_affiliations:
                claim.facility_affiliations = facility_affiliations
            else:
                claim.facility_affiliations = None

            facility_certifications = request.data \
                                             .get('facility_certifications')

            if facility_certifications:
                claim.facility_certifications = facility_certifications
            else:
                claim.facility_certifications = None

            facility_product_types = request.data.get('facility_product_types')

            if facility_product_types:
                claim.facility_product_types = facility_product_types
            else:
                claim.facility_product_types = None

            facility_production_types = \
                request.data.get('facility_production_types')

            if facility_production_types:
                claim.facility_production_types = facility_production_types
            else:
                claim.facility_production_types = None

            field_names = (
                'facility_description',
                'facility_name_english',
                'facility_name_native_language',
                'facility_address',
                'facility_phone_number',
                'facility_phone_number_publicly_visible',
                'facility_website',
                'facility_website_publicly_visible',
                'facility_minimum_order_quantity',
                'facility_average_lead_time',
                'point_of_contact_person_name',
                'point_of_contact_email',
                'point_of_contact_publicly_visible',
                'office_official_name',
                'office_address',
                'office_country_code',
                'office_phone_number',
                'office_info_publicly_visible',
            )

            for field_name in field_names:
                setattr(claim, field_name, request.data.get(field_name))

            claim.save()

            try:
                send_claim_update_notice_to_list_contributors(request, claim)
            except Exception:
                _report_facility_claim_email_error_to_rollbar(claim)

            response_data = ApprovedFacilityClaimSerializer(claim).data
            return Response(response_data)
        except FacilityClaim.DoesNotExist:
            raise NotFound()
        except Contributor.DoesNotExist:
            raise NotFound('No contributor found for that user')

    @action(detail=False,
            methods=['GET'],
            url_path='parent-company-options',
            permission_classes=(IsRegisteredAndConfirmed,))
    def get_parent_company_options(self, request):
        response_data = [
            (contributor.id, contributor.name)
            for contributor
            in Contributor.objects.all().order_by('name')
        ]

        return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAllowedHost])
@renderer_classes([MvtRenderer])
@cache_control(max_age=settings.TILE_CACHE_MAX_AGE_IN_SECONDS)
@waffle_switch('vector_tile')
def get_tile(request, layer, cachekey, z, x, y, ext):
    if cachekey is None:
        raise BadRequestException('missing cache key')

    if layer not in ['facilities', 'facilitygrid']:
        raise BadRequestException('invalid layer name: {}'.format(layer))

    if ext != 'pbf':
        raise BadRequestException('invalid extension: {}'.format(ext))

    params = FacilityQueryParamsSerializer(data=request.query_params)

    if not params.is_valid():
        raise ValidationError(params.errors)

    if layer == 'facilities':
        tile = get_facilities_vector_tile(request.query_params, layer, z, x, y)
    elif layer == 'facilitygrid':
        tile = get_facility_grid_vector_tile(
            request.query_params, layer, z, x, y)
    return Response(tile.tobytes())
