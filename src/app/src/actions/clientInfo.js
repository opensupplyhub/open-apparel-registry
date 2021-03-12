import { createAction } from 'redux-act';

import axios from 'axios';

import { makeGetClientInfoURL, logErrorAndDispatchFailure } from '../util/util';

export const startFetchClientInfo = createAction('START_FETCH_CLIENT_INFO');
export const failFetchClientInfo = createAction('FAIL_FETCH_CLIENT_INFO');
export const completeFetchClientInfo = createAction(
    'COMPLETE_FETCH_CLIENT_INFO',
);

const request = axios.create({
    // Allow for a slow connection but ensure that Google components attempt to
    // load with default client details if the client info API request hangs
    // indefinitely.
    timeout: 10000,
});

export function fetchClientInfo() {
    return dispatch => {
        dispatch(startFetchClientInfo());

        return request
            .get(makeGetClientInfoURL())
            .then(({ data }) => dispatch(completeFetchClientInfo(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching client info',
                        failFetchClientInfo,
                    ),
                ),
            );
    };
}
