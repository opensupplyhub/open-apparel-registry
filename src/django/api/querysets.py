from django.db.models import Q

from api.models import Facility, FacilityMatch
from api.constants import FacilitiesQueryParams


def get_facility_queryset_from_query_params(params):
    """
    Create a Facility queryset filtered by a list of request query params.

    Arguments:
    params (dict) -- Request query parameters whose potential choices are
                     enumerated in `api.constants.FacilitiesQueryParams`.

    Returns:
    A queryset on the Facility model
    """
    free_text_query = params.get(FacilitiesQueryParams.Q, None)

    name = params.get(FacilitiesQueryParams.NAME, None)

    contributors = params.getlist(FacilitiesQueryParams.CONTRIBUTORS)

    contributor_types = params.getlist(FacilitiesQueryParams.CONTRIBUTOR_TYPES)

    countries = params.getlist(FacilitiesQueryParams.COUNTRIES)

    facilities_qs = Facility.objects.all()

    if free_text_query is not None:
        facilities_qs = facilities_qs \
            .filter(Q(name__icontains=free_text_query) |
                    Q(id__icontains=free_text_query))

    # `name` is deprecated in favor of `q`. We keep `name` available for
    # backward compatibility.
    if name is not None:
        facilities_qs = facilities_qs.filter(Q(name__icontains=name) |
                                             Q(id__icontains=name))

    if countries is not None and len(countries):
        facilities_qs = facilities_qs \
            .filter(country_code__in=countries)

    if len(contributor_types):
        type_match_facility_ids = [
            match['facility__id']
            for match
            in FacilityMatch
            .objects
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED])
            .filter(is_active=True)
            .filter(facility_list_item__facility_list__contributor__contrib_type__in=contributor_types) # NOQA
            .filter(facility_list_item__facility_list__is_active=True)
            .values('facility__id')
        ]

        facilities_qs = facilities_qs.filter(id__in=type_match_facility_ids)

    if len(contributors):
        name_match_facility_ids = [
            match['facility__id']
            for match
            in FacilityMatch
            .objects
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED])
            .filter(is_active=True)
            .filter(facility_list_item__facility_list__contributor__id__in=contributors) # NOQA
            .filter(facility_list_item__facility_list__is_active=True)
            .values('facility__id')
        ]

        facilities_qs = facilities_qs.filter(id__in=name_match_facility_ids)

    return facilities_qs
