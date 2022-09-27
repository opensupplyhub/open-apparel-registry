import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeSplitFacilityAPIURL,
    makePromoteFacilityMatchAPIURL,
    makeTransferFacilityAPIURL,
} from '../util/util';

export const startFetchFacilityToAdjust = createAction(
    'START_FETCH_FACILITY_TO_ADJUST',
);
export const failFetchFacilityToAdjust = createAction(
    'FAIL_FETCH_FACILITY_TO_ADJUST',
);
export const completeFetchFacilityToAdjust = createAction(
    'COMPLETE_FETCH_FACILITY_TO_ADJUST',
);
export const clearFacilityToAdjust = createAction('CLEAR_FACILITY_TO_ADJUST');
export const resetAdjustFacilityState = createAction(
    'RESET_ADJUST_FACILITY_STATE',
);
export const updateFacilityToAdjustOSID = createAction(
    'UPDATE_FACILITY_TO_ADJUST_OS_ID',
);

export function fetchFacilityToAdjust() {
    return (dispatch, getState) => {
        const {
            adjustFacilityMatches: {
                facility: { osID },
            },
        } = getState();

        if (!osID) {
            return null;
        }

        dispatch(startFetchFacilityToAdjust());

        return apiRequest
            .get(makeSplitFacilityAPIURL(osID))
            .then(({ data }) => dispatch(completeFetchFacilityToAdjust(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchFacilityToAdjust,
                    ),
                ),
            );
    };
}

export const startFetchFacilityToTransfer = createAction(
    'START_FETCH_FACILITY_TO_TRANSFER',
);
export const failFetchFacilityToTransfer = createAction(
    'FAIL_FETCH_FACILITY_TO_TRANSFER',
);
export const completeFetchFacilityToTransfer = createAction(
    'COMPLETE_FETCH_FACILITY_TO_TRANSFER',
);
export const clearFacilityToTransfer = createAction(
    'CLEAR_FACILITY_TO_TRANSFER',
);
export function fetchFacilityToTransfer(osID) {
    return dispatch => {
        dispatch(startFetchFacilityToTransfer());

        return apiRequest
            .get(makeSplitFacilityAPIURL(osID))
            .then(({ data }) => dispatch(completeFetchFacilityToTransfer(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchFacilityToTransfer,
                    ),
                ),
            );
    };
}

export const startSplitFacilityMatch = createAction(
    'START_SPLIT_FACILITY_MATCH',
);
export const failSplitFacilityMatch = createAction('FAIL_SPLIT_FACILITY_MATCH');
export const completeSplitFacilityMatch = createAction(
    'COMPLETE_SPLIT_FACILITY_MATCH',
);

export function splitFacilityMatch(matchID) {
    return (dispatch, getState) => {
        const {
            adjustFacilityMatches: {
                facility: { osID },
            },
        } = getState();

        if (!osID || !matchID) {
            return null;
        }

        dispatch(startSplitFacilityMatch());

        return apiRequest
            .post(makeSplitFacilityAPIURL(osID), { match_id: matchID })
            .then(({ data }) => dispatch(completeSplitFacilityMatch(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented splitting that facility match',
                        failSplitFacilityMatch,
                    ),
                ),
            );
    };
}

export const startPromoteFacilityMatch = createAction(
    'START_PROMOTE_FACILITY_MATCH',
);
export const failPromoteFacilityMatch = createAction(
    'FAIL_PROMOTE_FACILITY_MATCH',
);
export const completePromoteFacilityMatch = createAction(
    'COMPLETE_PROMOTE_FACILITY_MATCH',
);

export function promoteFacilityMatch(matchID) {
    return (dispatch, getState) => {
        const {
            adjustFacilityMatches: {
                facility: { osID },
            },
        } = getState();

        if (!osID || !matchID) {
            return null;
        }

        dispatch(startPromoteFacilityMatch());

        return apiRequest
            .post(makePromoteFacilityMatchAPIURL(osID), { match_id: matchID })
            .then(({ data }) => dispatch(completePromoteFacilityMatch(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented promoting that facility match',
                        failPromoteFacilityMatch,
                    ),
                ),
            );
    };
}

export const startTransferFacilityMatch = createAction(
    'START_TRANSFER_FACILITY_MATCH',
);
export const failTransferFacilityMatch = createAction(
    'FAIL_TRANSFER_FACILITY_MATCH',
);
export const completeTransferFacilityMatch = createAction(
    'COMPLETE_TRANSFER_FACILITY_MATCH',
);

export function transferFacilityMatch({ matchID, osID }) {
    return dispatch => {
        if (!osID || !matchID) {
            return null;
        }

        dispatch(startTransferFacilityMatch());

        return apiRequest
            .post(makeTransferFacilityAPIURL(osID), { match_id: matchID })
            .then(({ data }) => {
                dispatch(completeTransferFacilityMatch(data));
                // Refresh facility to show match is no longer present
                dispatch(fetchFacilityToAdjust());
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented moving that facility match',
                        failTransferFacilityMatch,
                    ),
                ),
            );
    };
}
