import { createAction } from 'redux-act';
import noop from 'lodash/noop';
import get from 'lodash/get';

import apiRequest from '../util/apiRequest';

import { fetchCurrentTileCacheKey } from './vectorTileLayer';

import {
    logErrorAndDispatchFailure,
    makeGetFacilitiesURLWithQueryString,
    makeGetFacilityByOARIdURL,
    makeFacilityDetailLink,
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

export function fetchFacilities(pushNewRoute = noop) {
    return (dispatch, getState) => {
        dispatch(fetchCurrentTileCacheKey());
        dispatch(startFetchFacilities());

        const {
            filters,
        } = getState();

        const qs = createQueryStringFromSearchFilters(filters);

        return apiRequest
            .get(makeGetFacilitiesURLWithQueryString(qs))
            .then(({ data }) => {
                const responseHasOnlyOneFacility = get(
                    data,
                    'features',
                    [],
                ).length === 1;

                if (responseHasOnlyOneFacility) {
                    const facilityID = get(data, 'features[0].id', null);

                    if (!facilityID) {
                        throw new Error('No facility ID was found');
                    }

                    pushNewRoute(makeFacilityDetailLink(facilityID));
                }

                return data;
            })
            .then(data => dispatch(completeFetchFacilities(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching facilities',
                failFetchFacilities,
            )));
    };
}

export function fetchSingleFacility(oarID = null) {
    return (dispatch) => {
        dispatch(startFetchSingleFacility());

        if (!oarID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'No OAR ID was provided',
                failFetchSingleFacility,
            ));
        }

        return apiRequest
            .get(makeGetFacilityByOARIdURL(oarID))
            .then(({ data }) => dispatch(completeFetchSingleFacility(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching that facility',
                failFetchSingleFacility,
            )));
    };
}
