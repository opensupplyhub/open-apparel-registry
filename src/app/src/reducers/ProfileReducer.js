import { createReducer } from 'redux-act';
import update from 'immutability-helper';

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
    startFetchUserProfile,
    failFetchUserProfile,
    completeFetchUserProfile,
    completeFetchUserProfileWithEmail,
    resetUserProfile,
    startUpdateUserProfile,
    failUpdateUserProfile,
    completeUpdateUserProfile,
} from '../actions/profile';

import {
    completeSubmitLoginForm,
    completeSessionLogin,
    completeSubmitLogOut,
} from '../actions/auth';

import { registrationFieldsEnum, profileFieldsEnum } from '../util/constants';

const initialState = Object.freeze({
    profile: Object.freeze({
        id: null,
        [registrationFieldsEnum.email]: '',
        [registrationFieldsEnum.name]: '',
        [registrationFieldsEnum.description]: '',
        [registrationFieldsEnum.website]: '',
        [registrationFieldsEnum.contributorType]: '',
        [registrationFieldsEnum.otherContributorType]: '',
        [profileFieldsEnum.currentPassword]: '',
        [profileFieldsEnum.newPassword]: '',
        [profileFieldsEnum.confirmNewPassword]: '',
    }),
    formSubmission: {
        fetching: false,
        error: null,
    },
    tokens: Object.freeze({
        tokens: Object.freeze([]),
        fetching: false,
        error: null,
    }),
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

const handleLogin = (state, { id, email }) => {
    if (id !== state.profile.id) {
        return state;
    }

    return update(state, {
        profile: {
            email: { $set: email },
        },
    });
};

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
    [updateProfileFormInput]: (state, { value, field }) => update(state, {
        profile: {
            [field]: { $set: value },
        },
        error: { $set: null },
    }),
    [completeSessionLogin]: handleLogin,
    [completeSubmitLoginForm]: handleLogin,
    [completeSubmitLogOut]: state => update(state, {
        profile: {
            email: { $set: initialState.profile.email },
            password: { $set: initialState.profile.password },
        },
    }),
    [startFetchUserProfile]: state => update(state, {
        fetching: { $set: true },
        error: { $set: null },
    }),
    [failFetchUserProfile]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: payload },
    }),
    [completeFetchUserProfile]: (state, payload) => update(state, {
        profile: {
            id: { $set: payload.id },
            name: { $set: payload.name || '' },
            description: { $set: payload.description || '' },
            website: { $set: payload.website || '' },
            contributorType: { $set: payload.contributor_type || '' },
            otherContributorType: { $set: payload.other_contributor_type || '' },
            currentPassword: { $set: '' },
            newPassword: { $set: '' },
            confirmNewPassword: { $set: '' },
        },
        fetching: { $set: false },
        error: { $set: null },
    }),
    [completeFetchUserProfileWithEmail]: (state, payload) => update(state, {
        profile: {
            id: { $set: payload.id },
            email: { $set: payload.email || '' },
            name: { $set: payload.name || '' },
            description: { $set: payload.description || '' },
            website: { $set: payload.website || '' },
            contributorType: { $set: payload.contributor_type || '' },
            otherContributorType: { $set: payload.other_contributor_type || '' },
        },
        fetching: { $set: false },
        error: { $set: null },
    }),
    [startUpdateUserProfile]: state => update(state, {
        formSubmission: {
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failUpdateUserProfile]: (state, payload) => update(state, {
        formSubmission: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeUpdateUserProfile]: (state, payload) => update(state, {
        formSubmission: {
            fetching: { $set: false },
            error: { $set: null },
        },
        profile: {
            [registrationFieldsEnum.name]: { $set: payload.name },
            [registrationFieldsEnum.description]: { $set: payload.description },
            [registrationFieldsEnum.website]: { $set: payload.website },
            [registrationFieldsEnum.contributorType]: { $set: payload.contributor_type },
            [registrationFieldsEnum.otherContributorType]: { $set: payload.other_contributor_type },
            [profileFieldsEnum.currentPassword]: { $set: initialState.profile.currentPassword },
            [profileFieldsEnum.newPassword]: { $set: initialState.profile.newPassword },
            [profileFieldsEnum.confirmNewPassword]: {
                $set: initialState.profile.confirmNewPassword,
            },
        },
    }),
    [resetUserProfile]: () => initialState,
}, initialState);
