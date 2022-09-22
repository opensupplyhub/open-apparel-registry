import { createAction } from 'redux-act';

import get from 'lodash/get';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeGetFacilityByOSIdURL,
    makeUpdateFacilityLocationURL,
    makeGetContributorsURL,
    mapDjangoChoiceTuplesToSelectOptions,
} from '../util/util';

export const startFetchUpdateLocationFacility = createAction(
    'START_FETCH_UPDATE_LOCATION_FACILITY',
);
export const failFetchUpdateLocationFacility = createAction(
    'FAIL_FETCH_UPDATE_LOCATION_FACILITY',
);
export const completeFetchUpdateLocationFacility = createAction(
    'COMPLETE_FETCH_UPDATE_LOCATION_FACILITY',
);
export const clearUpdateLocationFacility = createAction(
    'CLEAR_UPDATE_LOCATION_FACILITY',
);
export const updateUpdateLocationFacilityOSID = createAction(
    'UPDATE_UPDATE_LOCATION_FACILITY_OS_ID',
);
export const updateUpdateLocationLat = createAction(
    'UPDATE_UPDATE_LOCATION_LAT',
);
export const updateUpdateLocationLng = createAction(
    'UPDATE_UPDATE_LOCATION_LNG',
);
export const updateUpdateLocationNotes = createAction(
    'UPDATE_UPDATE_LOCATION_NOTES',
);
export const updateUpdateLocationContributor = createAction(
    'UPDATE_UPDATE_LOCATION_CONTRIBUTOR',
);

export function fetchUpdateLocationFacility() {
    return (dispatch, getState) => {
        const {
            updateFacilityLocation: { osID },
        } = getState();

        if (!osID) {
            return null;
        }

        dispatch(startFetchUpdateLocationFacility());

        return apiRequest
            .get(makeGetFacilityByOSIdURL(osID))
            .then(({ data }) =>
                dispatch(completeFetchUpdateLocationFacility(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchUpdateLocationFacility,
                    ),
                ),
            );
    };
}

export const startUpdateFacilityLocation = createAction(
    'START_UPDATE_FACILITY_LOCATION',
);
export const failUpdateFacilityLocation = createAction(
    'FAIL_UPDATE_FACILITY_LOCATION',
);
export const completeUpdateFacilityLocation = createAction(
    'COMPLETE_UPDATE_FACILITY_LOCATION',
);

export function updateFacilityLocation() {
    return (dispatch, getState) => {
        const {
            updateFacilityLocation: {
                osID,
                newLocation: { lat, lng },
                notes,
                contributor,
            },
        } = getState();

        dispatch(startUpdateFacilityLocation());

        return apiRequest
            .post(makeUpdateFacilityLocationURL(osID), {
                lat,
                lng,
                notes: notes || undefined,
                contributor_id: get(contributor, 'value', undefined),
            })
            .then(({ data }) => dispatch(completeUpdateFacilityLocation(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented updating the facility location',
                        failUpdateFacilityLocation,
                    ),
                ),
            );
    };
}

export const startFetchDashboardUpdateLocationContributors = createAction(
    'START_FETCH_DASHBOARD_UPDATE_LOCATION_CONTRIBUTORS',
);
export const failFetchDashboardUpdateLocationContributors = createAction(
    'FAIL_FETCH_DASHBOARD_UPDATE_LOCATION_CONTRIBUTORS',
);
export const completeFetchDashboardUpdateLocationContributors = createAction(
    'COMPLETE_FETCH_DASHBOARD_UPDATE_LOCATION_CONTRIBUTORS',
);

export function fetchDashboardUpdateLocationContributors() {
    return dispatch => {
        dispatch(startFetchDashboardUpdateLocationContributors());

        return apiRequest
            .get(makeGetContributorsURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data =>
                dispatch(
                    completeFetchDashboardUpdateLocationContributors(data),
                ),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching dashboard update location contributors',
                        failFetchDashboardUpdateLocationContributors,
                    ),
                ),
            );
    };
}
