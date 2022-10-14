import {
    arrayOf,
    bool,
    func,
    number,
    oneOf,
    oneOfType,
    shape,
    string,
} from 'prop-types';
import mapValues from 'lodash/mapValues';
import omitBy from 'lodash/omitBy';
import includes from 'lodash/includes';
import partial from 'lodash/partial';

import {
    profileFieldsEnum,
    facilityListItemStatusChoicesEnum,
    FEATURE,
    FEATURE_COLLECTION,
    POINT,
    facilityMatchStatusChoicesEnum,
    CLAIM_A_FACILITY,
    VECTOR_TILE,
    PPE,
    REPORT_A_FACILITY,
    EMBEDDED_MAP_FLAG,
    EXTENDED_PROFILE_FLAG,
    facilityClaimStatusChoicesEnum,
} from './constants';

export const userPropType = shape({
    email: string.isRequired,
    id: number.isRequired,
    contributor_id: number,
    is_superuser: bool.isRequired,
});

export const profileFormValuesPropType = shape(
    Object.values(profileFieldsEnum).reduce(
        (accumulator, key) =>
            Object.assign({}, accumulator, { [key]: string.isRequired }),
        {},
    ),
);

export const profileFormInputHandlersPropType = shape(
    Object.values(profileFieldsEnum).reduce(
        (accumulator, key) =>
            Object.assign({}, accumulator, { [key]: func.isRequired }),
        {},
    ),
);

export const tokenPropType = shape({
    token: string.isRequired,
    created: string.isRequired,
});

export const facilityMatchPropType = shape({
    id: number.isRequired,
    status: oneOf(Object.values(facilityMatchStatusChoicesEnum)).isRquired,
    confidence: number.isRequired,
    oar_id: string.isRequired,
    name: string.isRequired,
    address: string.isRequired,
    results: arrayOf(
        shape({
            version: number.isRequired,
            match_type: string.isRequired,
        }),
    ),
});

export const facilityListItemPropType = shape({
    id: number.isRequired,
    row_index: number.isRequired,
    raw_data: string.isRequired,
    status: oneOf(Object.values(facilityListItemStatusChoicesEnum)).isRequired,
    processing_started_at: string,
    processing_completed_at: string,
    name: string.isRequired,
    address: string.isRequired,
    country_code: string.isRequired,
    country_name: string.isRequired,
    geocoded_point: string,
    geocoded_address: string,
    processing_errors: arrayOf(string.isRequired),
    matched_facility: shape({
        oar_id: string.isRequired,
        address: string.isRequired,
        name: string.isRequired,
        created_from_id: number.isRequired,
        location: shape({
            lng: number.isRequired,
            lat: number.isRequired,
        }).isRequired,
    }),
    matches: arrayOf(
        shape({
            id: number.isRequired,
            oar_id: string.isRequired,
            address: string.isRequired,
            name: string.isRequired,
            location: shape({
                lng: number.isRequired,
                lat: number.isRequired,
            }).isRequired,
        }).isRequired,
    ),
});

export const facilityListPropType = shape({
    id: number.isRequired,
    name: string,
    description: string,
    contributor_id: number,
    file_name: string.isRequired,
    is_active: bool.isRequired,
    is_public: bool.isRequired,
    item_count: number.isRequired,
    items_url: string.isRequired,
    statuses: arrayOf(oneOf(Object.values(facilityListItemStatusChoicesEnum))),
    status_counts: shape(
        mapValues(
            omitBy(
                facilityListItemStatusChoicesEnum,
                partial(includes, [
                    facilityListItemStatusChoicesEnum.NEW_FACILITY,
                    facilityListItemStatusChoicesEnum.REMOVED,
                ]),
            ),
            () => number.isRequired,
        ),
    ).isRequired,
    created_at: string.isRequired,
});

export const contributorOptionPropType = shape({
    value: oneOfType([number, string]).isRequired,
    label: string.isRequired,
});

export const contributorOptionsPropType = arrayOf(contributorOptionPropType);

export const contributorTypeOptionsPropType = arrayOf(
    shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
);

export const countryOptionsPropType = arrayOf(
    shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
);

export const facilityTypeOptionsPropType = arrayOf(
    shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
);

export const processingTypeOptionsPropType = arrayOf(
    shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
);

export const facilityProcessingTypeOptionsPropType = arrayOf(
    shape({
        facilityType: string.isRequired,
        processingTypes: arrayOf(string),
    }),
);

export const productTypeOptionsPropType = arrayOf(
    shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
);

export const numberOfWorkerOptionsPropType = arrayOf(
    shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
);

export const facilityPropType = shape({
    id: string.isRequired,
    type: oneOf([FEATURE]).isRequired,
    geometry: shape({
        type: oneOf([POINT]).isRequired,
        coordinates: arrayOf(number.isRequired).isRequired,
    }).isRequired,
    properties: shape({
        name: string.isRequired,
        address: string.isRequired,
        country_code: string.isRequired,
        country_name: string.isRequired,
    }).isRequired,
});

export const facilityDetailsContributorPropType = shape({
    id: number,
    name: string.isRequired,
    is_verified: bool,
});

export const facilityDetailsPropType = shape({
    id: string.isRequired,
    type: oneOf([FEATURE]).isRequired,
    geometry: shape({
        type: oneOf([POINT]).isRequired,
        coordinates: arrayOf(number.isRequired).isRequired,
    }).isRequired,
    properties: shape({
        name: string.isRequired,
        address: string.isRequired,
        country_code: string.isRequired,
        country_name: string.isRequired,
        other_names: arrayOf(string),
        other_addresses: arrayOf(string),
        contributors: arrayOf(facilityDetailsContributorPropType),
    }).isRequired,
});

export const facilityCollectionPropType = shape({
    type: oneOf([FEATURE_COLLECTION]).isRequired,
    features: arrayOf(facilityPropType).isRequired,
});

export const reactSelectOptionPropType = shape({
    value: oneOfType([number, string]).isRequired,
    label: string.isRequired,
});

export const filtersPropType = shape({
    facilityFreeTextQuery: string.isRequired,
    contributors: arrayOf(reactSelectOptionPropType).isRequired,
    contributorTypes: arrayOf(reactSelectOptionPropType).isRequired,
    countries: arrayOf(reactSelectOptionPropType).isRequired,
    combineContributors: string.isRequired,
});

export const facilityListItemStatusPropType = oneOf(
    Object.values(facilityListItemStatusChoicesEnum).concat('Status'),
);

export const featureFlagPropType = oneOf([
    CLAIM_A_FACILITY,
    VECTOR_TILE,
    PPE,
    REPORT_A_FACILITY,
    EMBEDDED_MAP_FLAG,
    EXTENDED_PROFILE_FLAG,
]);

export const facilityClaimsListPropType = arrayOf(
    shape({
        created_at: string.isRequired,
        updated_at: string.isRequired,
        id: number.isRequired,
        oar_id: string.isRequired,
        facility_name: string.isRequired,
        contributor_id: number.isRequired,
        contributor_name: string.isRequired,
        status: oneOf(Object.values(facilityClaimStatusChoicesEnum)).isRequired,
    }).isRequired,
);

export const facilityClaimNotePropType = shape({
    id: number.isRequired,
    created_at: string.isRequired,
    updated_at: string.isRequired,
    note: string.isRequired,
});

export const facilityClaimPropType = shape({
    id: number.isRequired,
    created_at: string.isRequired,
    updated_at: string.isRequired,
    contact_person: string.isRequired,
    job_title: string.isRequired,
    email: string.isRequired,
    phone_number: string.isRequired,
    company_name: string.isRequired,
    website: string.isRequired,
    facility_description: string.isRequired,
    preferred_contact_method: string.isRequired,
    linkedin_profile: string.isRequired,
    status: oneOf(Object.values(facilityClaimStatusChoicesEnum)).isRequired,
    contributor: shape({}).isRequired,
    facility: facilityPropType.isRequired,
    status_change: shape({
        status_change_by: string,
        status_change_date: string,
        status_change_reason: string,
    }).isRequired,
    notes: arrayOf(facilityClaimNotePropType).isRequired,
});

export const approvedFacilityClaimPropType = shape({
    id: number.isRequired,
    facility_description: string.isRequired,
    facility_name_english: string.isRequired,
    facility_name_native_language: string.isRequired,
    facility_address: string.isRequired,
    facility_phone_number: string.isRequired,
    facility_phone_number_publicly_visible: bool.isRequired,
    facility_website: string.isRequired,
    facility_website_publicly_visible: bool.isRequired,
    facility_minimum_order_quantity: string.isRequired,
    facility_average_lead_time: string.isRequired,
    facility_workers_count: oneOfType([number, string]).isRequired,
    facility_female_workers_percentage: oneOfType([number, string]).isRequired,
    point_of_contact_person_name: string.isRequired,
    point_of_contact_email: string.isRequired,
    point_of_contact_publicly_visible: bool.isRequired,
    office_official_name: string.isRequired,
    office_country_code: string.isRequired,
    office_phone_number: string.isRequired,
    office_info_publicly_visible: bool.isRequired,
    facility: facilityDetailsPropType.isRequired,
    facility_type: arrayOf(arrayOf(string)).isRequired,
    facility_types: arrayOf(arrayOf(string)).isRequired,
    affiliation_choices: arrayOf(arrayOf(string)).isRequired,
    certification_choices: arrayOf(arrayOf(string)).isRequired,
    production_type_choices: arrayOf(arrayOf(string)).isRequired,
});

export const apiBlockPropType = shape({
    limit: number.isRequired,
    actual: number.isRequired,
    contributor: string.isRequired,
    active: bool.isRequired,
    grace_limit: number,
    grace_reason: string,
    until: string.isRequired,
    created_at: string.isReqired,
});

export const activityReportPropType = shape({
    approved_at: string,
    closure_state: string.isRequired,
    created_at: string.isRequired,
    facility: string.isRequired,
    facility_name: string.isReqired,
    id: number.isRequired,
    reason_for_report: string.isRequired,
    reported_by_contributor: string.isRequired,
    reported_by_user: string.isRequired,
    status: string.isRequired,
    status_change_by: string,
    status_change_date: string,
    status_change_reason: string,
    updated_at: string.isRequired,
});
