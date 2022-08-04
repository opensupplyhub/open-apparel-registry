import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchContributorWebhooks,
    failFetchContributorWebhooks,
    completeFetchContributorWebhooks,
    startCreateContributorWebhook,
    failCreateContributorWebhook,
    completeCreateContributorWebhook,
    startUpdateContributorWebhook,
    failUpdateContributorWebhook,
    completeUpdateContributorWebhook,
    startDeleteContributorWebhook,
    failDeleteContributorWebhook,
    completeDeleteContributorWebhook,
    updateWebhookField,
    resetWebhookChanges,
    confirmDeletingContributorWebhook,
} from '../actions/webhooks';

const newWebhook = {
    url: '',
    notification_type: undefined,
    filter_query_string: '',
};

const initialState = Object.freeze({
    webhooks: null,
    formData: [],
    fetching: false,
    creating: false,
    deleting: false,
    updating: null,
    error: null,
    confirmDelete: null,
});

export default createReducer(
    {
        [startFetchContributorWebhooks]: state =>
            update(state, {
                fetching: { $set: true },
                error: { $set: null },
            }),
        [startCreateContributorWebhook]: state =>
            update(state, {
                creating: { $set: true },
                error: { $set: null },
            }),
        [startUpdateContributorWebhook]: (state, payload) =>
            update(state, {
                updating: { $set: payload },
                error: { $set: null },
            }),
        [startDeleteContributorWebhook]: state =>
            update(state, {
                deleting: { $set: true },
                error: { $set: null },
            }),
        [failFetchContributorWebhooks]: (state, payload) =>
            update(state, {
                fetching: { $set: false },
                error: { $set: payload },
            }),
        [failCreateContributorWebhook]: (state, payload) =>
            update(state, {
                creating: { $set: false },
                error: { $set: payload },
            }),
        [failUpdateContributorWebhook]: (state, payload) =>
            update(state, {
                updating: { $set: null },
                error: { $set: payload },
            }),
        [failDeleteContributorWebhook]: (state, payload) =>
            update(state, {
                deleting: { $set: false },
                error: { $set: payload },
            }),
        [completeFetchContributorWebhooks]: (state, payload) =>
            update(state, {
                webhooks: { $set: payload },
                formData: { $set: payload.concat([{ ...newWebhook }]) },
                fetching: { $set: false },
                error: { $set: null },
            }),
        [completeCreateContributorWebhook]: (state, payload) =>
            update(state, {
                webhooks: { $unshift: [payload] },
                formData: formData =>
                    [payload].concat(formData.slice(0, formData.length - 1), [
                        { ...newWebhook },
                    ]),
                creating: { $set: false },
                error: { $set: null },
            }),
        [completeUpdateContributorWebhook]: (state, payload) =>
            update(state, {
                webhooks: webhooks =>
                    webhooks.map(wh => (wh.id === payload.id ? payload : wh)),
                formData: formData =>
                    formData.map(form =>
                        form.id === payload.id ? payload : form,
                    ),
                updating: { $set: null },
                error: { $set: null },
            }),
        [completeDeleteContributorWebhook]: (state, payload) =>
            update(state, {
                webhooks: webhooks => webhooks.filter(wh => wh.id !== payload),
                formData: forms => forms.filter(form => form.id !== payload),
                confirmDelete: { $set: null },
                deleting: { $set: false },
                error: { $set: null },
            }),
        [updateWebhookField]: (state, { index, field, value }) =>
            update(state, {
                formData: {
                    [index]: {
                        [field]: { $set: value },
                    },
                },
            }),
        [resetWebhookChanges]: (state, index) =>
            update(state, {
                formData: { [index]: { $set: state.webhooks[index] } },
            }),
        [confirmDeletingContributorWebhook]: (state, payload) =>
            update(state, {
                confirmDelete: { $set: payload },
            }),
    },
    initialState,
);
