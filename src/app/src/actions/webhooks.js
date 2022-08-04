import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    makeContributorWebhooksURL,
    makeContributorWebhookURL,
    logErrorAndDispatchFailure,
} from '../util/util';

export const startFetchContributorWebhooks = createAction(
    'START_FETCH_WEBHOOKS',
);
export const failFetchContributorWebhooks = createAction('FAIL_FETCH_WEBHOOKS');
export const completeFetchContributorWebhooks = createAction(
    'COMPLETE_FETCH_WEBHOOKS',
);

export const startCreateContributorWebhook = createAction(
    'START_CREATE_WEBHOOK',
);
export const failCreateContributorWebhook = createAction('FAIL_CREATE_WEBHOOK');
export const completeCreateContributorWebhook = createAction(
    'COMPLETE_CREATE_WEBHOOK',
);

export const startUpdateContributorWebhook = createAction(
    'START_UPDATE_WEBHOOK',
);
export const failUpdateContributorWebhook = createAction('FAIL_UPDATE_WEBHOOK');
export const completeUpdateContributorWebhook = createAction(
    'COMPLETE_UPDATE_WEBHOOK',
);

export const startDeleteContributorWebhook = createAction(
    'START_DELETE_WEBHOOK',
);
export const failDeleteContributorWebhook = createAction('FAIL_DELETE_WEBHOOK');
export const completeDeleteContributorWebhook = createAction(
    'COMPLETE_DELETE_WEBHOOK',
);

export const updateWebhookField = createAction('UPDATE_WEBHOOK_FIELD');

export const resetWebhookChanges = createAction('RESET_WEBHOOK_CHANGES');

export const confirmDeletingContributorWebhook = createAction(
    'SET_WEBHOOK_FOR_DELETE_DIALOG',
);

export function fetchContributorWebhooks() {
    return dispatch => {
        dispatch(startFetchContributorWebhooks());

        return apiRequest
            .get(makeContributorWebhooksURL())
            .then(({ data: { results } }) =>
                dispatch(completeFetchContributorWebhooks(results)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching the contributor webhooks',
                        failFetchContributorWebhooks,
                    ),
                ),
            );
    };
}

export function createContributorWebhook(webhook) {
    return dispatch => {
        dispatch(startCreateContributorWebhook());

        return apiRequest
            .post(makeContributorWebhooksURL(), webhook)
            .then(({ data }) =>
                dispatch(completeCreateContributorWebhook(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented creating a webhook',
                        failCreateContributorWebhook,
                    ),
                ),
            );
    };
}

export function updateContributorWebhook(webhook) {
    return dispatch => {
        dispatch(startUpdateContributorWebhook(webhook.id));

        return apiRequest
            .put(makeContributorWebhookURL(webhook.id), webhook)
            .then(({ data }) =>
                dispatch(completeUpdateContributorWebhook(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented updating a webhook',
                        failUpdateContributorWebhook,
                    ),
                ),
            );
    };
}

export function deleteContributorWebhook(id) {
    return dispatch => {
        dispatch(startDeleteContributorWebhook());

        return apiRequest
            .delete(makeContributorWebhookURL(id))
            .then(() => dispatch(completeDeleteContributorWebhook(id)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented deleting the webhook',
                        failDeleteContributorWebhook,
                    ),
                ),
            );
    };
}
