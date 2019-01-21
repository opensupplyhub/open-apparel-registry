import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startSubmitSignUpForm,
    failSubmitSignUpForm,
    completeSubmitSignUpForm,
    startSubmitLoginForm,
    failSubmitLoginForm,
    completeSubmitLoginForm,
    startSessionLogin,
    failSessionLogin,
    completeSessionLogin,
    startSubmitForgotPassword,
    failSubmitForgotPassword,
    completeSubmitForgotPassword,
    startSubmitLogOut,
    failSubmitLogOut,
    completeSubmitLogOut,
    updateSignUpFormInput,
    updateLoginFormEmailAddress,
    updateLoginFormPassword,
    openForgotPasswordDialog,
    closeForgotPasswordDialog,
    updateForgotPasswordEmailAddress,
    resetAuthFormState,
    resetAuthState,
} from '../actions/auth';

import { registrationFieldsEnum } from '../util/constants';

const initialState = Object.freeze({
    signup: Object.freeze({
        form: Object.freeze({
            [registrationFieldsEnum.email]: '',
            [registrationFieldsEnum.name]: '',
            [registrationFieldsEnum.description]: '',
            [registrationFieldsEnum.website]: '',
            [registrationFieldsEnum.contributorType]: '',
            [registrationFieldsEnum.otherContributorType]: '',
            [registrationFieldsEnum.password]: '',
            [registrationFieldsEnum.confirmPassword]: '',
            [registrationFieldsEnum.newsletter]: false,
            [registrationFieldsEnum.tos]: false,
        }),
    }),
    login: Object.freeze({
        form: Object.freeze({
            email: '',
            password: '',
        }),
    }),
    forgotPassword: Object.freeze({
        form: Object.freeze({
            email: '',
        }),
        dialogIsOpen: false,
    }),
    user: Object.freeze({
        user: null,
    }),
    session: Object.freeze({
        fetching: false,
    }),
    fetching: false,
    error: null,
});

const startFetching = state => update(state, {
    fetching: { $set: true },
    error: { $set: null },
});

const failFetching = (state, payload) => update(state, {
    fetching: { $set: false },
    error: { $set: payload },
});

const updateRegistrationFormField = (state, { field, value }) => update(state, {
    error: { $set: null },
    signup: {
        form: {
            [field]: { $set: value },
        },
    },
});

export default createReducer({
    [updateSignUpFormInput]: updateRegistrationFormField,
    [updateLoginFormEmailAddress]: (state, payload) => update(state, {
        error: { $set: null },
        login: {
            form: {
                email: { $set: payload },
            },
        },
    }),
    [updateLoginFormPassword]: (state, payload) => update(state, {
        error: { $set: null },
        login: {
            form: {
                password: { $set: payload },
            },
        },
    }),
    [updateForgotPasswordEmailAddress]: (state, payload) => update(state, {
        error: { $set: null },
        forgotPassword: {
            form: {
                email: { $set: payload },
            },
        },
    }),
    [startSubmitSignUpForm]: startFetching,
    [startSubmitLoginForm]: startFetching,
    [startSubmitLogOut]: startFetching,
    [startSubmitForgotPassword]: startFetching,
    [failSubmitSignUpForm]: failFetching,
    [failSubmitLoginForm]: failFetching,
    [failSubmitLogOut]: failFetching,
    [failSubmitForgotPassword]: failFetching,
    [completeSubmitSignUpForm]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: null },
        signup: {
            form: { $set: initialState.signup.form },
        },
        user: {
            user: { $set: payload },
        },
    }),
    [completeSubmitLoginForm]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: null },
        login: {
            form: { $set: initialState.login.form },
        },
        user: {
            key: { $set: payload.key },
            user: { $set: payload.user },
        },
    }),
    [startSessionLogin]: state => update(state, {
        session: {
            fetching: { $set: true },
        },
    }),
    [completeSessionLogin]: (state, payload) => update(state, {
        session: {
            fetching: { $set: false },
        },
        user: {
            user: { $set: payload },
        },
    }),
    [failSessionLogin]: state => update(state, {
        session: {
            fetching: { $set: false },
        },
    }),
    [completeSubmitForgotPassword]: state => update(state, {
        fetching: { $set: false },
        error: { $set: null },
        forgotPassword: { $set: initialState.forgotPassword },
    }),
    [completeSubmitLogOut]: () => initialState,
    [openForgotPasswordDialog]: state => update(state, {
        forgotPassword: {
            dialogIsOpen: { $set: true },
        },
    }),
    [closeForgotPasswordDialog]: state => update(state, {
        forgotPassword: { $set: initialState.forgotPassword },
    }),
    [resetAuthFormState]: state => update(state, {
        signup: { $set: initialState.signup },
        login: { $set: initialState.login },
        forgotPassword: { $set: initialState.forgotPassword },
        fetching: { $set: false },
        error: { $set: null },
    }),
    [resetAuthState]: () => initialState,
}, initialState);
