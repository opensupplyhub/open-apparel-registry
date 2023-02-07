import json

from collections import defaultdict

from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import password_validation
from django.urls import reverse
from django.db.models import Count, Q
from rest_framework.serializers import (BooleanField,
                                        CharField,
                                        ChoiceField,
                                        CurrentUserDefault,
                                        DecimalField,
                                        EmailField,
                                        HiddenField,
                                        IntegerField,
                                        ListField,
                                        ModelSerializer,
                                        Serializer,
                                        SerializerMethodField,
                                        URLField,
                                        ValidationError)
from rest_framework_gis.serializers import (GeoFeatureModelSerializer,
                                            GeometrySerializerMethodField)
from rest_auth.serializers import (PasswordResetSerializer,
                                   PasswordResetConfirmSerializer)
from allauth.account.utils import setup_user_email

from api.models import (FacilityList,
                        FacilityListItem,
                        Facility,
                        FacilityLocation,
                        FacilityMatch,
                        FacilityClaim,
                        FacilityClaimReviewNote,
                        User,
                        Contributor,
                        ContributorWebhook,
                        Source,
                        ApiBlock,
                        FacilityActivityReport,
                        EmbedConfig,
                        EmbedField,
                        NonstandardField,
                        ExtendedField)
from api.constants import MatchResponsibility
from api.countries import COUNTRY_NAMES, COUNTRY_CHOICES
from api.processing import (
    get_country_code,
    remove_empty_array_values,
    strip_array_values
)
from api.helpers import (prefix_a_an,
                         get_single_contributor_field_values,
                         get_list_contributor_field_values)
from api.facility_type_processing_type import (
    ALL_FACILITY_TYPE_CHOICES,
    ALL_PROCESSING_TYPE_CHOICES
)
from api.csv_download import (format_download_date,
                              get_download_contribution,
                              get_download_claim_contribution,
                              format_download_extended_fields)
from waffle import switch_is_active


def _get_parent_company(claim):
    if not claim:
        return None
    if claim.parent_company:
        return {
            'id': claim.parent_company.id,
            'name': claim.parent_company.name,
        }
    if claim.parent_company_name:
        return {
            'id': claim.parent_company_name,
            'name': claim.parent_company_name,
        }
    return None


def is_embed_mode_active(serializer):
    request = serializer.context.get('request') \
        if serializer.context is not None else None

    if request is not None and request.query_params is not None:
        if request.query_params.get('embed') == '1':
            return True

    return False


def get_embed_contributor_id(serializer):
    request = serializer.context.get('request') \
        if serializer.context is not None else None

    if request is None or request.query_params is None:
        return None

    contributor = request.query_params.get('contributor', None)
    if contributor is None:
        contributors = request.query_params.getlist('contributors', [])
        if contributors is not None and len(contributors) > 0:
            contributor = contributors[0]

    return contributor


def prefer_contributor_name(serializer):
    try:
        contributor_id = get_embed_contributor_id(serializer)
        if is_embed_mode_active(serializer) and contributor_id is not None:
            contributor = Contributor.objects.get(id=contributor_id)
            if contributor.embed_level is not None:
                config = EmbedConfig.objects.get(contributor=contributor)
                return config.prefer_contributor_name
        return False
    except EmbedConfig.DoesNotExist or Contributor.DoesNotExist:
        return False


class PipeSeparatedField(ListField):
    """Accepts either a list or a pipe-delimited string as input"""
    def to_internal_value(self, data):
        if isinstance(data, str):
            data = data.split('|')
        if ((not isinstance(data, list) or
             any(not isinstance(item, str) for item in data))):
            raise ValidationError(
                'Expected value to be a string or a list of strings '
                f'but got {data}')
        data = remove_empty_array_values(strip_array_values(data))
        return super().to_internal_value(data)


class CurrentUserContributor(CurrentUserDefault):
    def __call__(self, serializer_field):
        return super().__call__(serializer_field).contributor


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()
    contributor_id = SerializerMethodField()
    embed_config = SerializerMethodField()
    claimed_facility_ids = SerializerMethodField()
    embed_level = SerializerMethodField()

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

    def get_embed_config(self, user):
        try:
            return EmbedConfigSerializer(user.contributor.embed_config).data
        except Contributor.DoesNotExist:
            return None

    def get_embed_level(self, user):
        try:
            return user.contributor.embed_level
        except Contributor.DoesNotExist:
            return None

    def get_claimed_facility_ids(self, user):
        if not switch_is_active('claim_a_facility'):
            return {
                'approved': None,
                'pending': None,
            }

        try:
            approved = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.APPROVED) \
                .filter(contributor=user.contributor) \
                .values_list('facility__id', flat=True)

            pending = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.PENDING) \
                .filter(contributor=user.contributor) \
                .values_list('facility__id', flat=True)

            return {
                'pending': pending,
                'approved': approved,
            }
        except Contributor.DoesNotExist:
            return {
                'approved': None,
                'pending': None,
            }


class UserProfileSerializer(ModelSerializer):
    name = SerializerMethodField()
    description = SerializerMethodField()
    website = SerializerMethodField()
    contributor_type = SerializerMethodField()
    other_contributor_type = SerializerMethodField()
    facility_lists = SerializerMethodField()
    is_verified = SerializerMethodField()
    embed_config = SerializerMethodField()
    contributor_id = SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'description', 'website', 'contributor_type',
                  'other_contributor_type', 'facility_lists', 'is_verified',
                  'embed_config', 'contributor_id')
        read_only_fields = ('contributor_id',)

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
                FacilityList.objects.filter(
                    source__contributor=contributor,
                    source__is_active=True,
                    source__is_public=True,
                ).order_by('-created_at'),
                many=True,
            ).data
        except Contributor.DoesNotExist:
            return []

    def get_is_verified(self, user):
        try:
            return user.contributor.is_verified
        except Contributor.DoesNotExist:
            return False

    def get_embed_config(self, user):
        try:
            return EmbedConfigSerializer(user.contributor.embed_config).data
        except Contributor.DoesNotExist:
            return None


class FacilityListSummarySerializer(ModelSerializer):
    contributor_id = SerializerMethodField()

    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'description', 'contributor_id')

    def get_contributor_id(self, facility_list):
        try:
            return facility_list.source.contributor.id
        except Contributor.DoesNotExist:
            return None


class FacilityListSerializer(ModelSerializer):
    is_active = SerializerMethodField()
    is_public = SerializerMethodField()
    item_count = SerializerMethodField()
    items_url = SerializerMethodField()
    status = SerializerMethodField()
    statuses = SerializerMethodField()
    status_counts = SerializerMethodField()
    contributor_id = SerializerMethodField()

    class Meta:
        model = FacilityList
        fields = ('id', 'name', 'description', 'file_name', 'is_active',
                  'is_public', 'item_count', 'items_url', 'statuses',
                  'status_counts', 'contributor_id', 'created_at',
                  'match_responsibility', 'status', 'status_change_reason',
                  'file')
        read_only_fields = ('created_at', 'match_responsibility')

    def get_is_active(self, facility_list):
        try:
            return facility_list.source.is_active
        except Source.DoesNotExist:
            return False

    def get_is_public(self, facility_list):
        try:
            return facility_list.source.is_public
        except Source.DoesNotExist:
            return False

    def get_item_count(self, facility_list):
        try:
            return facility_list.source.facilitylistitem_set.count()
        except Source.DoesNotExist:
            return 0

    def get_items_url(self, facility_list):
        return reverse('facility-list-items',
                       kwargs={'pk': facility_list.pk})

    def get_status(self, facility_list):
        if hasattr(facility_list, 'replaced_by'):
            return FacilityList.REPLACED

        return facility_list.status

    def get_statuses(self, facility_list):
        try:
            return (facility_list.source.facilitylistitem_set
                    .values_list('status', flat=True)
                    .distinct())
        except Source.DoesNotExist:
            return []

    def get_status_counts(self, facility_list):
        try:
            statuses = FacilityListItem \
                .objects \
                .filter(source=facility_list.source) \
                .values('status') \
                .annotate(status_count=Count('status'))
        except Source.DoesNotExist:
            statuses = []

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

        duplicate = status_counts_dictionary.get(
            FacilityListItem.DUPLICATE,
            0
        )

        deleted = status_counts_dictionary.get(
            FacilityListItem.DELETED,
            0
        )

        item_removed = status_counts_dictionary.get(
            FacilityListItem.ITEM_REMOVED,
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
            FacilityListItem.DUPLICATE: duplicate,
            FacilityListItem.DELETED: deleted,
            FacilityListItem.ITEM_REMOVED: item_removed,
        }

    def get_contributor_id(self, facility_list):
        try:
            return facility_list.source.contributor.id \
                if facility_list.source.contributor else None
        except Source.DoesNotExist:
            return None


class FacilityQueryParamsSerializer(Serializer):
    name = CharField(required=False)
    contributors = ListField(
        child=IntegerField(required=False),
        required=False,
    )
    lists = ListField(
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
    boundary = CharField(required=False)
    ppe = BooleanField(default=False, required=False)
    detail = BooleanField(default=False, required=False)


class FacilityListQueryParamsSerializer(Serializer):
    contributor = IntegerField(required=False)
    match_responsibility = ChoiceField(choices=MatchResponsibility.CHOICES,
                                       required=False)
    status = ChoiceField(choices=[FacilityList.MATCHED, FacilityList.APPROVED,
                                  FacilityList.REJECTED, FacilityList.PENDING,
                                  FacilityList.REPLACED],
                         required=False)


class FacilityListItemsQueryParamsSerializer(Serializer):
    search = CharField(required=False)
    status = ListField(
        child=CharField(required=False),
        required=False,
    )

    def validate_status(self, value):
        valid_statuses = ([c[0] for c in FacilityListItem.STATUS_CHOICES]
                          + [FacilityListItem.NEW_FACILITY,
                             FacilityListItem.REMOVED])
        for item in value:
            if item not in valid_statuses:
                raise ValidationError(
                    '{} is not a valid status. Must be one of {}'.format(
                        item, ', '.join(valid_statuses)))


def get_facility_name(serializer, facility):
    if prefer_contributor_name(serializer):
        contributor = get_embed_contributor_id(serializer)
        facility_list_item_matches = [
            FacilityListItem.objects.get(pk=pk)
            for (pk,)
            in facility
            .facilitymatch_set
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED,
                                FacilityMatch.MERGED],
                    is_active=True,
                    facility_list_item__source__is_active=True,
                    facility_list_item__source__is_public=True,
                    facility_list_item__source__contributor_id=contributor)
            .order_by('-created_at')
            .values_list('facility_list_item')
        ]

        valid_names = []
        for item in facility_list_item_matches:
            if len(item.name) != 0 and item.name is not None:
                # If the contributor has submitted a name matching the
                # assigned facility name, use the assigned facility name
                if item.name == facility.name:
                    return facility.name
                valid_names.append(item.name)

        # Return the first item with a valid name if it exists
        if len(valid_names) > 0:
            return valid_names[0]

    names = ExtendedField.objects \
        .filter(facility=facility,
                field_name=ExtendedField.NAME,
                facility_claim__status=FacilityClaim.APPROVED) \
        .order_by('-updated_at') \
        .values_list('value', flat=True)

    if len(names) > 0:
        return names[0]

    # Return the assigned facility name
    return facility.name


class FacilitySerializer(GeoFeatureModelSerializer):
    os_id = SerializerMethodField()
    country_name = SerializerMethodField()
    contributors = SerializerMethodField()
    name = SerializerMethodField()
    contributor_fields = SerializerMethodField()
    extended_fields = SerializerMethodField()
    location = GeometrySerializerMethodField()
    address = SerializerMethodField()
    has_approved_claim = SerializerMethodField()

    class Meta:
        model = Facility
        fields = ('id', 'name', 'address', 'country_code', 'location',
                  'os_id', 'country_name', 'contributors',
                  'has_approved_claim', 'ppe_product_types',
                  'ppe_contact_phone', 'ppe_contact_email',
                  'ppe_website', 'is_closed', 'contributor_fields',
                  'extended_fields')
        geo_field = 'location'

    def __init__(self, *args, **kwargs):
        exclude_fields = kwargs.pop('exclude_fields', None)
        super(FacilitySerializer, self).__init__(*args, **kwargs)

        if exclude_fields:
            for field_name in exclude_fields:
                self.fields.pop(field_name, None)

    def get_location(self, facility):
        claim = facility.get_approved_claim()
        if claim is not None:
            if claim.facility_location is not None:
                return claim.facility_location
        return facility.location

    def get_address(self, facility):
        claim = facility.get_approved_claim()
        if claim is not None:
            if claim.facility_address and claim.facility_address is not None:
                return claim.facility_address
        return facility.address

    # Added to ensure including the OS ID in the geojson properties map
    def get_os_id(self, facility):
        return facility.id

    def get_country_name(self, facility):
        return COUNTRY_NAMES.get(facility.country_code, '')

    def get_name(self, facility):
        return get_facility_name(self, facility)

    def get_has_approved_claim(self, facility):
        return facility.get_approved_claim() is not None

    def get_contributors(self, facility):
        if is_embed_mode_active(self):
            return []

        def format_source(source):
            if type(source) is Source:
                return {
                    'id': source.contributor.admin.id
                    if source.contributor else None,
                    'name': source.display_name,
                    'is_verified': source.contributor.is_verified
                    if source.contributor else False,
                    'contributor_name': source.contributor.name
                    if source.contributor else '[Unknown Contributor]',
                    'list_name': source.facility_list.name
                    if source.facility_list else None,
                }
            return {
                'name': source,
            }
        request = self.context.get('request') \
            if self.context is not None else None
        user = request.user if request is not None else None
        distinct_names = []
        distinct_sources = []
        formatted_sources = [
            format_source(source) for source in facility.sources(user=user)]
        for formatted_source in formatted_sources:
            if formatted_source['name'] not in distinct_names:
                distinct_names.append(formatted_source['name'])
                distinct_sources.append(formatted_source)
        return distinct_sources

    def get_contributor_fields(self, facility):
        try:
            contributor_id = get_embed_contributor_id(self)
            if contributor_id is None or not is_embed_mode_active(self):
                return []
            contributor = Contributor.objects.get(id=contributor_id)
            if contributor.embed_level is None:
                return []
        except Contributor.DoesNotExist:
            return []

        # If the contributor has not created any overriding embed config
        # these transparency pledge fields will always be visible.
        fields = [
            EmbedField(column_name=column_name, display_name=display_name)
            for (column_name, display_name)
            in NonstandardField.EXTENDED_FIELDS.items()]

        try:
            config = EmbedConfig.objects.get(contributor=contributor)
            # If there are any configured fields, they override the defaults
            # set above
            if EmbedField.objects.filter(embed_config=config).count() > 0:
                fields = EmbedField.objects.filter(
                    embed_config=config, visible=True).order_by('order')
        except EmbedConfig.DoesNotExist:
            return fields

        list_item = FacilityListItem.objects.filter(
                facility=facility,
                source__contributor=contributor,
                source__is_active=True,
                facilitymatch__is_active=True).order_by('-created_at').first()

        return assign_contributor_field_values(list_item, fields)

    def get_extended_fields(self, facility):
        request = self.context.get('request') \
            if self.context is not None else None
        embed = request.query_params.get('embed') \
            if request is not None else None
        contributor_id = request.query_params.get('contributor', None) \
            if request is not None and embed == '1' else None
        if contributor_id is None and request is not None and embed == '1':
            contributor_ids = request.query_params.getlist('contributors', [])
            if len(contributor_ids):
                contributor_id = contributor_ids[0]

        fields = facility.extended_fields(contributor_id=contributor_id)
        user_can_see_detail = can_user_see_detail(self)
        embed_mode_active = is_embed_mode_active(self)

        grouped_data = defaultdict(list)

        def sort_order(k):
            return (k.get('verified_count', 0), k.get('is_from_claim', False),
                    k.get('value_count', 1), k.get('updated_at', None))

        def sort_order_excluding_updated_at(k):
            return (k.get('verified_count', 0), k.get('is_from_claim', False),
                    k.get('value_count', 1))

        for field_name, _ in ExtendedField.FIELD_CHOICES:
            serializer = ExtendedFieldListSerializer(
                        fields.filter(field_name=field_name),
                        many=True,
                        context={'user_can_see_detail': user_can_see_detail,
                                 'embed_mode_active': embed_mode_active}
                    )

            if field_name == ExtendedField.NAME and not embed_mode_active:
                unsorted_data = serializer.data
                for item in get_facility_names(facility):
                    if item.name is not None and len(item.name) != 0:
                        unsorted_data.append(
                            create_name_field(item.name,
                                              item.source.contributor,
                                              item.updated_at,
                                              user_can_see_detail))
                data = sorted(unsorted_data,
                              key=sort_order_excluding_updated_at,
                              reverse=True)
            elif field_name == ExtendedField.ADDRESS and not embed_mode_active:
                unsorted_data = serializer.data
                for item in get_facility_addresses(facility):
                    if item.address is not None and len(item.address) != 0:
                        unsorted_data.append(
                            create_address_field(item.address,
                                                 item.source.contributor,
                                                 item.updated_at,
                                                 user_can_see_detail))
                data = sorted(unsorted_data,
                              key=sort_order_excluding_updated_at,
                              reverse=True)
            else:
                data = sorted(serializer.data, key=sort_order, reverse=True)

            grouped_data[field_name] = data

        return grouped_data


class FacilityDownloadSerializer(Serializer):
    rows = SerializerMethodField()

    class Meta:
        model = Facility
        fields = ('rows')

    EXTENDED_FIELDS_HEADERS = [
        'number_of_workers',
        'parent_company',
        'processing_type_facility_type_raw',
        'facility_type',
        'processing_type',
        'product_type',
    ]

    def get_headers(self):
        headers = [
            'os_id',
            'contribution_date',
            'name',
            'address',
            'country_code',
            'country_name',
            'lat',
            'lng',
            'sector',
        ]

        if not is_embed_mode_active(self):
            headers.append('contributor (list)')
        else:
            headers.extend([f.column_name for f
                            in self.get_contributor_fields()])

        headers.extend(self.EXTENDED_FIELDS_HEADERS)

        headers.append('is_closed')

        return headers

    def get_rows(self, facility):
        is_embed_mode = is_embed_mode_active(self)
        user_can_see_detail = can_user_see_detail(self)

        contributor_fields = []
        if is_embed_mode:
            contributor_fields = self.get_contributor_fields()

        def add_non_base_fields(row, list_item, match_is_active):
            row.append('|'.join(list_item.sector))
            if not is_embed_mode:
                contribution = get_download_contribution(
                    list_item.source, match_is_active, user_can_see_detail)
                row.append(contribution)
            else:
                contributor_field_values = assign_contributor_field_values(
                    list_item, contributor_fields)
                row.extend([f['value'] if f['value'] is not None else ''
                            for f in contributor_field_values])

            extended_fields = ExtendedField.objects.filter(
                facility_list_item=list_item
            ).values('value', 'field_name')
            row.extend(format_download_extended_fields(extended_fields))

            return row

        rows = []

        base_row = [
            facility.id,
            format_download_date(facility.created_at),
            FacilitySerializer.get_name(self, facility),
            facility.address,
            facility.country_code,
            FacilitySerializer.get_country_name(self, facility),
            facility.location.coords[1],
            facility.location.coords[0]
        ]

        facility_matches = facility \
            .facilitymatch_set \
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED,
                                FacilityMatch.MERGED])

        claim = None
        try:
            claim = FacilityClaim.objects.get(facility=facility,
                                              status=FacilityClaim.APPROVED)

            sector = claim.sector if claim.sector is not None \
                else facility.created_from.sector
            base_row.append('|'.join(sector))

            if not is_embed_mode:
                contribution = get_download_claim_contribution(
                    claim, user_can_see_detail)
                base_row.append(contribution)
            else:
                base_row.extend(['' for f in contributor_fields])

            extended_fields = ExtendedField.objects.filter(
                facility_claim=claim).values('value', 'field_name')
            base_row.extend(format_download_extended_fields(extended_fields))

        except FacilityClaim.DoesNotExist:
            match_is_active = facility_matches.filter(
                facility_list_item=facility.created_from,
                is_active=True).exists()
            base_row = add_non_base_fields(
                base_row, facility.created_from, match_is_active)

        base_row.append(facility.is_closed if facility.is_closed else 'False')

        rows.append(base_row)

        if is_embed_mode:
            contributor_id = get_embed_contributor_id(self)
            facility_matches = facility_matches.filter(
                facility_list_item__source__contributor_id=contributor_id,
                facility_list_item__source__is_active=True,
                is_active=True)

        facility_matches = facility_matches.order_by('-created_at')

        for facility_match in facility_matches:
            list_item = facility_match.facility_list_item
            # Skip the current item if it was used as the base row
            if claim is None and facility.created_from_id == list_item.id:
                continue

            row = [facility.id,
                   format_download_date(list_item.source.created_at),
                   '', '', '', '', '', '']
            row = add_non_base_fields(row, list_item, facility_match.is_active)
            # Add a blank slot for closure status
            row.append('')

            rows.append(row)

        return rows

    def get_contributor_fields(self):
        request = self.context.get('request') \
            if self.context is not None else []
        if request is None or request.query_params is None:
            return []

        embed = request.query_params.get('embed')
        contributor_id = get_embed_contributor_id(self)
        if not embed == '1' or contributor_id is None:
            return []

        fields = []
        contributor = Contributor.objects.get(id=contributor_id)
        if contributor.embed_config is not None:
            config = contributor.embed_config
            if EmbedField.objects.filter(embed_config=config).count() > 0:
                fields = EmbedField.objects.filter(
                    embed_config=config, visible=True).order_by('order')
        return [f for f in fields
                if f.column_name not in self.EXTENDED_FIELDS_HEADERS]


def assign_contributor_field_values(list_item, fields):
    contributor_fields = [{
        'label': f.display_name, 'value': None, 'column_name': f.column_name
    } for f in fields]

    if list_item is None:
        return contributor_fields

    if list_item.source.source_type == 'SINGLE':
        contributor_fields = get_single_contributor_field_values(
                                list_item, contributor_fields
                            )
    else:
        contributor_fields = get_list_contributor_field_values(
                                list_item, contributor_fields
                             )

    return [
        {
            'value': f['value'],
            'label': f['label'],
            'fieldName': f['column_name'],
        }
        for f in contributor_fields
    ]


def can_user_see_detail(serializer):
    request = serializer.context.get('request') \
        if serializer.context is not None else None
    user = request.user if request is not None else None

    if user is not None and not user.is_anonymous:
        return user.can_view_full_contrib_details
    else:
        return True


def get_contributor_name(contributor, user_can_see_detail):
    if contributor is None:
        return None
    if user_can_see_detail:
        return contributor.name
    s = prefix_a_an(contributor.contrib_type)
    return s[0].lower() + s[1:]


def get_contributor_id(contributor, user_can_see_detail):
    if contributor is not None and user_can_see_detail:
        return contributor.admin.id
    return None


def create_name_field(name, contributor, updated_at, user_can_see_detail):
    return {
      'value': name,
      'field_name': ExtendedField.NAME,
      'contributor_id': get_contributor_id(contributor, user_can_see_detail),
      'contributor_name':
      get_contributor_name(contributor, user_can_see_detail),
      'updated_at': updated_at,
    }


def get_facility_names(facility):
    facility_list_item_matches = [
        FacilityListItem.objects.get(pk=pk)
        for (pk,)
        in facility
        .facilitymatch_set
        .filter(status__in=[FacilityMatch.AUTOMATIC,
                            FacilityMatch.CONFIRMED,
                            FacilityMatch.MERGED])
        .filter(is_active=True)
        .exclude(facility_list_item__source__is_active=False)
        .exclude(facility_list_item__source__is_public=False)
        .exclude(facility_list_item__name__isnull=True)
        .values_list('facility_list_item')
    ]

    return facility_list_item_matches


def create_address_field(address, contributor, updated_at,
                         user_can_see_detail, is_from_claim=False):
    return {
      'value': address,
      'field_name': ExtendedField.ADDRESS,
      'contributor_id': get_contributor_id(contributor, user_can_see_detail),
      'contributor_name':
      get_contributor_name(contributor, user_can_see_detail),
      'updated_at': updated_at,
      'is_from_claim': is_from_claim,
    }


def get_facility_addresses(facility):
    facility_list_item_matches = [
        FacilityListItem.objects.get(pk=pk)
        for (pk,)
        in facility
        .facilitymatch_set
        .filter(status__in=[FacilityMatch.AUTOMATIC,
                            FacilityMatch.CONFIRMED,
                            FacilityMatch.MERGED])
        .filter(is_active=True)
        .exclude(facility_list_item__source__is_active=False)
        .exclude(facility_list_item__source__is_public=False)
        .exclude(facility_list_item__address__isnull=True)
        .values_list('facility_list_item')
    ]

    return facility_list_item_matches


class FacilityDetailsSerializer(FacilitySerializer):
    other_names = SerializerMethodField()
    other_addresses = SerializerMethodField()
    other_locations = SerializerMethodField()
    country_name = SerializerMethodField()
    claim_info = SerializerMethodField()
    activity_reports = SerializerMethodField()
    contributor_fields = SerializerMethodField()
    extended_fields = SerializerMethodField()
    created_from = SerializerMethodField()
    sector = SerializerMethodField()

    class Meta:
        model = Facility
        fields = ('id', 'name', 'address', 'country_code', 'location',
                  'os_id', 'other_names', 'other_addresses', 'contributors',
                  'country_name', 'claim_info', 'other_locations',
                  'ppe_product_types', 'ppe_contact_phone',
                  'ppe_contact_email', 'ppe_website',  'is_closed',
                  'activity_reports', 'contributor_fields', 'new_os_id',
                  'has_inexact_coordinates', 'extended_fields', 'created_from',
                  'sector')
        geo_field = 'location'

    def get_other_names(self, facility):
        if is_embed_mode_active(self):
            return []

        return facility.other_names()

    def get_other_addresses(self, facility):
        if is_embed_mode_active(self):
            return []
        other_addresses = facility.other_addresses()

        claim = facility.get_approved_claim()
        if claim is not None:
            return set([facility.address]).union(other_addresses)

        return other_addresses

    def get_other_locations(self, facility):
        if is_embed_mode_active(self):
            return []

        user_can_see_detail = can_user_see_detail(self)

        facility_locations = [
            {
                'lat': loc.location.y,
                'lng': loc.location.x,
                'contributor_id': get_contributor_id(loc.contributor,
                                                     user_can_see_detail),
                'contributor_name': get_contributor_name(loc.contributor,
                                                         user_can_see_detail),
                'notes': loc.notes,
            }
            for loc
            in FacilityLocation.objects.filter(facility=facility)
        ]

        facility_matches = [
            {
                'lat': match.facility_list_item.geocoded_point.y,
                'lng': match.facility_list_item.geocoded_point.x,
                'contributor_id': get_contributor_id(
                    match.facility_list_item.source.contributor,
                    user_can_see_detail),
                'contributor_name': get_contributor_name(
                    match.facility_list_item.source.contributor,
                    user_can_see_detail),
                'notes': None,
            }
            for match
            in FacilityMatch.objects.filter(facility=facility)
            .filter(status__in=[
                FacilityMatch.CONFIRMED,
                FacilityMatch.AUTOMATIC,
                FacilityMatch.MERGED,
            ])
            .filter(is_active=True)
            if match.facility_list_item.geocoded_point != facility.location
            if match.facility_list_item.geocoded_point is not None
            if match.facility_list_item.source.is_active
            if match.facility_list_item.source.is_public
        ]

        claim_locations = []
        claim = facility.get_approved_claim()
        if claim is not None:
            if claim.facility_address and claim.facility_address is not None:
                claim_locations = [
                    {
                        'lat': claim.facility_location.y
                        if claim.facility_location is not None else None,
                        'lng': claim.facility_location.x
                        if claim.facility_location is not None else None,
                        'contributor_id': get_contributor_id(
                            claim.contributor,
                            user_can_see_detail),
                        'contributor_name': get_contributor_name(
                            claim.contributor,
                            user_can_see_detail),
                        'notes': None,
                        'is_from_claim': True,
                        'has_invalid_location': claim.facility_location is None
                    },
                ]

        return claim_locations + facility_locations + facility_matches

    def get_country_name(self, facility):
        return COUNTRY_NAMES.get(facility.country_code, '')

    def get_claim_info(self, facility):
        if not switch_is_active('claim_a_facility'):
            return None

        try:
            user_can_see_detail = can_user_see_detail(self)
            claim = FacilityClaim \
                .objects \
                .filter(status=FacilityClaim.APPROVED) \
                .get(facility=facility)

            return {
                'id': claim.id,
                'facility': {
                    'description': claim.facility_description,
                    'name_english': claim.facility_name_english,
                    'name_native_language': claim
                    .facility_name_native_language,
                    'address': claim.facility_address,
                    'website': claim.facility_website
                    if claim.facility_website_publicly_visible else None,
                    'parent_company': _get_parent_company(claim),
                    'phone_number': claim.facility_phone_number
                    if claim.facility_phone_number_publicly_visible else None,
                    'minimum_order': claim.facility_minimum_order_quantity,
                    'average_lead_time': claim.facility_average_lead_time,
                    'workers_count': claim.facility_workers_count,
                    'female_workers_percentage': claim
                    .facility_female_workers_percentage,
                    'facility_type': claim.facility_type,
                    'other_facility_type': claim.other_facility_type,
                    'affiliations': claim.facility_affiliations,
                    'certifications': claim.facility_certifications,
                    'product_types': claim.facility_product_types,
                    'production_types': claim.facility_production_types,
                    'sector': claim.sector,
                    'location': json.loads(claim.facility_location.json)
                    if claim.facility_location is not None else None,
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
                'contributor': get_contributor_name(claim.contributor,
                                                    user_can_see_detail)
            }
        except FacilityClaim.DoesNotExist:
            return None

    def get_activity_reports(self, facility):
        return FacilityActivityReportSerializer(
            facility.activity_reports(), many=True).data

    def get_contributor_fields(self, facility):
        request = self.context.get('request') \
            if self.context is not None else []
        if request is None or request.query_params is None:
            return []

        embed = request.query_params.get('embed')
        contributor_id = request.query_params.get('contributor', None)
        if not embed == '1' or contributor_id is None:
            return []

        fields = []
        contributor = Contributor.objects.get(id=contributor_id)
        if contributor.embed_config is not None:
            config = contributor.embed_config
            # If there are any configured fields, they override the defaults
            # set above
            if EmbedField.objects.filter(embed_config=config).count() > 0:
                fields = EmbedField.objects.filter(
                    embed_config=config, visible=True).order_by('order')

        list_item = FacilityListItem.objects.filter(
                facility=facility,
                source__contributor=contributor,
                source__is_active=True,
                facilitymatch__is_active=True).order_by('-created_at').first()

        return assign_contributor_field_values(list_item, fields)

    def get_created_from(self, facility):
        user_can_see_detail = can_user_see_detail(self)
        list_item = facility.created_from
        matches = facility.facilitymatch_set \
                          .filter(facility_list_item=list_item)
        should_display_associations = \
            any([m.should_display_association for m in matches])
        display_detail = user_can_see_detail and should_display_associations \
            and not is_embed_mode_active(self)
        return {
            'created_at': list_item.created_at,
            'contributor': get_contributor_name(list_item.source.contributor,
                                                display_detail)
        }

    def get_sector(self, facility):
        user_can_see_detail = can_user_see_detail(self)

        items = FacilityListItem \
            .objects \
            .filter(facility=facility,
                    status__in=[FacilityListItem.MATCHED,
                                FacilityListItem.CONFIRMED_MATCH]) \
            .order_by('source__contributor_id', '-source__is_active',
                      '-facilitymatch__is_active', '-updated_at') \
            .distinct('source__contributor_id')
        claims = FacilityClaim \
            .objects \
            .filter(facility=facility, status=FacilityClaim.APPROVED) \
            .exclude(sector=None) \
            .order_by('contributor_id', '-updated_at') \
            .distinct('contributor_id')

        contributor_id = get_embed_contributor_id(self)
        if is_embed_mode_active(self) and contributor_id is not None:
            items = items.filter(source__contributor_id=contributor_id)
            claims = claims.filter(contributor_id=contributor_id)

        item_sectors = [
            {
                'updated_at': i.updated_at,
                'contributor_id': get_contributor_id(
                    i.source.contributor,
                    (user_can_see_detail
                     and i.source.is_active
                     and i.source.is_public
                     and i.has_active_complete_match)),
                'contributor_name': get_contributor_name(
                    i.source.contributor,
                    (user_can_see_detail
                     and i.source.is_active
                     and i.source.is_public
                     and i.has_active_complete_match)),
                'values': i.sector,
                'is_from_claim': False
            }
            for i in items
        ]

        claim_sectors = [
            {
                'updated_at': c.updated_at,
                'contributor_id': get_contributor_id(
                    c.contributor, user_can_see_detail),
                'contributor_name': get_contributor_name(
                    c.contributor, user_can_see_detail),
                'values': c.sector,
                'is_from_claim': True
            }
            for c in claims
        ]

        return claim_sectors + sorted(
            item_sectors, key=lambda i: i['updated_at'], reverse=True)


class FacilityCreateBodySerializer(Serializer):
    sector = PipeSeparatedField(
        required=False,
        allow_empty=False,
        child=CharField(required=True, max_length=200))
    product_type = PipeSeparatedField(
        required=False,
        allow_empty=False,
        child=CharField(required=True, max_length=200))
    sector_product_type = PipeSeparatedField(
        required=False,
        allow_empty=False,
        child=CharField(required=True, max_length=200))

    country = CharField(required=True)
    name = CharField(required=True, max_length=200)
    address = CharField(required=True, max_length=200)
    ppe_product_types = ListField(
        required=False, child=CharField(required=True, max_length=50))
    ppe_contact_phone = CharField(required=False, max_length=20)
    ppe_contact_email = CharField(required=False)
    ppe_website = URLField(required=False)

    def validate_country(self, value):
        try:
            return get_country_code(value)
        except ValueError as ve:
            raise ValidationError(ve)


class FacilityCreateQueryParamsSerializer(Serializer):
    create = BooleanField(default=True, required=False)
    public = BooleanField(default=True, required=False)
    textonlyfallback = BooleanField(default=False, required=False)


class FacilityClaimSerializer(ModelSerializer):
    facility_name = SerializerMethodField()
    os_id = SerializerMethodField()
    contributor_name = SerializerMethodField()
    contributor_id = SerializerMethodField()
    facility_address = SerializerMethodField()
    facility_country_name = SerializerMethodField()

    class Meta:
        model = FacilityClaim
        fields = ('id', 'created_at', 'updated_at', 'contributor_id', 'os_id',
                  'contributor_name', 'facility_name', 'facility_address',
                  'facility_country_name', 'status')

    def get_facility_name(self, claim):
        return claim.facility.name

    def get_os_id(self, claim):
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
    facility_parent_company = SerializerMethodField()

    class Meta:
        model = FacilityClaim
        fields = ('id', 'created_at', 'updated_at', 'contact_person', 'email',
                  'phone_number', 'company_name', 'website',
                  'facility_description', 'preferred_contact_method', 'status',
                  'contributor', 'facility', 'verification_method',
                  'status_change', 'notes', 'facility_parent_company',
                  'job_title', 'linkedin_profile')

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

    def get_facility_parent_company(self, claim):
        return _get_parent_company(claim)


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
    contributors = SerializerMethodField()
    facility_types = SerializerMethodField()
    facility_parent_company = SerializerMethodField()
    affiliation_choices = SerializerMethodField()
    certification_choices = SerializerMethodField()
    production_type_choices = SerializerMethodField()

    class Meta:
        model = FacilityClaim
        fields = ('id', 'facility_description',
                  'facility_name_english', 'facility_name_native_language',
                  'facility_address', 'facility_location',
                  'facility_phone_number',
                  'facility_phone_number_publicly_visible',
                  'facility_website', 'facility_minimum_order_quantity',
                  'facility_average_lead_time', 'point_of_contact_person_name',
                  'point_of_contact_email', 'facility_workers_count',
                  'facility_female_workers_percentage',
                  'point_of_contact_publicly_visible',
                  'office_official_name', 'office_address',
                  'office_country_code', 'office_phone_number',
                  'office_info_publicly_visible',
                  'facility', 'countries', 'facility_parent_company',
                  'contributors', 'facility_website_publicly_visible',
                  'facility_types', 'facility_type', 'other_facility_type',
                  'affiliation_choices', 'certification_choices',
                  'facility_affiliations', 'facility_certifications',
                  'facility_product_types', 'facility_production_types',
                  'production_type_choices', 'sector')

    def get_facility(self, claim):
        return FacilityDetailsSerializer(
            claim.facility, context=self.context).data

    def get_countries(self, claim):
        return COUNTRY_CHOICES

    def get_contributors(self, claim):
        return [
            (contributor.id, contributor.name)
            for contributor
            in Contributor.objects.all().order_by('name')
        ]

    def get_facility_types(self, claim):
        return ALL_FACILITY_TYPE_CHOICES

    def get_facility_parent_company(self, claim):
        return _get_parent_company(claim)

    def get_affiliation_choices(self, claim):
        return FacilityClaim.AFFILIATION_CHOICES

    def get_certification_choices(self, claim):
        return FacilityClaim.CERTIFICATION_CHOICES

    def get_production_type_choices(self, claim):
        return ALL_PROCESSING_TYPE_CHOICES


class FacilityMatchSerializer(ModelSerializer):
    os_id = SerializerMethodField()
    name = SerializerMethodField()
    address = SerializerMethodField()
    location = SerializerMethodField()

    class Meta:
        model = FacilityMatch
        fields = ('id', 'status', 'confidence', 'results',
                  'os_id', 'name', 'address', 'location',
                  'is_active')

    def get_os_id(self, match):
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
            "os_id": facility_list_item.facility.id,
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

        if not User.objects.filter(email__iexact=user_email).exists():
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


class FacilityMergeQueryParamsSerializer(Serializer):
    target = CharField(required=True)
    merge = CharField(required=True)

    def validate_target(self, target_id):
        if not Facility.objects.filter(id=target_id).exists():
            raise ValidationError(
                'Facility {} does not exist.'.format(target_id))

    def validate_merge(self, merge_id):
        if not Facility.objects.filter(id=merge_id).exists():
            raise ValidationError(
                'Facility {} does not exist.'.format(merge_id))


class LogDownloadQueryParamsSerializer(Serializer):
    path = CharField(required=True)
    record_count = IntegerField(required=True)


class FacilityUpdateLocationParamsSerializer(Serializer):
    # The Google geocoder returns points with 7 decimals of precision, which is
    # "[the] practical limit of commercial surveying"
    # https://en.wikipedia.org/wiki/Decimal_degrees
    lat = DecimalField(max_digits=None, decimal_places=7, required=True)
    lng = DecimalField(max_digits=None, decimal_places=7, required=True)
    contributor_id = IntegerField(required=False)
    notes = CharField(required=False)

    def validate_lat(self, lat):
        if lat < -90 or lat > 90:
            raise ValidationError('lat must be between -90 and 90.')

    def validate_lng(self, lat):
        if lat < -180 or lat > 180:
            raise ValidationError('lng must be between -180 and 180.')

    def validate_contributor_id(self, contributor_id):
        if not Contributor.objects.filter(id=contributor_id).exists():
            raise ValidationError(
                'Contributor {} does not exist.'.format(contributor_id))


class ApiBlockSerializer(ModelSerializer):
    contributor = SerializerMethodField()

    class Meta:
        model = ApiBlock
        fields = ('contributor', 'until', 'active', 'limit', 'actual',
                  'grace_limit', 'grace_created_by', 'grace_reason',
                  'created_at', 'updated_at', 'id')

    def get_contributor(self, instance):
        return instance.contributor.name

    def update(self, instance, validated_data):
        grace_limit = validated_data.get('grace_limit')
        active = validated_data.get('active', instance.active)
        if instance.grace_limit != grace_limit:
            limit = validated_data.get('limit')
            actual = validated_data.get('actual')
            if grace_limit <= limit or grace_limit <= actual:
                raise ValidationError('Grace limit must be greater than ' +
                                      'request limit and actual request ' +
                                      'count.')
            else:
                active = False

        instance.until = validated_data.get('until', instance.until)
        instance.active = active
        instance.limit = validated_data.get('limit', instance.limit)
        instance.actual = validated_data.get('actual', instance.actual)
        instance.grace_limit = validated_data.get('grace_limit',
                                                  instance.grace_limit)
        instance.grace_created_by = validated_data.get(
            'grace_created_by', instance.grace_created_by)
        instance.grace_reason = validated_data.get('grace_reason',
                                                   instance.grace_reason)
        instance.save()

        return instance


class ContributorWebhookSerializer(ModelSerializer):
    contributor = HiddenField(default=CurrentUserContributor())

    class Meta:
        model = ContributorWebhook
        fields = ('url', 'notification_type', 'filter_query_string',
                  'contributor', 'created_at', 'updated_at', 'id')
        read_only_fields = ('created_at', 'updated_at')


class FacilityActivityReportSerializer(ModelSerializer):
    reported_by_user = SerializerMethodField()
    reported_by_contributor = SerializerMethodField()
    facility_name = SerializerMethodField()
    status_change_by = SerializerMethodField()

    class Meta:
        model = FacilityActivityReport
        fields = ('facility', 'reported_by_user', 'reported_by_contributor',
                  'closure_state', 'approved_at', 'status_change_reason',
                  'status', 'status_change_reason', 'status_change_by',
                  'status_change_date', 'created_at', 'updated_at', 'id',
                  'reason_for_report', 'facility_name')

    def get_reported_by_user(self, instance):
        return instance.reported_by_user.email

    def get_reported_by_contributor(self, instance):
        return instance.reported_by_contributor.name

    def get_facility_name(self, instance):
        return instance.facility.name

    def get_status_change_by(self, instance):
        if instance.status_change_by is not None:
            return instance.status_change_by.email
        else:
            return None


class ContributorListQueryParamsSerializer(Serializer):
    contributors = ListField(
        child=IntegerField(required=True),
        required=False,
        allow_empty=False
    )


class EmbedFieldsSerializer(ModelSerializer):
    class Meta:
        model = EmbedField
        fields = ('column_name', 'display_name',
                  'visible', 'order', 'searchable')


class EmbedConfigSerializer(ModelSerializer):
    contributor = SerializerMethodField()
    embed_fields = SerializerMethodField()
    contributor_name = SerializerMethodField()
    extended_fields = SerializerMethodField()

    class Meta:
        model = EmbedConfig
        fields = ('id', 'width', 'height', 'color', 'font', 'contributor',
                  'embed_fields', 'prefer_contributor_name',
                  'contributor_name', 'text_search_label', 'map_style',
                  'extended_fields', 'hide_sector_data')

    def get_contributor(self, instance):
        try:
            return instance.contributor.id
        except Contributor.DoesNotExist:
            return None

    def get_contributor_name(self, instance):
        try:
            return instance.contributor.name
        except Contributor.DoesNotExist:
            return None

    def get_embed_fields(self, instance):
        embed_fields = EmbedField.objects.filter(
                            embed_config=instance).order_by('order')
        return EmbedFieldsSerializer(embed_fields, many=True).data

    def get_extended_fields(self, instance):
        try:
            extended_fields = ExtendedField.objects \
                        .filter(contributor_id=instance.contributor.id) \
                        .values_list('field_name', flat=True).distinct()
            return extended_fields
        except Contributor.DoesNotExist:
            return []


class ExtendedFieldListSerializer(ModelSerializer):
    contributor_name = SerializerMethodField()
    contributor_id = SerializerMethodField()
    value_count = SerializerMethodField()
    is_from_claim = SerializerMethodField()
    verified_count = SerializerMethodField()

    class Meta:
        model = ExtendedField
        fields = ('id', 'is_verified', 'value', 'updated_at',
                  'contributor_name', 'contributor_id', 'value_count',
                  'is_from_claim', 'field_name', 'verified_count')

    def should_display_contributor(self, instance):
        user_can_see_detail = self.context.get("user_can_see_detail")

        should_display_association = True
        list_item_id = instance.facility_list_item_id
        if list_item_id is not None:
            matches = FacilityMatch.objects.filter(
                facility_list_item_id=list_item_id)
            should_display_association = \
                any([m.should_display_association for m in matches])

        return should_display_association and user_can_see_detail

    def get_contributor_name(self, instance):
        embed_mode_active = self.context.get("embed_mode_active")
        if embed_mode_active:
            return None
        return get_contributor_name(instance.contributor,
                                    self.should_display_contributor(instance))

    def get_contributor_id(self, instance):
        embed_mode_active = self.context.get("embed_mode_active")
        if embed_mode_active:
            return None
        return get_contributor_id(instance.contributor,
                                  self.should_display_contributor(instance))

    def get_value_count(self, instance):
        from_claim = Q(facility_list_item=None)
        from_active_list = Q(facility_list_item__source__is_active=True)
        vals = ExtendedField.objects.filter(facility=instance.facility) \
                                    .filter(field_name=instance.field_name) \
                                    .filter(value=instance.value) \
                                    .filter(from_claim | from_active_list) \
                                    .count()
        return vals

    def get_is_from_claim(self, instance):
        return instance.facility_list_item is None

    def get_verified_count(self, instance):
        count = 0
        if instance.contributor.is_verified:
            count += 1
        if instance.is_verified:
            count += 1
        return count
