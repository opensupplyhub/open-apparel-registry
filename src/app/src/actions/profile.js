import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    makeAPITokenURL,
    logErrorAndDispatchFailure,
} from '../util/util';

export const startFetchAPIToken = createAction('START_FETCH_API_TOKEN');
export const failFetchAPIToken = createAction('FAIL_FETCH_API_TOKEN');
export const completeFetchAPIToken = createAction('COMPLETE_FETCH_API_TOKEN');

export const startDeleteAPIToken = createAction('START_DELETE_API_TOKEN');
export const failDeleteAPIToken = createAction('FAIL_DELETE_API_TOKEN');
export const completeDeleteAPIToken = createAction('COMPLETE_DELETE_API_TOKEN');

export const startCreateAPIToken = createAction('START_CREATE_API_TOKEN');
export const failCreateAPIToken = createAction('FAIL_CREATE_API_TOKEN');
export const completeCreateAPIToken = createAction('COMPLETE_CREATE_API_TOKEN');

export const updateProfileFormInput = createAction('UPDATE_PROFILE_FORM_INPUT');

export function fetchAPIToken() {
    return (dispatch) => {
        dispatch(startFetchAPIToken());

        return csrfRequest
            .get(makeAPITokenURL())
            // Return a list here to afford potentially retrieving and displaying
            // multiple API tokens per user.
            // See https://github.com/open-apparel-registry/open-apparel-registry/issues/119
            .then(({ data }) => dispatch(completeFetchAPIToken([data])))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching the API token',
                failFetchAPIToken,
            )));
    };
}

export function deleteAPIToken() {
    return (dispatch) => {
        dispatch(startDeleteAPIToken());

        return csrfRequest
            .delete(makeAPITokenURL())
            .then(() => dispatch(completeDeleteAPIToken()))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented deleting the API token',
                failDeleteAPIToken,
            )));
    };
}

export function createAPIToken() {
    return (dispatch) => {
        dispatch(startCreateAPIToken());

        return csrfRequest
            .post(makeAPITokenURL())
            // Return a list here to afford potentially retrieving and displaying
            // multiple API tokens per user.
            // See https://github.com/open-apparel-registry/open-apparel-registry/issues/119
            .then(({ data }) => dispatch(completeCreateAPIToken([data])))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented creating an API token',
                failCreateAPIToken,
            )));
    };
}
