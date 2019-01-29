import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import flatten from 'lodash/flatten';
import identity from 'lodash/identity';
import some from 'lodash/some';
import size from 'lodash/size';
import negate from 'lodash/negate';

import {
    inputTypesEnum,
    registrationFormFields,
    contributeCSVTemplate,
} from './constants';

export function DownloadCSV(data, fileName) {
    const csvData = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    if (window.navigator.msSaveOrOpenBlob) {
        // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
        window.navigator.msSaveBlob(csvData, fileName);
    } else {
        const csvURL = window.URL.createObjectURL(csvData);
        const tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', fileName);
        tempLink.click();
    }
}

export const downloadContributorTemplate = () =>
    DownloadCSV(contributeCSVTemplate, 'OAR_Contributor_Template');

export const makeUserLoginURL = () => '/user-login/';
export const makeUserLogoutURL = () => '/user-logout/';
export const makeUserSignupURL = () => '/user-signup/';

export const makeFacilityListsURL = () => '/api/facility-lists/';
export const makeSingleFacilityListURL = id => `/api/facility-lists/${id}/`;

export const makeAPITokenURL = () => '/api-token-auth/';

export const makeGetContributorsURL = () => '/contributors/';
export const makeGetContributorTypesURL = () => '/contributor-types/';
export const makeGetCountriesURL = () => '/countries/';

export const makeTotalFacilityURL = () => '/totalFactories/';

export const makeSearchFacilityByNameAndCountryURL = (name, country, contributor = null) => {
    const baseURL = `/searchFactoryNameCountry/?name=${name}&country=${country}&contributor=`;

    return contributor
        ? baseURL.concat(contributor)
        : baseURL;
};

export const createErrorListFromResponseObject = data => flatten(Object
    .entries(data)
    .map(([field, errors]) => {
        if (isArray(errors)) {
            return errors.map(err => `${field}: ${err}`);
        }

        return [];
    }));

export function logErrorAndDispatchFailure(error, defaultMessage, failureAction) {
    return (dispatch) => {
        const response = get(error, 'response', { data: null, status: null });

        if (!response.status || response.status >= 500) {
            window.console.warn(error);
            return dispatch(failureAction([defaultMessage]));
        }

        if (response.status === 404) {
            window.console.warn(error);
            return dispatch(failureAction(['Not found']));
        }

        const errorMessages = (() => {
            if (!response || !response.data) {
                return [defaultMessage];
            }

            // For signin-error
            if (response.data.non_field_errors) {
                return response.data.non_field_errors;
            }

            if (isArray(response.data)) {
                return response.data;
            }

            if (response.data.detail) {
                return [response.data.detail];
            }

            if (isObject(response.data)) {
                return createErrorListFromResponseObject(response.data);
            }

            return [defaultMessage];
        })();

        return dispatch(failureAction(errorMessages));
    };
}

export const getValueFromEvent = ({ target: { value } }) => value;

export const getCheckedFromEvent = ({ target: { checked } }) => checked;

export const getFileFromInputRef = inputRef =>
    get(inputRef, 'current.files[0]', null);

export const getFileNameFromInputRef = inputRef =>
    get(inputRef, 'current.files[0].name', '');

export const createSignupErrorMessages = form => registrationFormFields
    .reduce((acc, { id, label, required }) => {
        if (!required) {
            return acc;
        }

        if (form[id]) {
            return acc;
        }

        return acc.concat(`Missing required field ${label}`);
    }, []);

export const createSignupRequestData = form => registrationFormFields
    .reduce((acc, { id, modelFieldName }) => Object.assign({}, acc, {
        [modelFieldName]: form[id],
    }), {});

export const getStateFromEventForEventType = Object.freeze({
    [inputTypesEnum.checkbox]: getCheckedFromEvent,
    [inputTypesEnum.select]: identity,
    [inputTypesEnum.text]: getValueFromEvent,
    [inputTypesEnum.password]: getValueFromEvent,
});

const mapSingleChoiceToSelectOption = ([value, label]) => (Object.freeze({
    value,
    label,
}));

export const mapDjangoChoiceTuplesToSelectOptions = data =>
    Object.freeze(data.map(mapSingleChoiceToSelectOption));

export const allListsAreEmpty = (...lists) => negate(some)(lists, size);
