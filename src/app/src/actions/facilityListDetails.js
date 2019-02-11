import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeSingleFacilityListURL,
} from '../util/util';

export const startFetchFacilityListItems = createAction('START_FETCH_FACILITY_LIST_ITEMS');
export const failFetchFacilityListItems = createAction('FAIL_FETCH_FACILITY_LIST_ITEMS');
export const completeFetchFacilityListItems = createAction('COMPLETE_FETCH_FACILITY_LIST_ITEMS');
export const resetFacilityListItems = createAction('RESET_FACILITY_LIST_ITEMS');

export function fetchFacilityListItems(listID = null) {
    return (dispatch) => {
        dispatch(startFetchFacilityListItems());

        if (!listID) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'Missing required parameter list ID',
                failFetchFacilityListItems,
            ));
        }

        return csrfRequest
            .get(makeSingleFacilityListURL(listID))
            .then(({ data }) => dispatch(completeFetchFacilityListItems(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                `An error prevented fetching facility list items for ${listID}`,
                failFetchFacilityListItems,
            )));
    };
}
