class CsvHeaderField:
    SECTOR = 'sector'
    PRODUCT_TYPE = 'product_type'
    SECTOR_PRODUCT_TYPE = 'sector_product_type'
    COUNTRY = 'country'
    NAME = 'name'
    ADDRESS = 'address'
    LAT = 'lat'
    LNG = 'lng'
    PPE_PRODUCT_TYPES = 'ppe_product_types'
    PPE_CONTACT_PHONE = 'ppe_contact_phone'
    PPE_CONTACT_EMAIL = 'ppe_contact_email'
    PPE_WEBSITE = 'ppe_website'


class ProcessingAction:
    PARSE = 'parse'
    GEOCODE = 'geocode'
    MATCH = 'match'
    SUBMIT_JOB = 'submitjob'
    CONFIRM = 'confirm'
    DELETE_FACILITY = 'delete_facility'
    PROMOTE_MATCH = 'promote_match'
    MERGE_FACILITY = 'merge_facility'
    SPLIT_FACILITY = 'split_facility'
    MOVE_FACILITY = 'move_facility'
    NOTIFY_COMPLETE = 'notify_complete'
    ITEM_REMOVED = 'item_removed'
    UNDO_MERGE = 'undo_merge'


class FacilitiesQueryParams:
    Q = 'q'
    ID = 'id'
    NAME = 'name'
    CONTRIBUTORS = 'contributors'
    LISTS = 'lists'
    CONTRIBUTOR_TYPES = 'contributor_types'
    COUNTRIES = 'countries'
    COMBINE_CONTRIBUTORS = 'combine_contributors'
    BOUNDARY = 'boundary'
    PPE = 'ppe'
    EMBED = 'embed'
    PARENT_COMPANY = 'parent_company'
    FACILITY_TYPE = 'facility_type'
    PROCESSING_TYPE = 'processing_type'
    PRODUCT_TYPE = 'product_type'
    NUMBER_OF_WORKERS = 'number_of_workers'
    NATIVE_LANGUAGE_NAME = 'native_language_name'
    SECTOR = 'sectors'


class FacilityListQueryParams:
    CONTRIBUTOR = 'contributor'
    STATUS = 'status'
    MATCH_RESPONSIBILITY = 'match_responsibility'


class FacilityListItemsQueryParams:
    SEARCH = 'search'
    STATUS = 'status'


class FacilityMergeQueryParams:
    TARGET = 'target'
    MERGE = 'merge'


class FacilityCreateQueryParams:
    CREATE = 'create'
    PUBLIC = 'public'
    TEXT_ONLY_FALLBACK = 'textonlyfallback'


class FeatureGroups:
    CAN_GET_FACILITY_HISTORY = 'can_get_facility_history'
    CAN_SUBMIT_FACILITY = 'can_submit_facility'
    CAN_SUBMIT_PRIVATE_FACILITY = 'can_submit_private_facility'
    CAN_VIEW_FULL_CONTRIB_DETAIL = 'can_view_full_contrib_detail'


class FacilityListStatus:
    MATCHED = "MATCHED"


class FacilityHistoryActions:
    CREATE = 'CREATE'
    UPDATE = 'UPDATE'
    DELETE = 'DELETE'
    MERGE = 'MERGE'
    SPLIT = 'SPLIT'
    MOVE = 'MOVE'
    OTHER = 'OTHER'
    ASSOCIATE = 'ASSOCIATE'
    DISSOCIATE = 'DISSOCIATE'
    CLAIM = 'CLAIM'
    CLAIM_UPDATE = 'CLAIM_UPDATE'
    CLAIM_REVOKE = 'CLAIM_REVOKE'


class Affiliations:
    BENEFITS_BUSINESS_WORKERS = 'Benefits for Business and Workers (BBW)'
    BETTER_MILLS_PROGRAM = 'Better Mills Program'
    BETTER_WORK = 'Better Work (ILO)'
    CANOPY = 'Canopy'
    ETHICAL_TRADING_INITIATIVE = 'Ethical Trading Initiative'
    EUROPEAN_OUTDOOR_GROUP = 'European Outdoor Group'
    FAIR_LABOR_ASSOCIATION = 'Fair Labor Association'
    FAIR_WEAR_FOUNDATION = 'Fair Wear Foundation'
    SEDEX = 'SEDEX'
    SOCIAL_LABOR_CONVERGENCE_PLAN = 'Social and Labor Convergence Plan (SLCP)'
    SUSTAINABLE_APPAREL_COALITION = 'Sustainable Apparel Coalition'
    SWEATFREE_PURCHASING_CONSORTIUM = 'Sweatfree Purchasing Consortium'
    HERHEATH = 'HERhealth'
    HERFINANCE = 'HERfinance'
    HERRESPECT = 'HERrespect'
    ZDHC = 'ZDHC'


class Certifications:
    BCI = 'BCI'
    B_CORP = 'B Corp'
    BLUESIGN = 'Bluesign'
    CANOPY = 'Canopy'
    CRADLE_TO_CRADLE = 'Cradle to Cradle'
    EU_ECOLABEL = 'EU Ecolabel'
    FSC = 'FSC'
    GLOBAL_RECYCLING_STANDARD = 'Global Recycling Standard (GRS)'
    GOTS = 'GOTS'
    GREEN_SCREEN = 'Green Screen for Safer Chemicals'
    HIGG_INDEX = 'Higg Index'
    IMO_CONTROL = 'IMO Control'
    INTERNATIONAL_WOOL_TEXTILE = ('International Wool Textile Organisation'
                                  ' (IWTO)')
    ISO_9000 = 'ISO 9000'
    IVN_LEATHER = 'IVN leather'
    LEATHER_WORKING_GROUP = 'Leather Working Group'
    NORDIC_SWAN = 'Nordic Swan'
    OEKO_TEX_STANDARD = 'Oeko-Tex Standard 100'
    OEKO_TEX_STEP = 'Oeko-Tex STeP'
    OEKO_TEX_ECO_PASSPORT = 'Oeko-Tex Eco Passport'
    OEKO_TEX_MADE_IN_GREEN = 'Oeko-Tex Made in Green'
    PEFC = 'PEFC'
    REACH = 'REACH'
    RESPONSIBLE_DOWN_STANDARD = 'Responsible Down Standard (RDS)'
    RESPONSIBLE_WOOL_STANDARD = 'Responsible Wool Standard (RWS)'
    SAB8000 = 'SA8000'
    GREEN_BUTTON = 'Green Button'
    FAIRTRADE_USA = 'Fairtrade USA'


class LogDownloadQueryParams:
    PATH = 'path'
    RECORD_COUNT = 'record_count'


class UpdateLocationParams:
    LAT = 'lat'
    LNG = 'lng'
    NOTES = 'notes'
    CONTRIBUTOR_ID = 'contributor_id'


class DateFormats:
    STANDARD = '%Y-%m-%d %H:%M:%S.%f'
    SECOND = '%Y-%m-%d %H:%M:%S'
    MONTH = '%Y-%m'
    WEEK = '%Y-%W'


class MatchResponsibility:
    MODERATOR = "moderator"
    CONTRIBUTOR = "contributor"

    CHOICES = [
        (MODERATOR, 'OS Hub admins'),
        (CONTRIBUTOR, 'The contributor'),
    ]


class NumberOfWorkersRanges:
    STANDARD_RANGES = [{
        'min': 0,
        'max': 1000,
        'label': 'Less than 1000'
    }, {
        'min': 1001,
        'max': 5000,
        'label': '1001-5000'
    }, {
        'min': 5001,
        'max': 10000,
        'label': '5001-10000'
    }, {
        'min': 10001,
        'label': 'More than 10000'
    }]
