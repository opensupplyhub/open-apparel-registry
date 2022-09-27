import { createAction } from 'redux-act';
import get from 'lodash/get';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeGetFacilityByOSIdURL,
    makeMergeTwoFacilitiesAPIURL,
} from '../util/util';

export const startFetchMergeTargetFacility = createAction(
    'START_FETCH_MERGE_TARGET_FACILITY',
);
export const failFetchMergeTargetFacility = createAction(
    'FAIL_FETCH_MERGE_TARGET_FACILITY',
);
export const completeFetchMergeTargetFacility = createAction(
    'COMPLETE_FETCH_MERGE_TARGET_FACILITY',
);
export const clearMergeTargetFacility = createAction(
    'CLEAR_MERGE_TARGET_FACILITY',
);
export const updateMergeTargetFacilityOSID = createAction(
    'UPDATE_MERGE_TARGET_FACILITY_OS_ID',
);

export function fetchMergeTargetFacility() {
    return (dispatch, getState) => {
        const {
            mergeFacilities: {
                targetFacility: { osID },
                facilityToMerge: { data: toMergeData },
            },
        } = getState();

        if (!osID) {
            return null;
        }

        dispatch(startFetchMergeTargetFacility());

        const toMergeOSID = get(toMergeData, 'id', null);

        if (osID === toMergeOSID) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'That facility has already been added as the facility to merge.',
                    failFetchMergeTargetFacility,
                ),
            );
        }

        return apiRequest
            .get(makeGetFacilityByOSIdURL(osID))
            .then(({ data }) =>
                dispatch(completeFetchMergeTargetFacility(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchMergeTargetFacility,
                    ),
                ),
            );
    };
}

export const startFetchFacilityToMerge = createAction(
    'START_FETCH_FACILITY_TO_MERGE',
);
export const failFetchFacilityToMerge = createAction(
    'FAIL_FETCH_FACILITY_TO_MERGE',
);
export const completeFetchFacilityToMerge = createAction(
    'COMPLETE_FETCH_FACILITY_TO_MERGE',
);
export const clearFacilityToMerge = createAction('CLEAR_FACILITY_TO_MERGE');
export const updateFacilityToMergeOSID = createAction(
    'UPDATE_FACILITY_TO_MERGE_OS_ID',
);

export function fetchFacilityToMerge() {
    return (dispatch, getState) => {
        const {
            mergeFacilities: {
                facilityToMerge: { osID },
                targetFacility: { data: targetData },
            },
        } = getState();

        if (!osID) {
            return null;
        }

        dispatch(startFetchFacilityToMerge());

        const targetOSID = get(targetData, 'id', null);

        if (osID === targetOSID) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'That facility has already been added as the target facility.',
                    failFetchFacilityToMerge,
                ),
            );
        }

        return apiRequest
            .get(makeGetFacilityByOSIdURL(osID))
            .then(({ data }) => dispatch(completeFetchFacilityToMerge(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchFacilityToMerge,
                    ),
                ),
            );
    };
}

export const startMergeFacilities = createAction('START_MERGE_FACILITIES');
export const failMergeFacilities = createAction('FAIL_MERGE_FACILITIES');
export const completeMergeFacilities = createAction(
    'COMPLETE_MERGE_FACILITIES',
);
export const resetMergeFacilitiesState = createAction(
    'RESET_MERGE_FACILITIES_STATE',
);

export function mergeFacilities() {
    return (dispatch, getState) => {
        dispatch(startMergeFacilities());

        const {
            mergeFacilities: {
                targetFacility: { data: targetData },
                facilityToMerge: { data: toMergeData },
            },
        } = getState();

        const targetOSID = get(targetData, 'id', null);
        const toMergeOSID = get(toMergeData, 'id', null);

        if (!targetOSID || !toMergeOSID) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'Target facility and to merge facility are required',
                    failMergeFacilities,
                ),
            );
        }

        return apiRequest
            .post(makeMergeTwoFacilitiesAPIURL(targetOSID, toMergeOSID))
            .then(({ data }) => dispatch(completeMergeFacilities(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented merging those facilities',
                        failMergeFacilities,
                    ),
                ),
            );
    };
}

export const flipFacilitiesToMerge = createAction('FLIP_FACILITIES_TO_MERGE');
