import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeFacilityListsURL,
} from '../util/util';

export const startFetchUserFacilityLists = createAction('START_FETCH_USER_FACILITY_LISTS');
export const failFetchUserFacilityLists = createAction('FAIL_FETCH_USER_FACILITY_LISTS');
export const completeFetchUserFacilityLists = createAction('COMPLETE_FETCH_USER_FACILITY_LISTS');
export const resetUserFacilityLists = createAction('RESET_USER_FACILITY_LISTS');

export function fetchUserFacilityLists() {
    return (dispatch) => {
        dispatch(startFetchUserFacilityLists());

        return csrfRequest
            .get(makeFacilityListsURL())
            .then(({ data }) => dispatch(completeFetchUserFacilityLists(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching facility lists',
                failFetchUserFacilityLists,
            )));
    };
}
