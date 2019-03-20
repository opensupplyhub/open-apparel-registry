import { createAction } from 'redux-act';
import querystring from 'querystring';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeSingleFacilityListURL,
    makeSingleFacilityListItemsURL,
    createConfirmOrRejectMatchData,
    createConfirmFacilityListItemMatchURL,
    createRejectFacilityListItemMatchURL,
} from '../util/util';

export const setSelectedFacilityListItemsRowIndex =
    createAction('SET_SELECTED_FACILITY_LIST_ITEMS_ROW_INDEX');

export const startFetchFacilityList = createAction('START_FETCH_FACILITY_LIST');
export const failFetchFacilityList = createAction('FAIL_FETCH_FACILITY_LIST');
export const completeFetchFacilityList = createAction('COMPLETE_FETCH_FACILITY_LIST');
export const startFetchFacilityListItems = createAction('START_FETCH_FACILITY_LIST_ITEMS');
export const failFetchFacilityListItems = createAction('FAIL_FETCH_FACILITY_LIST_ITEMS');
export const completeFetchFacilityListItems = createAction('COMPLETE_FETCH_FACILITY_LIST_ITEMS');
export const resetFacilityListItems = createAction('RESET_FACILITY_LIST_ITEMS');

export const startConfirmFacilityListItemPotentialMatch =
    createAction('START_CONFIRM_FACILITY_LIST_ITEM_POTENTIAL_MATCH');
export const failConfirmFacilityListItemPotentialMatch =
    createAction('FAIL_CONFIRM_FACILITY_LIST_ITEM_POTENTIAL_MATCH');
export const completeConfirmFacilityListItemPotentialMatch =
    createAction('COMPLETE_CONFIRM_FACIILITY_LIST_ITEM_POTENTIAL_MATCH');

export const startRejectFacilityListItemPotentialMatch =
    createAction('START_REJECT_FACILITY_LIST_ITEM_POTENTIAL_MATCH');
export const failRejectFacilityListItemPotentialMatch =
    createAction('FAIL_REJECT_FACILITY_LIST_ITEM_POTENTIAL_MATCH');
export const completeRejectFacilityListItemPotentialMatch =
    createAction('COMPLETE_REJECT_FACILITY_LIST_ITEM_POTENTIAL_MATCH');

export function fetchFacilityList(listID = null) {
    return (dispatch) => {
        dispatch(startFetchFacilityList());

        if (!listID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'Missing required parameter list ID',
                failFetchFacilityList,
            ));
        }

        return csrfRequest
            .get(makeSingleFacilityListURL(listID))
            .then(({ data }) => dispatch(completeFetchFacilityList(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                `An error prevented fetching facility list ${listID}`,
                failFetchFacilityList,
            )));
    };
}

export function fetchFacilityListItems(listID = null, page = undefined, rowsPerPage = undefined) {
    return (dispatch) => {
        dispatch(startFetchFacilityListItems());

        if (!listID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'Missing required parameter list ID',
                failFetchFacilityListItems,
            ));
        }

        const url = makeSingleFacilityListItemsURL(listID);
        const qs = page || rowsPerPage
            ? `?${querystring.stringify({ page, pageSize: rowsPerPage })}`
            : '';
        return csrfRequest
            .get(`${url}${qs}`)
            .then(({ data }) => dispatch(completeFetchFacilityListItems(data.results)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                `An error prevented fetching facility list items for ${listID}`,
                failFetchFacilityListItems,
            )));
    };
}

export function confirmFacilityListItemMatch(facilityMatchID, listID, listItemID) {
    return (dispatch) => {
        dispatch(startConfirmFacilityListItemPotentialMatch());

        if (!listID || !listItemID || !facilityMatchID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'listID, listItemID, and facilityMatchID are required parameters',
                failConfirmFacilityListItemPotentialMatch,
            ));
        }

        return csrfRequest
            .post(
                createConfirmFacilityListItemMatchURL(listID),
                createConfirmOrRejectMatchData(listItemID, facilityMatchID),
            )
            .then(({ data }) => dispatch(completeConfirmFacilityListItemPotentialMatch(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented confirming that match',
                failConfirmFacilityListItemPotentialMatch,
            )));
    };
}

export function rejectFacilityListItemMatch(facilityMatchID, listID, listItemID) {
    return (dispatch) => {
        dispatch(startRejectFacilityListItemPotentialMatch());

        if (!listID || !listItemID || !facilityMatchID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'listID, listItemID, and facilityMatchID are required parameters',
                failRejectFacilityListItemPotentialMatch,
            ));
        }

        return csrfRequest
            .post(
                createRejectFacilityListItemMatchURL(listID),
                createConfirmOrRejectMatchData(listItemID, facilityMatchID),
            )
            .then(({ data }) => dispatch(completeRejectFacilityListItemPotentialMatch(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented rejecting that match',
                failRejectFacilityListItemPotentialMatch,
            )));
    };
}
