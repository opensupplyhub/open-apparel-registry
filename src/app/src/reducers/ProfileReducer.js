import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import identity from 'lodash/identity';

import {
    startFetchAPITokens,
    failFetchAPITokens,
    completeFetchAPITokens,
    startDeleteAPIToken,
    failDeleteAPIToken,
    completeDeleteAPIToken,
    startCreateAPIToken,
    failCreateAPIToken,
    completeCreateAPIToken,
    updateProfileFormInput,
} from '../actions/profile';

import {
    completeSessionLogin,
    completeSubmitLoginForm,
    completeSubmitLogOut,
} from '../actions/auth';

const initialState = Object.freeze({
    profile: Object.freeze({
        email: '',
        name: '',
        description: '',
        website: '',
        contributorType: '',
        otherContributorType: '',
        password: '',
    }),
    tokens: Object.freeze({
        tokens: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    isEditable: false,
    fetching: false,
    error: null,
});

const startFetchingTokens = state => update(state, {
    tokens: {
        fetching: { $set: true },
        error: { $set: null },
    },
});

const failFetchingTokens = (state, payload) => update(state, {
    tokens: {
        fetching: { $set: false },
        error: { $set: payload },
    },
});

const completeUpdatingTokens = (state, payload) => update(state, {
    tokens: {
        tokens: { $set: payload },
        fetching: { $set: false },
        error: { $set: null },
    },
});

const setProfileOnFormLogin = (state, { user: payload }) => update(state, {
    profile: {
        email: { $set: payload.email || '' },
        name: { $set: payload.name || '' },
        description: { $set: payload.description || '' },
        website: { $set: payload.website || '' },
        contributorType: { $set: payload.contributor_type || '' },
        otherContributorType: { $set: payload.other_contributor_type || '' },
    },
});

const setProfileOnSessionLogin = (state, payload) => update(state, {
    profile: {
        email: { $set: payload.email || '' },
        name: { $set: payload.name || '' },
        description: { $set: payload.description || '' },
        website: { $set: payload.website || '' },
        contributorType: { $set: payload.contributor_type || '' },
        otherContributorType: { $set: payload.other_contributor_type || '' },
    },
});

export default createReducer({
    [startFetchAPITokens]: startFetchingTokens,
    [startDeleteAPIToken]: startFetchingTokens,
    [startCreateAPIToken]: startFetchingTokens,
    [failFetchAPITokens]: failFetchingTokens,
    [failDeleteAPIToken]: failFetchingTokens,
    [failCreateAPIToken]: failFetchingTokens,
    [completeFetchAPITokens]: completeUpdatingTokens,
    [completeDeleteAPIToken]: completeUpdatingTokens,
    [completeCreateAPIToken]: completeUpdatingTokens,
    [updateProfileFormInput]: identity,
    [completeSessionLogin]: setProfileOnSessionLogin,
    [completeSubmitLoginForm]: setProfileOnFormLogin,
    [completeSubmitLogOut]: state => update(state, {
        profile: { $set: initialState.profile },
    }),
}, initialState);
