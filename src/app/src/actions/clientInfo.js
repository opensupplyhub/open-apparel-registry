import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    makeGetClientInfoURL,
    logErrorAndDispatchFailure,
} from '../util/util';

export const startFetchClientInfo = createAction('START_FETCH_CLIENT_INFO');
export const failFetchClientInfo = createAction('FAIL_FETCH_CLIENT_INFO');
export const completeFetchClientInfo = createAction('COMPLETE_FETCH_CLIENT_INFO');

export function fetchClientInfo() {
    return (dispatch) => {
        dispatch(startFetchClientInfo());

        return csrfRequest
            .get(makeGetClientInfoURL())
            .then(({ data }) => dispatch(completeFetchClientInfo(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching client info',
                failFetchClientInfo,
            )));
    };
}
