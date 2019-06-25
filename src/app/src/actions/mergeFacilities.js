import { createAction } from 'redux-act';
import get from 'lodash/get';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeGetFacilityByOARIdURL,
    makeMergeTwoFacilitiesAPIURL,
} from '../util/util';

export const startFetchMergeTargetFacility =
    createAction('START_FETCH_MERGE_TARGET_FACILITY');
export const failFetchMergeTargetFacility =
    createAction('FAIL_FETCH_MERGE_TARGET_FACILITY');
export const completeFetchMergeTargetFacility =
    createAction('COMPLETE_FETCH_MERGE_TARGET_FACILITY');
export const clearMergeTargetFacility = createAction('CLEAR_MERGE_TARGET_FACILITY');
export const updateMergeTargetFacilityOARID =
    createAction('UPDATE_MERGE_TARGET_FACILITY_OAR_ID');

export function fetchMergeTargetFacility() {
    return (dispatch, getState) => {
        const {
            mergeFacilities: {
                targetFacility: {
                    oarID,
                },
                facilityToMerge: {
                    data: toMergeData,
                },
            },
        } = getState();

        if (!oarID) {
            return null;
        }

        dispatch(startFetchMergeTargetFacility());

        const toMergeOARID = get(toMergeData, 'id', null);

        if (oarID === toMergeOARID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'That facility has already been added as the facility to merge.',
                failFetchMergeTargetFacility,
            ));
        }

        return csrfRequest
            .get(makeGetFacilityByOARIdURL(oarID))
            .then(({ data }) => dispatch(completeFetchMergeTargetFacility(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching that facility',
                failFetchMergeTargetFacility,
            )));
    };
}

export const startFetchFacilityToMerge = createAction('START_FETCH_FACILITY_TO_MERGE');
export const failFetchFacilityToMerge = createAction('FAIL_FETCH_FACILITY_TO_MERGE');
export const completeFetchFacilityToMerge = createAction('COMPLETE_FETCH_FACILITY_TO_MERGE');
export const clearFacilityToMerge = createAction('CLEAR_FACILITY_TO_MERGE');
export const updateFacilityToMergeOARID = createAction('UPDATE_FACILITY_TO_MERGE_OAR_ID');

export function fetchFacilityToMerge() {
    return (dispatch, getState) => {
        const {
            mergeFacilities: {
                facilityToMerge: {
                    oarID,
                },
                targetFacility: {
                    data: targetData,
                },
            },
        } = getState();

        if (!oarID) {
            return null;
        }

        dispatch(startFetchFacilityToMerge());

        const targetOARID = get(targetData, 'id', null);

        if (oarID === targetOARID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'That facility has already been added as the target facility.',
                failFetchFacilityToMerge,
            ));
        }

        return csrfRequest
            .get(makeGetFacilityByOARIdURL(oarID))
            .then(({ data }) => dispatch(completeFetchFacilityToMerge(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching that facility',
                failFetchFacilityToMerge,
            )));
    };
}

export const startMergeFacilities = createAction('START_MERGE_FACILITIES');
export const failMergeFacilities = createAction('FAIL_MERGE_FACILITIES');
export const completeMergeFacilities = createAction('COMPLETE_MERGE_FACILITIES');
export const resetMergeFacilitiesState = createAction('RESET_MERGE_FACILITIES_STATE');

export function mergeFacilities() {
    return (dispatch, getState) => {
        dispatch(startMergeFacilities());

        const {
            mergeFacilities: {
                targetFacility: {
                    data: targetData,
                },
                facilityToMerge: {
                    data: toMergeData,
                },
            },
        } = getState();

        const targetOARID = get(targetData, 'id', null);
        const toMergeOARID = get(toMergeData, 'id', null);

        if (!targetOARID || !toMergeOARID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'Target facility and to merge facility are required',
                failMergeFacilities,
            ));
        }

        return csrfRequest
            .post(makeMergeTwoFacilitiesAPIURL(targetOARID, toMergeOARID))
            .then(({ data }) => dispatch(completeMergeFacilities(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented merging those facilities',
                failMergeFacilities,
            )));
    };
}

export const flipFacilitiesToMerge = createAction('FLIP_FACILITIES_TO_MERGE');
