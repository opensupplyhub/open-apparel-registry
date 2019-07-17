import { createAction } from 'redux-act';
import get from 'lodash/get';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeGetFacilityByOARIdURL,
} from '../util/util';

export const startFetchFacilityToDelete = createAction('START_FETCH_FACILITY_TO_DELETE');
export const failFetchFacilityToDelete = createAction('FAIL_FETCH_FACILITY_TO_DELETE');
export const completeFetchFacilityToDelete = createAction('COMPLETE_FETCH_FACILITY_TO_DELETE');
export const clearFacilityToDelete = createAction('CLEAR_FACILITY_TO_DELETE');
export const updateFacilityToDeleteOARID = createAction('UPDATE_FACILITY_TO_DELETE_OAR_ID');

export function fetchFacilityToDelete() {
    return (dispatch, getState) => {
        const {
            deleteFacility: {
                facility: {
                    oarID,
                },
            },
        } = getState();

        if (!oarID) {
            return null;
        }

        dispatch(startFetchFacilityToDelete());

        return apiRequest
            .get(makeGetFacilityByOARIdURL(oarID))
            .then(({ data }) => dispatch(completeFetchFacilityToDelete(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching that facility',
                failFetchFacilityToDelete,
            )));
    };
}

export const startDeleteFacility = createAction('START_DELETE_FACILITY');
export const failDeleteFacility = createAction('FAIL_DELETE_FACILITY');
export const completeDeleteFacility = createAction('COMPLETE_DELETE_FACILITY');
export const resetDeleteFacilityState = createAction('RESET_DELETE_FACILITY_STATE');

export function deleteFacility() {
    return (dispatch, getState) => {
        const {
            deleteFacility: {
                facility: {
                    data: facilityToDeleteData,
                },
            },
        } = getState();

        dispatch(startDeleteFacility());

        const oarID = get(facilityToDeleteData, 'id', null);

        if (!oarID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'An error prevented deleting that facility',
                failDeleteFacility,
            ));
        }

        return apiRequest
            .delete(makeGetFacilityByOARIdURL(oarID))
            .then(() => dispatch(completeDeleteFacility()))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented deleting that facility',
                failDeleteFacility,
            )));
    };
}
