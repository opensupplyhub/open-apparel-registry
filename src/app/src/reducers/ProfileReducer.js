import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import identity from 'lodash/identity';

import {
    startFetchAPIToken,
    failFetchAPIToken,
    completeFetchAPIToken,
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

const startFetchingToken = state => update(state, {
    tokens: {
        fetching: { $set: true },
        error: { $set: null },
    },
});

const failFetchingToken = (state, payload) => update(state, {
    tokens: {
        fetching: { $set: false },
        error: { $set: payload },
    },
});

const completeGettingAPIToken = (state, payload) => update(state, {
    tokens: {
        tokens: { $set: payload },
        fetching: { $set: false },
        error: { $set: null },
    },
});

const setProfileOnLogin = (state, payload) => update(state, {
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
    [startFetchAPIToken]: startFetchingToken,
    [startDeleteAPIToken]: startFetchingToken,
    [startCreateAPIToken]: startFetchingToken,
    [failFetchAPIToken]: failFetchingToken,
    [failDeleteAPIToken]: failFetchingToken,
    [failCreateAPIToken]: failFetchingToken,
    [completeDeleteAPIToken]: state => update(state, {
        tokens: { $set: initialState.tokens },
    }),
    [completeCreateAPIToken]: completeGettingAPIToken,
    [completeFetchAPIToken]: completeGettingAPIToken,
    [updateProfileFormInput]: identity,
    [completeSessionLogin]: setProfileOnLogin,
    [completeSubmitLoginForm]: setProfileOnLogin,
    [completeSubmitLogOut]: state => update(state, {
        profile: { $set: initialState.profile },
    }),
}, initialState);
