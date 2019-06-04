import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    makeGetFacilityClaimsURL,
    logErrorAndDispatchFailure,
} from '../util/util';

export const startFetchFacilityClaims = createAction('START_FETCH_FACILITY_CLAIMS');
export const failFetchFacilityClaims = createAction('FAIL_FETCH_FACILITY_CLAIMS');
export const completeFetchFacilityClaims = createAction('COMPLETE_FETCH_FACILITY_CLAIMS');
export const clearFacilityClaims = createAction('CLEAR_FACILITY_CLAIMS');

export function fetchFacilityClaims() {
    return (dispatch) => {
        dispatch(startFetchFacilityClaims());

        return csrfRequest
            .get(makeGetFacilityClaimsURL())
            .then(({ data }) => dispatch(completeFetchFacilityClaims(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching facility claims',
                failFetchFacilityClaims,
            )));
    };
}
