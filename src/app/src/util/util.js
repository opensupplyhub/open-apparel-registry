import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import flatten from 'lodash/flatten';
import identity from 'lodash/identity';

import {
    inputTypesEnum,
    registrationFormFields,
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

export const makeUserLoginURL = () => '/user-login/';
export const makeUserLogoutURL = () => '/user-logout/';
export const makeUserSignupURL = () => '/user-signup/';

export const makeGetListsURL = uid =>
    `/getLists/${uid}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeUpdateListURL = (uid, filename) =>
    `/getList/${uid}/?file_name=${filename}&key=${process.env.REACT_APP_API_KEY}`;

export const makeConfirmTempURL = tempId =>
    `/confirmTemp/${tempId}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeUpdateSourceNameURL = uid =>
    `/updateSourceName/${uid}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeUploadTempFacilityURL = uid =>
    `/uploadTempFactory/${uid}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeAPITokenURL = () => '/api-token-auth/';

export const makeAllSourceURL = () => '/allsource/';
export const makeAllCountryURL = () => '/allcountry/';
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
