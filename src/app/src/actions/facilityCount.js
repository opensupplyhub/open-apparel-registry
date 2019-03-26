import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeGetFacilitiesCountURL,
} from '../util/util';

export const startFetchFacilityCount = createAction('START_FETCH_FACILITY_COUNT');
export const failFetchFacilityCount = createAction('FAIL_FETCH_FACILITY_COUNT');
export const completeFetchFacilityCount = createAction('COMPLETE_FETCH_FACILITY_COUNT');
export const clearFacilityCount = createAction('CLEAR_FACILITY_COUNT');

export function fetchFacilityCount() {
    return (dispatch, getState) => {
        dispatch(startFetchFacilityCount());

        const {
            facilityCount: {
                data,
            },
        } = getState();

        if (data) {
            return dispatch(completeFetchFacilityCount(data));
        }

        return csrfRequest
            .get(makeGetFacilitiesCountURL())
            .then(({ data: { count } }) => dispatch(completeFetchFacilityCount(count)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching facility count',
                failFetchFacilityCount,
            )));
    };
}
