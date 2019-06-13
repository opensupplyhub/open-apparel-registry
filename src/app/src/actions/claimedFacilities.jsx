import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    makeGetClaimedFacilitiesURL,
    logErrorAndDispatchFailure,
} from '../util/util';

export const startFetchClaimedFacilities = createAction('START_FETCH_CLAIMED_FACILITIES');
export const failFetchClaimedFacilities = createAction('FAIL_FETCH_CLAIMED_FACILITIES');
export const completeFetchClaimedFacilities = createAction('COMPLETE_FETCH_CLAIMED_FACILITIES');
export const clearClaimedFacilities = createAction('CLEAR_CLAIMED_FACILITIES');

export function fetchClaimedFacilities() {
    return (dispatch) => {
        dispatch(startFetchClaimedFacilities());

        return csrfRequest
            .get(makeGetClaimedFacilitiesURL())
            .then(({ data }) => dispatch(completeFetchClaimedFacilities(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching facility claims',
                failFetchClaimedFacilities,
            )));
    };
}
