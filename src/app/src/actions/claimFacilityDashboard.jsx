import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    makeGetFacilityClaimsURL,
    logErrorAndDispatchFailure,
    makeGetFacilityClaimByClaimIDURL,
    makeApproveFacilityClaimByClaimIDURL,
    makeDenyFacilityClaimByClaimIDURL,
    makeRevokeFacilityClaimByClaimIDURL,
    makeAddNewFacilityClaimReviewNoteURL,
} from '../util/util';

export const startFetchFacilityClaims = createAction(
    'START_FETCH_FACILITY_CLAIMS',
);
export const failFetchFacilityClaims = createAction(
    'FAIL_FETCH_FACILITY_CLAIMS',
);
export const completeFetchFacilityClaims = createAction(
    'COMPLETE_FETCH_FACILITY_CLAIMS',
);
export const clearFacilityClaims = createAction('CLEAR_FACILITY_CLAIMS');

export function fetchFacilityClaims() {
    return dispatch => {
        dispatch(startFetchFacilityClaims());

        return apiRequest
            .get(makeGetFacilityClaimsURL())
            .then(({ data }) => dispatch(completeFetchFacilityClaims(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching facility claims',
                        failFetchFacilityClaims,
                    ),
                ),
            );
    };
}

export const startFetchSingleFacilityClaim = createAction(
    'START_FETCH_SINGLE_FACILITY_CLAIM',
);
export const failFetchSingleFacilityClaim = createAction(
    'FAIL_FETCH_SINGLE_FACILITY_CLAIM',
);
export const completeFetchSingleFacilityClaim = createAction(
    'COMPLETE_FETCH_SINGLE_FACILITY_CLAIM',
);
export const clearSingleFacilityClaim = createAction(
    'CLEAR_SINGLE_FACILITY_CLAIM',
);

export function fetchSingleFacilityClaim(claimID) {
    return dispatch => {
        if (!claimID) {
            return null;
        }

        dispatch(startFetchSingleFacilityClaim());

        return apiRequest
            .get(makeGetFacilityClaimByClaimIDURL(claimID))
            .then(({ data }) =>
                dispatch(completeFetchSingleFacilityClaim(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility claim',
                        failFetchSingleFacilityClaim,
                    ),
                ),
            );
    };
}

export const startApproveFacilityClaim = createAction(
    'START_APPROVE_FACILITY_CLAIM',
);
export const startDenyFacilityClaim = createAction('START_DENY_FACILITY_CLAIM');
export const startRevokeFacilityClaim = createAction(
    'START_REVOKE_FACILITY_CLAIM',
);
export const failApproveFacilityClaim = createAction(
    'FAIL_APPROVE_FACILITY_CLAIM',
);
export const failDenyFacilityClaim = createAction('FAIL_DENY_FACILITY_CLAIM');
export const failRevokeFacilityClaim = createAction(
    'FAIL_REVOKE_FACILITY_CLAIM',
);
export const completeApproveFacilityClaim = createAction(
    'COMPLETE_APPROVE_FACILITY_CLAIM',
);
export const completeDenyFacilityClaim = createAction(
    'COMPLETE_DENY_FACILITY_CLAIM',
);
export const completeRevokeFacilityClaim = createAction(
    'COMPLETE_REVOKE_FACILITY_CLAIM',
);
export const resetFacilityClaimControls = createAction(
    'RESET_FACILITY_CLAIM_CONTROLS',
);

export function approveFacilityClaim(claimID, reason = '') {
    return dispatch => {
        if (!claimID) {
            return null;
        }

        dispatch(startApproveFacilityClaim());

        return apiRequest
            .post(makeApproveFacilityClaimByClaimIDURL(claimID), { reason })
            .then(({ data }) => dispatch(completeApproveFacilityClaim(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented approving that facility claim',
                        failApproveFacilityClaim,
                    ),
                ),
            );
    };
}

export function denyFacilityClaim(claimID, reason = '') {
    return dispatch => {
        if (!claimID) {
            return null;
        }

        dispatch(startDenyFacilityClaim());

        return apiRequest
            .post(makeDenyFacilityClaimByClaimIDURL(claimID), { reason })
            .then(({ data }) => dispatch(completeDenyFacilityClaim(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented denying that facility claim',
                        failDenyFacilityClaim,
                    ),
                ),
            );
    };
}

export function revokeFacilityClaim(claimID, reason = '') {
    return dispatch => {
        if (!claimID) {
            return null;
        }

        dispatch(startRevokeFacilityClaim());

        return apiRequest
            .post(makeRevokeFacilityClaimByClaimIDURL(claimID), { reason })
            .then(({ data }) => dispatch(completeRevokeFacilityClaim(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented revoking that facility claim',
                        failRevokeFacilityClaim,
                    ),
                ),
            );
    };
}

export const startAddNewFacilityClaimReviewNote = createAction(
    'START_ADD_NEW_FACILITY_CLAIM_REVIEW_NOTE',
);
export const failAddNewFacilityClaimReviewNote = createAction(
    'FAIL_ADD_NEW_FACILITY_CLAIM_REVIEW_NOTE',
);
export const completeAddNewFacilityClaimReviewNote = createAction(
    'COMPLETE_ADD_NEW_FACILITY_CLAIM_REVIEW_NOTE',
);
export const clearFacilityClaimReviewNote = createAction(
    'CLEAR_FACILITY_CLAIM_REVIEW_NOTE',
);
export const updateFacilityClaimReviewNote = createAction(
    'UPDATE_FACILITY_CLAIM_REVIEW_NOTE',
);

export function addNewFacilityClaimReviewNote(claimID) {
    return (dispatch, getState) => {
        const {
            claimFacilityDashboard: {
                note: { note },
            },
        } = getState();

        if (!note || !claimID) {
            return null;
        }

        dispatch(startAddNewFacilityClaimReviewNote());

        return apiRequest
            .post(makeAddNewFacilityClaimReviewNoteURL(claimID), { note })
            .then(({ data }) =>
                dispatch(completeAddNewFacilityClaimReviewNote(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented adding that note',
                        failAddNewFacilityClaimReviewNote,
                    ),
                ),
            );
    };
}
