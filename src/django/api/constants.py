class CsvHeaderField:
    COUNTRY = 'country'
    NAME = 'name'
    ADDRESS = 'address'
    LAT = 'lat'
    LNG = 'lng'


class ProcessingAction:
    PARSE = 'parse'
    GEOCODE = 'geocode'
    MATCH = 'match'
    SUBMIT_JOB = 'submitjob'
    CONFIRM = 'confirm'
    DELETE_FACILITY = 'delete_facility'
    PROMOTE_MATCH = 'promote_match'


class FacilitiesQueryParams:
    NAME = 'name'
    CONTRIBUTORS = 'contributors'
    CONTRIBUTOR_TYPES = 'contributor_types'
    COUNTRIES = 'countries'


class FacilityListQueryParams:
    CONTRIBUTOR = 'contributor'


class FacilityListItemsQueryParams:
    SEARCH = 'search'
    STATUS = 'status'
