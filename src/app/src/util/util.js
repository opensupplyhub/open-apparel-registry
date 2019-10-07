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
import isNil from 'lodash/isNil';
import values from 'lodash/values';
import flow from 'lodash/flow';
import noop from 'lodash/noop';
import compact from 'lodash/compact';
import startsWith from 'lodash/startsWith';
import head from 'lodash/head';
import replace from 'lodash/replace';
import trimEnd from 'lodash/trimEnd';
import range from 'lodash/range';
import ceil from 'lodash/ceil';
import toInteger from 'lodash/toInteger';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import every from 'lodash/every';
import uniqWith from 'lodash/uniqWith';
import { isEmail, isURL } from 'validator';
import { featureCollection, bbox } from '@turf/turf';
import { saveAs } from 'file-saver';
import hash from 'object-hash';

import env from './env';

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
    ENTER_KEY,
    facilityListItemStatusChoicesEnum,
    facilityListItemErrorStatuses,
    facilityListSummaryStatusMessages,
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

export const downloadListItemCSV = (list, items) =>
    DownloadCSV(
        createListItemCSV(items),
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
export const makeSingleFacilityListItemsURL = id => `/api/facility-lists/${id}/items/`;

export const makeDashboardFacilityListsURL = contributorID => `/api/facility-lists/?contributor=${contributorID}`;

export const makeAPITokenURL = () => '/api-token-auth/';

export const makeGetContributorsURL = () => '/api/contributors/';
export const makeGetContributorTypesURL = () => '/api/contributor-types/';
export const makeGetCountriesURL = () => '/api/countries/';

export const makeGetFacilitiesURL = () => '/api/facilities/';
export const makeGetFacilityByOARIdURL = oarId => `/api/facilities/${oarId}/`;
export const makeGetFacilitiesURLWithQueryString = (qs, pageSize) => `/api/facilities/?${qs}&pageSize=${pageSize}`;
export const makeClaimFacilityAPIURL = oarId => `/api/facilities/${oarId}/claim/`;
export const makeSplitFacilityAPIURL = oarID => `/api/facilities/${oarID}/split/`;
export const makePromoteFacilityMatchAPIURL = oarID => `/api/facilities/${oarID}/promote/`;

export const makeMergeTwoFacilitiesAPIURL = (targetOARID, toMergeOARID) =>
    `/api/facilities/merge/?target=${targetOARID}&merge=${toMergeOARID}`;

export const makeGetFacilitiesCountURL = () => '/api/facilities/count/';

export const makeGetAPIFeatureFlagsURL = () => '/api-feature-flags/';
export const makeGetFacilityClaimsURL = () => '/api/facility-claims/';
export const makeGetFacilityClaimByClaimIDURL = claimID => `/api/facility-claims/${claimID}/`;
export const makeApproveFacilityClaimByClaimIDURL = claimID => `/api/facility-claims/${claimID}/approve/`;
export const makeDenyFacilityClaimByClaimIDURL = claimID => `/api/facility-claims/${claimID}/deny/`;
export const makeRevokeFacilityClaimByClaimIDURL = claimID => `/api/facility-claims/${claimID}/revoke/`;
export const makeAddNewFacilityClaimReviewNoteURL = claimID => `/api/facility-claims/${claimID}/note/`;

export const makeGetOrUpdateApprovedFacilityClaimURL = claimID => `/api/facility-claims/${claimID}/claimed/`;
export const makeParentCompanyOptionsAPIURL = () => '/api/facility-claims/parent-company-options/';
export const makeGetClaimedFacilitiesURL = () => '/api/facilities/claimed/';
export const makeClaimedFacilityDetailsLink = claimID => `/claimed/${claimID}/`;

const clientInfoURL = 'https://api.ipgeolocation.io/ipgeo?fields=country_code2';
// NOTE: We only use an API key for ipgeolocation.io in development. On staging
// and production we use request origin validation so that we don't have to
// expose an API key
export const makeGetClientInfoURL = () => {
    const clientInfoURLSuffix = !env('ENVIRONMENT') || env('ENVIRONMENT') === 'development'
        ? `&apiKey=${env('REACT_APP_IPGEOLOCATION_API_KEY')}`
        : '';
    return `${clientInfoURL}${clientInfoURLSuffix}`;
};

export const makeLogDownloadUrl = (path, recordCount) => `/api/log-download/?path=${path}&record_count=${recordCount}`;

export const makeUpdateFacilityLocationURL = oarID => `/api/facilities/${oarID}/update-location/`;

export const getValueFromObject = ({ value }) => value;

const createCompactSortedQuerystringInputObject = (inputObject = []) =>
    compact(inputObject.map(getValueFromObject).slice().sort());

export const createQueryStringFromSearchFilters = ({
    facilityFreeTextQuery = '',
    contributors = [],
    contributorTypes = [],
    countries = [],
}) => {
    const inputForQueryString = Object.freeze({
        q: facilityFreeTextQuery,
        contributors: createCompactSortedQuerystringInputObject(contributors),
        contributor_types: createCompactSortedQuerystringInputObject(contributorTypes),
        countries: createCompactSortedQuerystringInputObject(countries),
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
        q: facilityFreeTextQuery = '',
        contributors = [],
        contributor_types: contributorTypes = [],
        countries = [],
    } = querystring.parse(qsToParse);

    return Object.freeze({
        facilityFreeTextQuery,
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

export const createParamsFromQueryString = (qs) => {
    const qsToParse = startsWith(qs, '?')
        ? qs.slice(1)
        : qs;

    const {
        search,
        status,
    } = querystring.parse(qsToParse);

    const params = {};

    if (status) {
        params.status = Array.isArray(status) ? status : [status];
    }

    if (search) {
        params.search = search;
    }

    return params;
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

export const getContributorFromQueryString = (qs) => {
    const qsToParse = startsWith(qs, '?')
        ? qs.slice(1)
        : qs;

    const {
        contributor = null,
    } = querystring.parse(qsToParse);

    return parseInt(contributor, 10);
};

export const createTileURLWithQueryString = (qs, key, grid = true) =>
    `/tile/${grid ? 'facilitygrid' : 'facilities'}/${key}/{z}/{x}/{y}.pbf`.concat(
        isEmpty(qs) ? '' : `?${qs}`,
    );

export const createTileCacheKeyWithEncodedFilters = (filters, key) =>
    `${key}-${hash(filters).slice(0, 8)}`;

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

export const getIDFromEvent = ({ target: { id } }) => id;

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

export const makeClaimFacilityLink = oarID => `${facilitiesRoute}/${oarID}/claim`;

export const makeApprovedClaimDetailsLink = claimID => `/claimed/${claimID}`;

export const makeFacilityClaimDetailsLink = claimID => `/dashboard/claims/${claimID}`;

export const makeDashboardContributorListLink = contributorID => `/dashboard/lists/?contributor=${contributorID}`;

export const makeProfileRouteLink = userID => `/profile/${userID}`;

export const getBBoxForArrayOfGeoJSONPoints = flow(
    featureCollection,
    bbox,
);

export const makeFacilityListItemsDetailLink = id => `/lists/${id}`;
export const makePaginatedFacilityListItemsDetailLinkWithRowCount = (
    id, page, rowsPerPage, params,
) =>
    `/lists/${id}?${querystring.stringify(Object.assign({}, params, { page, rowsPerPage }))}`;

export const makeSliceArgumentsForTablePagination = (page, rowsPerPage) => Object.freeze([
    page * rowsPerPage,
    (page + 1) * rowsPerPage,
]);

export const makeReportADataIssueEmailLink = oarId =>
    `mailto:info@openapparel.org?subject=Reporting a data issue on ID ${oarId}`;

export const makeDisputeClaimEmailLink = oarId =>
    `mailto:info@openapparel.org?subject=Disputing a claim of facility ID ${oarId}`;

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

export const createRemoveFacilityListItemURL = listID =>
    `/api/facility-lists/${listID}/remove/`;

export const makeMyFacilitiesRoute = contributorID =>
    `/facilities/?contributors=${contributorID}`;

export const makeResetPasswordEmailURL = () =>
    '/rest-auth/password/reset/';

export const makeResetPasswordConfirmURL = () =>
    '/rest-auth/password/reset/confirm/';

export const makeUserProfileURL = userID => `/user-profile/${userID}/`;

export const escapeCSVValue = value =>
    replace(replace(value, /"/g, '""'), /\n/g, ' ');

export const joinDataIntoCSVString = data => data
    .reduce((csvAccumulator, nextRow) => {
        const joinedColumns = nextRow
            .reduce((rowAccumulator, nextColumn) => {
                if (isNumber(nextColumn)) {
                    return rowAccumulator.concat(nextColumn, ',');
                }

                return rowAccumulator.concat(
                    '' + '"' + escapeCSVValue(nextColumn) + '"', // eslint-disable-line
                    ',',
                );
            }, '');

        return csvAccumulator.concat(
            trimEnd(joinedColumns, ','),
            '\n',
        );
    }, '');

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

export const makeSubmitFormOnEnterKeyPressFunction = fn => ({ key }) => {
    if (key === ENTER_KEY) {
        return fn();
    }

    return noop();
};

export const makeFacilityListItemsRetrieveCSVItemsURL = (id, page) =>
    `${makeSingleFacilityListItemsURL(id)}?page=${page}&pageSize=100`;

export const makeFacilityListDataURLs = (id, count) => {
    const maxCount = toInteger(ceil(count, -2) / 100);

    return range(1, maxCount + 1)
        .map(page => makeFacilityListItemsRetrieveCSVItemsURL(id, page));
};

export const makeFacilityListSummaryStatus = (statuses) => {
    const errorMessage = facilityListItemErrorStatuses.some(s => statuses.includes(s)) ?
        facilityListSummaryStatusMessages.ERROR : '';
    const awaitingMessage = [
        facilityListItemStatusChoicesEnum.POTENTIAL_MATCH,
    ].some(s => statuses.includes(s)) ?
        facilityListSummaryStatusMessages.AWAITING : '';
    const processingMessage = statuses.some(s => [
        facilityListItemStatusChoicesEnum.UPLOADED,
        facilityListItemStatusChoicesEnum.PARSED,
        facilityListItemStatusChoicesEnum.GEOCODED,
        facilityListItemStatusChoicesEnum.GEOCODED_NO_RESULTS,
    ].includes(s)) ?
        facilityListSummaryStatusMessages.PROCESSING : '';
    const completeMessage = statuses.every(s => [
        facilityListItemStatusChoicesEnum.MATCHED,
        facilityListItemStatusChoicesEnum.CONFIRMED_MATCH,
    ].includes(s)) ?
        facilityListSummaryStatusMessages.COMPLETED : '';

    return `${completeMessage}
            ${processingMessage}
            ${awaitingMessage}
            ${errorMessage}`.replace(/\s+/g, ' ').trim();
};

export const addProtocolToWebsiteURLIfMissing = (url) => {
    if (startsWith(url, 'http://')) {
        return url;
    }

    if (startsWith(url, 'https://')) {
        return url;
    }

    return `http://${url}`;
};

export const convertFeatureFlagsObjectToListOfActiveFlags = featureFlags =>
    keys(pickBy(featureFlags, identity));

export const checkWhetherUserHasDashboardAccess = user => get(user, 'is_superuser', false);

export const claimAFacilityFormIsValid = ({
    email,
    companyName,
    contactPerson,
    phoneNumber,
    preferredContactMethod,
}) => every([
    isEmail(email),
    !isEmpty(companyName),
    !isEmpty(contactPerson),
    !isEmpty(phoneNumber),
    !isEmpty(preferredContactMethod),
], identity);

export const claimFacilityContactInfoStepIsValid = ({
    email,
    contactPerson,
    phoneNumber,
    jobTitle,
}) => every([
    isEmail(email),
    !isEmpty(contactPerson),
    !isEmpty(phoneNumber),
    !isEmpty(jobTitle),
]);

export const isValidFacilityURL = url => isEmpty(url) || isURL(url, { protocols: ['http', 'https'] });

export const claimFacilityFacilityInfoStepIsValid = ({
    companyName,
    website,
    facilityDescription,
}) => every([
    !isEmpty(companyName),
    isValidFacilityURL(website),
    !isEmpty(facilityDescription),
]);

export const anyListItemMatchesAreInactive = ({ matches }) => some(matches, ['is_active', false]);

export const pluralizeResultsCount = (count) => {
    if (isNil(count)) {
        return null;
    }

    if (count === 1) {
        return '1 result';
    }

    return `${count} results`;
};

export const removeDuplicatesFromOtherLocationsData = otherLocationsData => uniqWith(
    otherLocationsData,
    (location, otherLocation) => {
        const lat = get(location, 'lat', null);
        const lng = get(location, 'lng', null);
        const id = get(location, 'contributor_id', null);

        const otherLat = get(otherLocation, 'lat', null);
        const otherLng = get(otherLocation, 'lng', null);
        const otherID = get(otherLocation, 'contributor_id', null);

        if (lat !== otherLat || lng !== otherLng) {
            return false;
        }

        if ((!id && otherID) || (id && !otherID)) {
            return true;
        }

        if (id === otherID) {
            return true;
        }

        return false;
    },
);
