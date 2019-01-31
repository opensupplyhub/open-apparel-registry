import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeGetFacilitiesURLWithQueryString,
    createQueryStringFromSearchFilters,
} from '../util/util';

export const startFetchFacilities = createAction('START_FETCH_FACILITIES');
export const failFetchFacilities = createAction('FAIL_FETCH_FACILITIES');
export const completeFetchFacilities = createAction('COMPLETE_FETCH_FACILITIES');
export const resetFacilities = createAction('RESET_FACILITIES');

export const startFetchSingleFacility = createAction('START_FETCH_SINGLE_FACILITY');
export const failFetchSingleFacility = createAction('FAIL_FETCH_SINGLE_FACILITY');
export const completeFetchSingleFacility = createAction('COMPLETE_FETCH_SINGLE_FACILITY');
export const resetSingleFacility = createAction('RESET_SINGLE_FACILITY');

export function fetchFacilities() {
    return (dispatch, getState) => {
        dispatch(startFetchFacilities());

        const {
            filters,
        } = getState();

        const qs = createQueryStringFromSearchFilters(filters);

        return csrfRequest
            .get(makeGetFacilitiesURLWithQueryString(qs))
            .then(({ data }) => dispatch(completeFetchFacilities(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching facilities',
                failFetchFacilities,
            )));
    };
}

export function fetchSingleFacility(oarId = null) {
    return (dispatch, getState) => {
        dispatch(startFetchSingleFacility());

        if (!oarId) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'No OAR ID was provided',
                failFetchSingleFacility,
            ));
        }

        const {
            facilities: {
                facilities: {
                    data: facilitiesData,
                },
            },
        } = getState();

        const facilityFromExistingData = facilitiesData
            .find(({ id }) => id === oarId);

        if (facilityFromExistingData) {
            return dispatch(completeFetchSingleFacility(Object.freeze(facilityFromExistingData)));
        }

        return Promise
            .resolve({ data: {} })
            .then(({ data }) => dispatch(completeFetchSingleFacility(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching that facility',
                failFetchSingleFacility,
            )));
    };
}
