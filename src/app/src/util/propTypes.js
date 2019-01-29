import { bool, func, number, shape, string } from 'prop-types';

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
