import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    makeGetAPIFeatureFlagsURL,
    logErrorAndDispatchFailure,
} from '../util/util';

export const startFetchFeatureFlags = createAction('START_FETCH_FEATURE_FLAGS');
export const failFetchFeatureFlags = createAction('FAIL_FETCH_FEATURE_FLAGS');
export const completeFetchFeatureFlags = createAction('COMPLETE_FETCH_FEATURE_FLAGS');
export const clearFeatureFlags = createAction('CLEAR_FEATURE_FLAGS');

export function fetchFeatureFlags() {
    return (dispatch) => {
        dispatch(startFetchFeatureFlags());

        return csrfRequest
            .get(makeGetAPIFeatureFlagsURL())
            .then(({ data }) => dispatch(completeFetchFeatureFlags(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching feature flags',
                failFetchFeatureFlags,
            )));
    };
}
