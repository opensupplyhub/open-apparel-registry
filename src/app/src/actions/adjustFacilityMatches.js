import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeSplitFacilityAPIURL,
    makePromoteFacilityMatchAPIURL,
} from '../util/util';

export const startFetchFacilityToAdjust = createAction('START_FETCH_FACILITY_TO_ADJUST');
export const failFetchFacilityToAdjust = createAction('FAIL_FETCH_FACILITY_TO_ADJUST');
export const completeFetchFacilityToAdjust = createAction('COMPLETE_FETCH_FACILITY_TO_ADJUST');
export const clearFacilityToAdjust = createAction('CLEAR_FACILITY_TO_ADJUST');
export const resetAdjustFacilityState = createAction('RESET_ADJUST_FACILITY_STATE');
export const updateFacilityToAdjustOARID = createAction('UPDATE_FACILITY_TO_ADJUST_OAR_ID');

export function fetchFacilityToAdjust() {
    return (dispatch, getState) => {
        const {
            adjustFacilityMatches: {
                facility: {
                    oarID,
                },
            },
        } = getState();

        if (!oarID) {
            return null;
        }

        dispatch(startFetchFacilityToAdjust());

        return apiRequest
            .get(makeSplitFacilityAPIURL(oarID))
            .then(({ data }) => dispatch(completeFetchFacilityToAdjust(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching that facility',
                failFetchFacilityToAdjust,
            )));
    };
}

export const startSplitFacilityMatch = createAction('START_SPLIT_FACILITY_MATCH');
export const failSplitFacilityMatch = createAction('FAIL_SPLIT_FACILITY_MATCH');
export const completeSplitFacilityMatch = createAction('COMPLETE_SPLIT_FACILITY_MATCH');

export function splitFacilityMatch(matchID) {
    return (dispatch, getState) => {
        const {
            adjustFacilityMatches: {
                facility: {
                    oarID,
                },
            },
        } = getState();

        if (!oarID || !matchID) {
            return null;
        }

        dispatch(startSplitFacilityMatch());

        return apiRequest
            .post(makeSplitFacilityAPIURL(oarID), { match_id: matchID })
            .then(({ data }) => dispatch(completeSplitFacilityMatch(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented splitting that facility match',
                failSplitFacilityMatch,
            )));
    };
}

export const startPromoteFacilityMatch = createAction('START_PROMOTE_FACILITY_MATCH');
export const failPromoteFacilityMatch = createAction('FAIL_PROMOTE_FACILITY_MATCH');
export const completePromoteFacilityMatch = createAction('COMPLETE_PROMOTE_FACILITY_MATCH');

export function promoteFacilityMatch(matchID) {
    return (dispatch, getState) => {
        const {
            adjustFacilityMatches: {
                facility: {
                    oarID,
                },
            },
        } = getState();

        if (!oarID || !matchID) {
            return null;
        }

        dispatch(startPromoteFacilityMatch());

        return apiRequest
            .post(makePromoteFacilityMatchAPIURL(oarID), { match_id: matchID })
            .then(({ data }) => dispatch(completePromoteFacilityMatch(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented promoting that facility match',
                failPromoteFacilityMatch,
            )));
    };
}
