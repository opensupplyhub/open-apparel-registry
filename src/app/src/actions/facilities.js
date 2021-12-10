import { createAction } from 'redux-act';
import noop from 'lodash/noop';
import get from 'lodash/get';

import apiRequest from '../util/apiRequest';

import { fetchCurrentTileCacheKey } from './vectorTileLayer';

import { FACILITIES_REQUEST_PAGE_SIZE } from '../util/constants';

import {
    logErrorAndDispatchFailure,
    makeGetFacilitiesURLWithQueryString,
    makeGetFacilityByOARIdURL,
    makeFacilityDetailLink,
    createQueryStringFromSearchFilters,
    makeGetFacilityByOARIdURLWithContributorId,
} from '../util/util';

import { makeSidebarFacilitiesTabActive } from './ui';

export const startFetchFacilities = createAction('START_FETCH_FACILITIES');
export const failFetchFacilities = createAction('FAIL_FETCH_FACILITIES');
export const completeFetchFacilities = createAction(
    'COMPLETE_FETCH_FACILITIES',
);
export const resetFacilities = createAction('RESET_FACILITIES');

export const startFetchSingleFacility = createAction(
    'START_FETCH_SINGLE_FACILITY',
);
export const failFetchSingleFacility = createAction(
    'FAIL_FETCH_SINGLE_FACILITY',
);
export const completeFetchSingleFacility = createAction(
    'COMPLETE_FETCH_SINGLE_FACILITY',
);
export const resetSingleFacility = createAction('RESET_SINGLE_FACILITY');

export function fetchFacilities({
    pageSize = FACILITIES_REQUEST_PAGE_SIZE,
    pushNewRoute = noop,
    activateFacilitiesTab = true,
}) {
    return (dispatch, getState) => {
        dispatch(fetchCurrentTileCacheKey());
        dispatch(startFetchFacilities());

        const {
            filters,
            embeddedMap: { embed },
        } = getState();

        const qs = createQueryStringFromSearchFilters(filters, embed);

        return apiRequest
            .get(makeGetFacilitiesURLWithQueryString(qs, pageSize))
            .then(({ data }) => {
                const responseHasOnlyOneFacility =
                    get(data, 'features', []).length === 1;

                if (responseHasOnlyOneFacility) {
                    const facilityID = get(data, 'features[0].id', null);

                    if (!facilityID) {
                        throw new Error('No facility ID was found');
                    }

                    pushNewRoute(makeFacilityDetailLink(facilityID));
                }
                return data;
            })
            .then(data => {
                dispatch(completeFetchFacilities(data));
                if (activateFacilitiesTab) {
                    dispatch(makeSidebarFacilitiesTabActive());
                }
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching facilities',
                        failFetchFacilities,
                    ),
                ),
            );
    };
}

export const startFetchNextPageOfFacilities = createAction(
    'START_FETCH_NEXT_PAGE_OF_FACILITIES',
);
export const failFetchNextPageOfFacilities = createAction(
    'FAIL_FETCH_NEXT_PAGE_OF_FACILITIES',
);
export const completeFetchNextPageOfFacilities = createAction(
    'COMPLETE_FETCH_NEXT_PAGE_OF_FACILITIES',
);

export function fetchNextPageOfFacilities() {
    return (dispatch, getState) => {
        const {
            facilities: {
                facilities: { nextPageURL },
            },
        } = getState();

        if (!nextPageURL) {
            return noop();
        }

        dispatch(startFetchNextPageOfFacilities());

        return apiRequest
            .get(nextPageURL)
            .then(({ data }) =>
                dispatch(completeFetchNextPageOfFacilities(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching the next page of facilities',
                        failFetchNextPageOfFacilities,
                    ),
                ),
            );
    };
}

export function fetchSingleFacility(
    oarID = null,
    embed = 0,
    contributors = null,
) {
    return dispatch => {
        dispatch(startFetchSingleFacility());

        if (!oarID) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'No OAR ID was provided',
                    failFetchSingleFacility,
                ),
            );
        }

        const fetchUrl = embed
            ? makeGetFacilityByOARIdURLWithContributorId(
                  oarID,
                  embed,
                  contributors[0].value,
              )
            : makeGetFacilityByOARIdURL(oarID);

        return apiRequest
            .get(fetchUrl)
            .then(({ data }) => dispatch(completeFetchSingleFacility(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchSingleFacility,
                    ),
                ),
            );
    };
}
