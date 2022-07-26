import { createAction } from 'redux-act';
import querystring from 'querystring';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeGetContributorsURL,
    makeGetListsURL,
    makeGetContributorTypesURL,
    makeGetCountriesURL,
    makeGetSectorsURL,
    makeGetParentCompaniesURL,
    makeGetFacilitiesTypeProcessingTypeURL,
    makeGetNumberOfWorkersURL,
    mapDjangoChoiceTuplesToSelectOptions,
    mapDjangoChoiceTuplesValueToSelectOptions,
    updateListWithLabels,
} from '../util/util';

import { updateListFilter } from './filters';

export const startFetchContributorOptions = createAction(
    'START_FETCH_CONTRIBUTOR_OPTIONS',
);
export const failFetchContributorOptions = createAction(
    'FAIL_FETCH_CONTRIBUTOR_OPTIONS',
);
export const completeFetchContributorOptions = createAction(
    'COMPLETE_FETCH_CONTRIBUTOR_OPTIONS',
);

export const startFetchListOptions = createAction('START_FETCH_LIST_OPTIONS');
export const failFetchListOptions = createAction('FAIL_FETCH_LIST_OPTIONS');
export const completeFetchListOptions = createAction(
    'COMPLETE_FETCH_LIST_OPTIONS',
);

export const startFetchContributorTypeOptions = createAction(
    'START_FETCH_CONTRIBUTOR_TYPE_OPTIONS',
);
export const failFetchContributorTypeOptions = createAction(
    'FAIL_FETCH_CONTRIBUTOR_TYPE_OPTIONS',
);
export const completeFetchContributorTypeOptions = createAction(
    'COMPLETE_FETCH_CONTRIBUTOR_TYPE_OPTIONS',
);

export const startFetchCountryOptions = createAction(
    'START_FETCH_COUNTRY_OPTIONS',
);
export const failFetchCountryOptions = createAction(
    'FAIL_FETCH_COUNTRY_OPTIONS',
);
export const completeFetchCountryOptions = createAction(
    'COMPLETE_FETCH_COUNTRY_OPTIONS',
);

export const startFetchSectorOptions = createAction(
    'START_FETCH_SECTOR_OPTIONS',
);
export const failFetchSectorOptions = createAction('FAIL_FETCH_SECTOR_OPTIONS');
export const completeFetchSectorOptions = createAction(
    'COMPLETE_FETCH_SECTOR_OPTIONS',
);

export const startFetchParentCompanyOptions = createAction(
    'START_FETCH_PARENT_COMPANY_OPTIONS',
);
export const failFetchParentCompanyOptions = createAction(
    'FAIL_FETCH_PARENT_COMPANY_OPTIONS',
);
export const completeFetchParentCompanyOptions = createAction(
    'COMPLETE_FETCH_PARENT_COMPANY_OPTIONS',
);

export const startFetchFacilityProcessingTypeOptions = createAction(
    'START_FETCH_FACILITY_PROCESSING_TYPE_OPTIONS',
);
export const failFetchFacilityProcessingTypeOptions = createAction(
    'FAIL_FETCH_FACILITY_PROCESSING_TYPE_OPTIONS',
);
export const completeFetchFacilityProcessingTypeOptions = createAction(
    'COMPLETE_FETCH_FACILITY_PROCESSING_TYPE_OPTIONS',
);

export const startFetchNumberOfWorkersOptions = createAction(
    'START_FETCH_NUMBER_OF_WORKERS_TYPE_OPTIONS',
);
export const failFetchNumberOfWorkersOptions = createAction(
    'FAIL_FETCH_NUMBER_OF_WORKERS_TYPE_OPTIONS',
);
export const completeFetchNumberOfWorkersTypeOptions = createAction(
    'COMPLETE_FETCH_NUMBER_OF_WORKERS_TYPE_OPTIONS',
);

export const resetFilterOptions = createAction('RESET_FILTER_OPTIONS');

export function fetchContributorOptions() {
    return dispatch => {
        dispatch(startFetchContributorOptions());

        return apiRequest
            .get(makeGetContributorsURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => dispatch(completeFetchContributorOptions(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching contributor options',
                        failFetchContributorOptions,
                    ),
                ),
            );
    };
}

export function fetchListOptions() {
    return (dispatch, getState) => {
        const { filters } = getState();
        dispatch(startFetchListOptions());

        const url = makeGetListsURL();
        const qs = `?${querystring.stringify({
            contributors: filters.contributors.map(c => c.value),
        })}`;

        return apiRequest
            .get(`${url}${qs}`)
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => {
                dispatch(completeFetchListOptions(data));

                const payload = updateListWithLabels(filters.lists, data);

                return dispatch(updateListFilter(payload));
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching list options',
                        failFetchListOptions,
                    ),
                ),
            );
    };
}

export function fetchContributorTypeOptions() {
    return dispatch => {
        dispatch(startFetchContributorTypeOptions());

        return apiRequest
            .get(makeGetContributorTypesURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => dispatch(completeFetchContributorTypeOptions(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching contributor type options',
                        failFetchContributorTypeOptions,
                    ),
                ),
            );
    };
}

export function fetchCountryOptions() {
    return dispatch => {
        dispatch(startFetchCountryOptions());

        return apiRequest
            .get(makeGetCountriesURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => dispatch(completeFetchCountryOptions(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching country options',
                        failFetchCountryOptions,
                    ),
                ),
            );
    };
}

export function fetchSectorOptions() {
    return dispatch => {
        dispatch(startFetchSectorOptions());

        return apiRequest
            .get(makeGetSectorsURL())
            .then(({ data }) => mapDjangoChoiceTuplesValueToSelectOptions(data))
            .then(data => dispatch(completeFetchSectorOptions(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching sector options',
                        failFetchSectorOptions,
                    ),
                ),
            );
    };
}

export function fetchParentCompanyOptions() {
    return dispatch => {
        dispatch(startFetchParentCompanyOptions());

        return apiRequest
            .get(makeGetParentCompaniesURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => dispatch(completeFetchParentCompanyOptions(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching parent company options',
                        failFetchParentCompanyOptions,
                    ),
                ),
            );
    };
}

export function fetchFacilityProcessingTypeOptions() {
    return dispatch => {
        dispatch(startFetchFacilityProcessingTypeOptions());

        return apiRequest
            .get(makeGetFacilitiesTypeProcessingTypeURL())
            .then(({ data }) => {
                dispatch(completeFetchFacilityProcessingTypeOptions(data));
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching facility processing type options',
                        failFetchFacilityProcessingTypeOptions,
                    ),
                ),
            );
    };
}

export function fetchNumberOfWorkersOptions() {
    return dispatch => {
        dispatch(startFetchNumberOfWorkersOptions());

        return apiRequest
            .get(makeGetNumberOfWorkersURL())
            .then(({ data }) => mapDjangoChoiceTuplesValueToSelectOptions(data))
            .then(data => {
                dispatch(completeFetchNumberOfWorkersTypeOptions(data));
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching number of workers options',
                        failFetchNumberOfWorkersOptions,
                    ),
                ),
            );
    };
}

export function fetchAllPrimaryFilterOptions() {
    return dispatch => {
        dispatch(fetchContributorOptions());
        dispatch(fetchCountryOptions());
        dispatch(fetchListOptions());
    };
}
