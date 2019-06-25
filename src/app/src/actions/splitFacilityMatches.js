import { createAction } from 'redux-act';
import random from 'lodash/random';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeSplitFacilityAPIURL,
} from '../util/util';

export const startFetchFacilityToSplit = createAction('START_FETCH_FACILITY_TO_SPLIT');
export const failFetchFacilityToSplit = createAction('FAIL_FETCH_FACILITY_TO_SPLIT');
export const completeFetchFacilityToSplit = createAction('COMPLETE_FETCH_FACILITY_TO_SPLIT');
export const clearFacilityToSplit = createAction('CLEAR_FACILITY_TO_SPLIT');
export const resetSplitFacilityState = createAction('RESET_CLEAR_FACILITY_STATE');
export const updateFacilityToSplitOARID = createAction('UPDATE_FACILITY_TO_SPLIT_OAR_ID');

export function fetchFacilityToSplit() {
    return (dispatch, getState) => {
        const {
            splitFacilityMatches: {
                facility: {
                    oarID,
                },
            },
        } = getState();

        if (!oarID) {
            return null;
        }

        dispatch(startFetchFacilityToSplit());

        return csrfRequest
            .get(makeSplitFacilityAPIURL(oarID))
            .then(({ data }) => dispatch(completeFetchFacilityToSplit(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching that facility',
                failFetchFacilityToSplit,
            )));
    };
}

export const startSplitFacilityMatch = createAction('START_SPLIT_FACILITY_MATCH');
export const failSplitFacilityMatch = createAction('FAIL_SPLIT_FACILITY_MATCH');
export const completeSplitFacilityMatch = createAction('COMPLETE_SPLIT_FACILITY_MATCH');

export function splitFacilityMatch(matchID) {
    return (dispatch, getState) => {
        const {
            splitFacilityMatches: {
                facility: {
                    oarID,
                },
            },
        } = getState();

        if (!oarID || !matchID) {
            return null;
        }

        dispatch(startSplitFacilityMatch());

        return Promise
            .resolve(({ data: Object.freeze({ matchID, newOARID: random(100000, 999999) }) }))
            .then(({ data }) => dispatch(completeSplitFacilityMatch(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented splitting that facility match',
                failSplitFacilityMatch,
            )));
    };
}
