import { createAction } from 'redux-act';
import querystring from 'querystring';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeSingleFacilityListURL,
    makeSingleFacilityListItemsURL,
    createConfirmFacilityListItemMatchURL,
    createRejectFacilityListItemMatchURL,
    createRemoveFacilityListItemURL,
    makeFacilityListDataURLs,
    downloadListItemCSV,
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

export const startAssembleAndDownloadFacilityListCSV =
    createAction('START_ASSEMBLE_AND_DOWNLOAD_FACILITY_LIST_CSV');
export const failAssembleAndDownloadFacilityListCSV =
    createAction('FAIL_ASSEMBLE_AND_DOWNLOAD_FACILITY_LIST_CSV');
export const completeAssembleAndDownloadFacilityListCSV =
    createAction('COMPLETE_ASSEMBLE_AND_DOWNLOAD_FACILITY_LIST_CSV');

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

        return apiRequest
            .get(makeSingleFacilityListURL(listID))
            .then(({ data }) => dispatch(completeFetchFacilityList(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                `An error prevented fetching facility list ${listID}`,
                failFetchFacilityList,
            )));
    };
}

export function fetchFacilityListItems(
    listID = null, page = undefined, rowsPerPage = undefined, params = null,
) {
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
        const pageParams = page || rowsPerPage
            ? { page, pageSize: rowsPerPage }
            : null;
        const qs = `?${querystring.stringify(Object.assign({}, params, pageParams))}`;
        return apiRequest
            .get(`${url}${qs}`)
            .then(({ data }) => dispatch(completeFetchFacilityListItems(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                `An error prevented fetching facility list items for ${listID}`,
                failFetchFacilityListItems,
            )));
    };
}

export function confirmFacilityListItemMatch(facilityMatchID) {
    return (dispatch) => {
        dispatch(startConfirmFacilityListItemPotentialMatch());

        if (!facilityMatchID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'facilityMatchID is a required parameter',
                failConfirmFacilityListItemPotentialMatch,
            ));
        }

        return apiRequest
            .post(
                createConfirmFacilityListItemMatchURL(facilityMatchID),
            )
            .then(({ data }) => dispatch(completeConfirmFacilityListItemPotentialMatch(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented confirming that match',
                failConfirmFacilityListItemPotentialMatch,
            )));
    };
}

export function rejectFacilityListItemMatch(facilityMatchID) {
    return (dispatch) => {
        dispatch(startRejectFacilityListItemPotentialMatch());

        if (!facilityMatchID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'facilityMatchID is a required parameter',
                failRejectFacilityListItemPotentialMatch,
            ));
        }

        return apiRequest
            .post(
                createRejectFacilityListItemMatchURL(facilityMatchID),
            )
            .then(({ data }) => dispatch(completeRejectFacilityListItemPotentialMatch(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented rejecting that match',
                failRejectFacilityListItemPotentialMatch,
            )));
    };
}

export function assembleAndDownloadFacilityListCSV() {
    return async (dispatch, getState) => {
        dispatch(startAssembleAndDownloadFacilityListCSV());

        try {
            const {
                facilityListDetails: {
                    list: {
                        data,
                    },
                },
            } = getState();

            const {
                id,
                item_count: count,
            } = data;

            const dataURLs = makeFacilityListDataURLs(id, count);
            let csvData = [];
            for (let i = 0, len = dataURLs.length; i < len; i += 1) {
                const {
                    data: {
                        results,
                    },
                } = await apiRequest.get(dataURLs[i]); // eslint-disable-line no-await-in-loop
                csvData = csvData.concat(results);
            }
            downloadListItemCSV(data, csvData);

            return dispatch(completeAssembleAndDownloadFacilityListCSV(csvData));
        } catch (err) {
            return dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented downloading the facilityList CSV',
                failAssembleAndDownloadFacilityListCSV,
            ));
        }
    };
}

export const startRemoveFacilityListItem = createAction('START_REMOVE_FACILITY_LIST_ITEM');
export const failRemoveFacilityListItem = createAction('FAIL_REMOVE_FACILITY_LIST_ITEM');
export const completeRemoveFacilityListItem = createAction('COMPLETE_REMOVE_FACILITY_LIST_ITEM');

export function removeFacilityListItem(listID, listItemID) {
    return (dispatch) => {
        dispatch(startRemoveFacilityListItem());

        if (!listID || !listItemID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'listID and listItemID are required parameters',
                failRemoveFacilityListItem,
            ));
        }

        return apiRequest
            .post(
                createRemoveFacilityListItemURL(listID),
                { list_item_id: listItemID },
            )
            .then(({ data }) => dispatch(completeRemoveFacilityListItem(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented removing that facility list item',
                failRemoveFacilityListItem,
            )));
    };
}
