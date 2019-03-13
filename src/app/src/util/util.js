import querystring from 'querystring';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import flatten from 'lodash/flatten';
import identity from 'lodash/identity';
import some from 'lodash/some';
import size from 'lodash/size';
import negate from 'lodash/negate';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import values from 'lodash/values';
import flow from 'lodash/flow';
import noop from 'lodash/noop';
import compact from 'lodash/compact';
import startsWith from 'lodash/startsWith';
import head from 'lodash/head';
import replace from 'lodash/replace';
import trimEnd from 'lodash/trimEnd';
import includes from 'lodash/includes';
import lowerCase from 'lodash/lowerCase';
import { featureCollection, bbox } from '@turf/turf';
import { saveAs } from 'file-saver';

import {
    OTHER,
    FEATURE_COLLECTION,
    inputTypesEnum,
    registrationFieldsEnum,
    registrationFormFields,
    profileFormFields,
    contributeCSVTemplate,
    facilitiesRoute,
    DEFAULT_PAGE,
    DEFAULT_ROWS_PER_PAGE,
} from './constants';

import { createListItemCSV } from './util.listItemCSV';

import { createFacilitiesCSV } from './util.facilitiesCSV';

export function DownloadCSV(data, fileName) {
    saveAs(
        new Blob([data], { type: 'text/csv;charset=utf-8;' }),
        fileName,
    );

    return noop();
}

export const downloadContributorTemplate = () =>
    DownloadCSV(contributeCSVTemplate, 'OAR_Contributor_Template.csv');

export const downloadListItemCSV = list =>
    DownloadCSV(
        createListItemCSV(list.items),
        `${list.id}_${list.name}_${(new Date()).toLocaleDateString()}.csv`,
    );

export const downloadFacilitiesCSV = facilities =>
    DownloadCSV(createFacilitiesCSV(facilities), 'facilities.csv');

export const makeUserLoginURL = () => '/user-login/';
export const makeUserLogoutURL = () => '/user-logout/';
export const makeUserSignupURL = () => '/user-signup/';
export const makeUserConfirmEmailURL = () => '/rest-auth/registration/verify-email/';

export const makeFacilityListsURL = () => '/api/facility-lists/';
export const makeSingleFacilityListURL = id => `/api/facility-lists/${id}/`;

export const makeAPITokenURL = () => '/api-token-auth/';

export const makeGetContributorsURL = () => '/api/contributors/';
export const makeGetContributorTypesURL = () => '/api/contributor-types/';
export const makeGetCountriesURL = () => '/api/countries/';

export const makeGetFacilitiesURL = () => '/api/facilities/';
export const makeGetFacilityByOARIdURL = oarId => `/api/facilities/${oarId}/`;
export const makeGetFacilitiesURLWithQueryString = qs => `/api/facilities/?${qs}`;

export const getValueFromObject = ({ value }) => value;

export const createQueryStringFromSearchFilters = ({
    facilityName = '',
    contributors = [],
    contributorTypes = [],
    countries = [],
}) => {
    const inputForQueryString = Object.freeze({
        name: facilityName,
        contributors: compact(contributors.map(getValueFromObject)),
        contributor_types: compact(contributorTypes.map(getValueFromObject)),
        countries: compact(countries.map(getValueFromObject)),
    });

    return querystring.stringify(omitBy(inputForQueryString, isEmpty));
};

export const mapParamToReactSelectOption = (param) => {
    if (isEmpty(param)) {
        return null;
    }

    if (Number(param)) {
        return Object.freeze({
            value: Number(param),
            label: param,
        });
    }

    return Object.freeze({
        value: param,
        label: param,
    });
};

export const createSelectOptionsFromParams = (params) => {
    const paramsInArray = !isArray(params)
        ? [params]
        : params;

    // compact to remove empty values from querystring params like 'countries='
    return compact(Object.freeze(paramsInArray.map(mapParamToReactSelectOption)));
};

export const createFiltersFromQueryString = (qs) => {
    const qsToParse = startsWith(qs, '?')
        ? qs.slice(1)
        : qs;

    const {
        name = '',
        contributors = [],
        contributor_types: contributorTypes = [],
        countries = [],
    } = querystring.parse(qsToParse);

    return Object.freeze({
        facilityName: name,
        contributors: createSelectOptionsFromParams(contributors),
        contributorTypes: createSelectOptionsFromParams(contributorTypes),
        countries: createSelectOptionsFromParams(countries),
    });
};

export const getNumberFromParsedQueryStringParamOrUseDefault = (inputValue, defaultValue) => {
    if (!inputValue) {
        return defaultValue;
    }

    const nonArrayValue = isArray(inputValue)
        ? head(inputValue)
        : inputValue;

    return Number(nonArrayValue) || defaultValue;
};

export const createPaginationOptionsFromQueryString = (qs) => {
    const qsToParse = startsWith(qs, '?')
        ? qs.slice(1)
        : qs;

    const {
        page,
        rowsPerPage,
    } = querystring.parse(qsToParse);

    return Object.freeze({
        page: getNumberFromParsedQueryStringParamOrUseDefault(page, DEFAULT_PAGE),
        rowsPerPage: getNumberFromParsedQueryStringParamOrUseDefault(
            rowsPerPage,
            DEFAULT_ROWS_PER_PAGE,
        ),
    });
};

export const getTokenFromQueryString = (qs) => {
    const qsToParse = startsWith(qs, '?')
        ? qs.slice(1)
        : qs;

    const {
        token = '',
    } = querystring.parse(qsToParse);

    return isArray(token)
        ? head(token)
        : token;
};

export const allFiltersAreEmpty = filters => values(filters)
    .reduce((acc, next) => {
        if (!isEmpty(next)) {
            return false;
        }

        return acc;
    }, true);

export const getFeaturesFromFeatureCollection = ({ features }) => features;

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

const makeCreateFormErrorMessagesFn = fields => form => fields
    .reduce((acc, { id, label, required }) => {
        if (!required) {
            return acc;
        }

        if (form[id]) {
            return acc;
        }

        const missingFieldMessage = `Missing required field ${label}`;

        if (id === registrationFieldsEnum.otherContributorType) {
            return form[registrationFieldsEnum.contributorType] === OTHER
                ? acc.concat(missingFieldMessage)
                : acc;
        }

        return acc.concat(missingFieldMessage);
    }, []);

export const createSignupErrorMessages = makeCreateFormErrorMessagesFn(registrationFormFields);
export const createProfileUpdateErrorMessages = makeCreateFormErrorMessagesFn(profileFormFields);

const makeCreateFormRequestDataFn = fields => form => fields
    .reduce((acc, { id, modelFieldName }) => Object.assign({}, acc, {
        [modelFieldName]: form[id],
    }), {});

export const createSignupRequestData = makeCreateFormRequestDataFn(registrationFormFields);
export const createProfileUpdateRequestData = makeCreateFormRequestDataFn(profileFormFields);

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

export const makeFacilityDetailLink = oarID => `${facilitiesRoute}/${oarID}`;

export const makeProfileRouteLink = userID => `/profile/${userID}`;

export const getBBoxForArrayOfGeoJSONPoints = flow(
    featureCollection,
    bbox,
);

export const makeFacilityListItemsDetailLink = id => `/lists/${id}`;
export const makePaginatedFacilityListItemsDetailLinkWithRowCount = (id, page, rowsPerPage) =>
    `/lists/${id}?page=${page}&rowsPerPage=${rowsPerPage}`;

export const makeSliceArgumentsForTablePagination = (page, rowsPerPage) => Object.freeze([
    page * rowsPerPage,
    (page + 1) * rowsPerPage,
]);

export const makeReportADataIssueEmailLink = oarId =>
    `mailto:info@openapparel.org?subject=Reporting a data issue on ID ${oarId}`;

export const makeFeatureCollectionFromSingleFeature = feature => Object.freeze({
    type: FEATURE_COLLECTION,
    features: Object.freeze([
        feature,
    ]),
});

export const createConfirmOrRejectMatchData = (listItemID, facilityMatchID) => Object.freeze({
    list_item_id: listItemID,
    facility_match_id: facilityMatchID,
});

export const createConfirmFacilityListItemMatchURL = listID =>
    `/api/facility-lists/${listID}/confirm/`;

export const createRejectFacilityListItemMatchURL = listID =>
    `/api/facility-lists/${listID}/reject/`;

export const makeMyFacilitiesRoute = contributorID =>
    `/facilities/?contributors=${contributorID}`;

export const makeResetPasswordEmailURL = () =>
    '/rest-auth/password/reset/';

export const makeResetPasswordConfirmURL = () =>
    '/rest-auth/password/reset/confirm/';

export const makeUserProfileURL = userID => `/user-profile/${userID}/`;

export const joinDataIntoCSVString = data => data
    .reduce((csvAccumulator, nextRow) => {
        const joinedColumns = nextRow
            .reduce((rowAccumulator, nextColumn) => {
                if (isNumber(nextColumn)) {
                    return rowAccumulator.concat(nextColumn, ',');
                }

                return rowAccumulator.concat(
                    '' + '"' + replace(nextColumn, '"', '\"') + '"', // eslint-disable-line
                    ',',
                );
            }, '');

        return csvAccumulator.concat(
            trimEnd(joinedColumns, ','),
            '\n',
        );
    }, '');

export const caseInsensitiveIncludes = (target, test) =>
    includes(lowerCase(target), lowerCase(test));

export const sortFacilitiesAlphabeticallyByName = data => data
    .slice()
    .sort((
        {
            properties: {
                name: firstFacilityName,
            },
        },
        {
            properties: {
                name: secondFacilityName,
            },
        },
    ) => {
        const a = lowerCase(firstFacilityName);
        const b = lowerCase(secondFacilityName);

        if (a === b) {
            return 0;
        }

        return (a < b) ? -1 : 1;
    });

// Given a list where each item is like { label: 'ABCD', value: 123 }, and
// a payload which is a list of items like { label: '123', value: 123 },
// returns a list of items from the payload with their labels replaced with
// matching items found in the list.
export const updateListWithLabels = (list, payload) => list
    .reduce((accumulator, { value }) => {
        const validOption = payload
            .find(({ value: otherValue }) => value === otherValue);

        if (!validOption) {
            return accumulator;
        }

        return accumulator
            .concat(Object.freeze({
                value,
                label: validOption.label,
            }));
    }, []);
