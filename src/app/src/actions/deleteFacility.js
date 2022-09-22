import { createAction } from 'redux-act';
import get from 'lodash/get';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeGetFacilityByOSIdURL,
} from '../util/util';

export const startFetchFacilityToDelete = createAction(
    'START_FETCH_FACILITY_TO_DELETE',
);
export const failFetchFacilityToDelete = createAction(
    'FAIL_FETCH_FACILITY_TO_DELETE',
);
export const completeFetchFacilityToDelete = createAction(
    'COMPLETE_FETCH_FACILITY_TO_DELETE',
);
export const clearFacilityToDelete = createAction('CLEAR_FACILITY_TO_DELETE');
export const updateFacilityToDeleteOSID = createAction(
    'UPDATE_FACILITY_TO_DELETE_OS_ID',
);

export function fetchFacilityToDelete() {
    return (dispatch, getState) => {
        const {
            deleteFacility: {
                facility: { osID },
            },
        } = getState();

        if (!osID) {
            return null;
        }

        dispatch(startFetchFacilityToDelete());

        return apiRequest
            .get(makeGetFacilityByOSIdURL(osID))
            .then(({ data }) => dispatch(completeFetchFacilityToDelete(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchFacilityToDelete,
                    ),
                ),
            );
    };
}

export const startDeleteFacility = createAction('START_DELETE_FACILITY');
export const failDeleteFacility = createAction('FAIL_DELETE_FACILITY');
export const completeDeleteFacility = createAction('COMPLETE_DELETE_FACILITY');
export const resetDeleteFacilityState = createAction(
    'RESET_DELETE_FACILITY_STATE',
);

export function deleteFacility() {
    return (dispatch, getState) => {
        const {
            deleteFacility: {
                facility: { data: facilityToDeleteData },
            },
        } = getState();

        dispatch(startDeleteFacility());

        const osID = get(facilityToDeleteData, 'id', null);

        if (!osID) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'An error prevented deleting that facility',
                    failDeleteFacility,
                ),
            );
        }

        return apiRequest
            .delete(makeGetFacilityByOSIdURL(osID))
            .then(() => dispatch(completeDeleteFacility()))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented deleting that facility',
                        failDeleteFacility,
                    ),
                ),
            );
    };
}
