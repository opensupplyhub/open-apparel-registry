import { createAction } from 'redux-act';

import { logErrorAndDispatchFailure } from '../util/util';

export const startFetchAPITokens = createAction('START_FETCH_API_TOKENS');
export const failFetchAPITokens = createAction('FAIL_FETCH_API_TOKENS');
export const completeFetchAPITokens = createAction('COMPLETE_FETCH_API_TOKENS');

export const startDeleteAPIToken = createAction('START_DELETE_API_TOKEN');
export const failDeleteAPIToken = createAction('FAIL_DELETE_API_TOKEN');
export const completeDeleteAPIToken = createAction('COMPLETE_DELETE_API_TOKEN');

export const startCreateAPIToken = createAction('START_CREATE_API_TOKEN');
export const failCreateAPIToken = createAction('FAIL_CREATE_API_TOKEN');
export const completeCreateAPIToken = createAction('COMPLETE_CREATE_API_TOKEN');

export const updateProfileFormInput = createAction('UPDATE_PROFILE_FORM_INPUT');

const mockToken = Object.freeze({
    id: 1,
    token: 'HELLO-WORLD-FOO-BAR-BAZ',
    created_at: '12345',
});

const otherMockToken = Object.freeze({
    id: 2,
    token: 'FOO-BAR-BAZ-HELLO-WORLD',
    created_at: '54321',
});

const mockTokenData = Object.freeze([
    mockToken,
    otherMockToken,
]);

export function fetchAPITokens() {
    return (dispatch) => {
        dispatch(startFetchAPITokens());

        return Promise
            .resolve(true)
            .then(() => dispatch(completeFetchAPITokens(mockTokenData)))
            .catch(() => dispatch(logErrorAndDispatchFailure(
                null,
                'An error prevented fetching API tokens',
                failFetchAPITokens,
            )));
    };
}

export function deleteAPIToken() {
    return (dispatch) => {
        dispatch(startDeleteAPIToken());

        return Promise
            .resolve(true)
            .then(() => dispatch(completeDeleteAPIToken(mockTokenData)))
            .catch(() => dispatch(logErrorAndDispatchFailure(
                null,
                'An error prevented deleting the API token',
                failDeleteAPIToken,
            )));
    };
}

export function createAPIToken() {
    return (dispatch) => {
        dispatch(startCreateAPIToken());

        return Promise
            .resolve(true)
            .then(() => dispatch(completeCreateAPIToken(mockTokenData)))
            .catch(() => dispatch(logErrorAndDispatchFailure(
                null,
                'An error prevented creating an API token',
                failCreateAPIToken,
            )));
    };
}
