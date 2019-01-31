import { arrayOf, bool, func, number, oneOf, shape, string } from 'prop-types';

import {
    registrationFieldsEnum,
    profileFieldsEnum,
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

export const facilityListPropType = shape({
    id: number.isRequired,
    name: string,
    description: string,
    file_name: string.isRequired,
    is_active: bool.isRequired,
    is_public: bool.isRequired,
});

export const contributorOptionsPropType = arrayOf(shape({
    value: number.isRequired,
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

const FEATURE = 'Feature';
const POINT = 'Point';
const FEATURE_COLLECTION = 'FeatureCollection';

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
    }).isRequired,
});

export const facilityCollectionPropType = shape({
    type: oneOf([FEATURE_COLLECTION]).isRequired,
    features: arrayOf(facilityPropType).isRequired,
});
