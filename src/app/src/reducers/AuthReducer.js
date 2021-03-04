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
    startRequestForgotPasswordEmail,
    failRequestForgotPasswordEmail,
    completeRequestForgotPasswordEmail,
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
    updateResetPasswordFormUID,
    updateResetPasswordFormToken,
    updateResetPasswordFormPassword,
    updateResetPasswordFormPasswordConfirmation,
    startSubmitResetPasswordForm,
    failSubmitResetPasswordForm,
    completeSubmitResetPasswordForm,
    resetResetPasswordFormState,
    startConfirmAccountRegistration,
    failConfirmAccountRegistration,
    completeConfirmAccountRegistration,
    resetConfirmAccountRegistration,
} from '../actions/auth';

import { completeUpdateUserProfile } from '../actions/profile';

import { completeSubmitClaimAFacilityData } from '../actions/claimFacility';

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
        error: null,
        fetching: false,
    }),
    resetPassword: Object.freeze({
        uid: null,
        token: null,
        newPassword: '',
        newPasswordConfirmation: '',
        fetching: false,
        error: null,
        confirmationResponse: false,
    }),
    user: Object.freeze({
        user: null,
    }),
    session: Object.freeze({
        fetching: false,
    }),
    fetching: false,
    error: null,
    confirmRegistration: Object.freeze({
        fetching: false,
        error: null,
        key: '',
    }),
});

const startFetching = state =>
    update(state, {
        fetching: { $set: true },
        error: { $set: null },
    });

const failFetching = (state, payload) =>
    update(state, {
        fetching: { $set: false },
        error: { $set: payload },
    });

const updateRegistrationFormField = (state, { field, value }) =>
    update(state, {
        error: { $set: null },
        signup: {
            form: {
                [field]: { $set: value },
            },
        },
    });

export default createReducer(
    {
        [updateSignUpFormInput]: updateRegistrationFormField,
        [updateLoginFormEmailAddress]: (state, payload) =>
            update(state, {
                error: { $set: null },
                login: {
                    form: {
                        email: { $set: payload },
                    },
                },
            }),
        [updateLoginFormPassword]: (state, payload) =>
            update(state, {
                error: { $set: null },
                login: {
                    form: {
                        password: { $set: payload },
                    },
                },
            }),
        [updateForgotPasswordEmailAddress]: (state, payload) =>
            update(state, {
                forgotPassword: {
                    form: {
                        email: { $set: payload },
                    },
                    error: { $set: null },
                },
            }),
        [startSubmitSignUpForm]: startFetching,
        [startSubmitLoginForm]: startFetching,
        [startSubmitLogOut]: startFetching,
        [startRequestForgotPasswordEmail]: state =>
            update(state, {
                forgotPassword: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failSubmitSignUpForm]: failFetching,
        [failSubmitLoginForm]: failFetching,
        [failSubmitLogOut]: failFetching,
        [failRequestForgotPasswordEmail]: (state, payload) =>
            update(state, {
                forgotPassword: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeSubmitSignUpForm]: state =>
            update(state, {
                fetching: { $set: false },
                error: { $set: null },
                signup: {
                    form: { $set: initialState.signup.form },
                },
            }),
        [completeSubmitLoginForm]: (state, payload) =>
            update(state, {
                fetching: { $set: false },
                error: { $set: null },
                login: {
                    form: { $set: initialState.login.form },
                },
                user: {
                    user: { $set: payload },
                },
            }),
        [startSessionLogin]: state =>
            update(state, {
                session: {
                    fetching: { $set: true },
                },
            }),
        [completeSessionLogin]: (state, payload) =>
            update(state, {
                session: {
                    fetching: { $set: false },
                },
                user: {
                    user: { $set: payload },
                },
            }),
        [failSessionLogin]: state =>
            update(state, {
                session: {
                    fetching: { $set: false },
                },
            }),
        [completeRequestForgotPasswordEmail]: state =>
            update(state, {
                forgotPassword: { $set: initialState.forgotPassword },
            }),
        [completeSubmitLogOut]: () => initialState,
        [openForgotPasswordDialog]: state =>
            update(state, {
                forgotPassword: {
                    dialogIsOpen: { $set: true },
                },
            }),
        [closeForgotPasswordDialog]: state =>
            update(state, {
                forgotPassword: { $set: initialState.forgotPassword },
            }),
        [resetAuthFormState]: state =>
            update(state, {
                signup: { $set: initialState.signup },
                login: { $set: initialState.login },
                forgotPassword: { $set: initialState.forgotPassword },
                fetching: { $set: false },
                error: { $set: null },
            }),
        [updateResetPasswordFormUID]: (state, payload) =>
            update(state, {
                resetPassword: {
                    uid: { $set: payload },
                },
            }),
        [updateResetPasswordFormToken]: (state, payload) =>
            update(state, {
                resetPassword: {
                    token: { $set: payload },
                },
            }),
        [updateResetPasswordFormPassword]: (state, payload) =>
            update(state, {
                resetPassword: {
                    newPassword: { $set: payload },
                },
            }),
        [updateResetPasswordFormPasswordConfirmation]: (state, payload) =>
            update(state, {
                resetPassword: {
                    newPasswordConfirmation: { $set: payload },
                },
            }),
        [startSubmitResetPasswordForm]: state =>
            update(state, {
                resetPassword: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failSubmitResetPasswordForm]: (state, payload) =>
            update(state, {
                resetPassword: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeSubmitResetPasswordForm]: state =>
            update(state, {
                resetPassword: {
                    fetching: { $set: false },
                    error: { $set: null },
                    newPassword: { $set: '' },
                    newPasswordConfirmation: { $set: '' },
                    confirmationResponse: { $set: true },
                },
            }),
        [resetResetPasswordFormState]: state =>
            update(state, {
                resetPassword: {
                    $set: initialState.resetPassword,
                },
            }),
        [resetAuthState]: () => initialState,
        [completeUpdateUserProfile]: (state, payload) =>
            update(state, {
                user: {
                    user: {
                        name: { $set: payload.name },
                    },
                },
            }),
        [startConfirmAccountRegistration]: (state, payload) =>
            update(state, {
                confirmRegistration: {
                    error: { $set: null },
                    fetching: { $set: true },
                    key: { $set: payload },
                },
            }),
        [failConfirmAccountRegistration]: (state, payload) =>
            update(state, {
                confirmRegistration: {
                    error: { $set: payload },
                    fetching: { $set: false },
                },
            }),
        [completeConfirmAccountRegistration]: state =>
            update(state, {
                confirmRegistration: {
                    $set: initialState.confirmRegistration,
                },
            }),
        [resetConfirmAccountRegistration]: state =>
            update(state, {
                confirmRegistration: {
                    $set: initialState.confirmRegistration,
                },
            }),
        [completeSubmitClaimAFacilityData]: (state, claimedFacilityIDs) =>
            update(state, {
                user: {
                    user: {
                        claimed_facility_ids: { $set: claimedFacilityIDs },
                    },
                },
            }),
    },
    initialState,
);
