import { arrayOf, bool, func, number, oneOf, oneOfType, shape, string } from 'prop-types';
import mapValues from 'lodash/mapValues';
import omitBy from 'lodash/omitBy';

import {
    registrationFieldsEnum,
    profileFieldsEnum,
    facilityListItemStatusChoicesEnum,
    FEATURE,
    FEATURE_COLLECTION,
    POINT,
    facilityMatchStatusChoicesEnum,
    CLAIM_A_FACILITY,
    facilityClaimStatusChoicesEnum,
} from './constants';

export const registrationFormValuesPropType = shape({
    [registrationFieldsEnum.email]: string.isRequired,
    [registrationFieldsEnum.name]: string.isRequired,
    [registrationFieldsEnum.description]: string.isRequired,
    [registrationFieldsEnum.website]: string.isRequired,
    [registrationFieldsEnum.contributorType]: string.isRequired,
    [registrationFieldsEnum.otherContributorType]: string.isRequired,
    [registrationFieldsEnum.password]: string.isRequired,
    [registrationFieldsEnum.confirmPassword]: string.isRequired,
    [registrationFieldsEnum.newsletter]: bool.isRequired,
    [registrationFieldsEnum.tos]: bool.isRequired,
});

export const registrationFormInputHandlersPropType = shape(Object
    .values(registrationFieldsEnum)
    .reduce((accumulator, key) =>
        Object.assign({}, accumulator, { [key]: func.isRequired }), {}));

export const userPropType = shape({
    email: string.isRequired,
    id: number.isRequired,
    contributor_id: number,
});

export const profileFormValuesPropType = shape(Object
    .values(profileFieldsEnum)
    .reduce((accumulator, key) =>
        Object.assign({}, accumulator, { [key]: string.isRequired }), {}));

export const profileFormInputHandlersPropType = shape(Object
    .values(profileFieldsEnum)
    .reduce((accumulator, key) =>
        Object.assign({}, accumulator, { [key]: func.isRequired }), {}));

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
    results: arrayOf(shape({
        version: number.isRequired,
        match_type: string.isRequired,
    })),
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
    facility_list: number.isRequired,
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
    matches: arrayOf(shape({
        id: number.isRequired,
        oar_id: string.isRequired,
        address: string.isRequired,
        name: string.isRequired,
        location: shape({
            lng: number.isRequired,
            lat: number.isRequired,
        }).isRequired,
    }).isRequired),
});

export const facilityListPropType = shape({
    id: number.isRequired,
    name: string,
    description: string,
    file_name: string.isRequired,
    is_active: bool.isRequired,
    is_public: bool.isRequired,
    item_count: number.isRequired,
    items_url: string.isRequired,
    statuses: arrayOf(oneOf(Object.values(facilityListItemStatusChoicesEnum))),
    status_counts: shape(mapValues(
        omitBy(
            facilityListItemStatusChoicesEnum,
            status => status === facilityListItemStatusChoicesEnum.NEW_FACILITY,
        ),
        () => number.isRequired,
    )).isRequired,
});

export const contributorOptionsPropType = arrayOf(shape({
    value: oneOfType([number, string]).isRequired,
    label: string.isRequired,
}));

export const contributorTypeOptionsPropType = arrayOf(shape({
    value: string.isRequired,
    label: string.isRequired,
}));

export const countryOptionsPropType = arrayOf(shape({
    value: string.isRequired,
    label: string.isRequired,
}));

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
    id: number.isRequired,
    name: string.isRequired,
    is_verified: bool.isRequired,
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
    facilityName: string.isRequired,
    contributors: arrayOf(reactSelectOptionPropType).isRequired,
    contributorTypes: arrayOf(reactSelectOptionPropType).isRequired,
    countries: arrayOf(reactSelectOptionPropType).isRequired,
});

export const facilityListItemStatusPropType =
    oneOf(Object.values(facilityListItemStatusChoicesEnum).concat('Status'));

export const featureFlagPropType = oneOf([CLAIM_A_FACILITY]);

export const facilityClaimsListPropType = arrayOf(shape({
    created_at: string.isRequired,
    updated_at: string.isRequired,
    id: number.isRequired,
    oar_id: string.isRequired,
    facility_name: string.isRequired,
    contributor_id: number.isRequired,
    contributor_name: string.isRequired,
    status: oneOf(Object.values(facilityClaimStatusChoicesEnum)),
}).isRequired);
