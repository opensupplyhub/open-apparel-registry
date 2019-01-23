import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeUserLoginURL,
    makeUserLogoutURL,
    makeUserSignupURL,
    createSignupErrorMessages,
    createSignupRequestData,
} from '../util/util';

import { registrationFieldsEnum } from '../util/constants';

export const startSubmitSignUpForm = createAction('START_SUBMIT_SIGN_UP_FORM');
export const failSubmitSignUpForm = createAction('FAIL_SUBMIT_SIGN_UP_FORM');
export const completeSubmitSignUpForm = createAction('COMPLETE_SUBMIT_SIGN_UP_FORM');

export const updateSignUpFormInput = createAction('UPDATE_SIGN_UP_FORM_INPUT');

export const startSubmitLoginForm = createAction('START_SUBMIT_LOGIN_FORM');
export const failSubmitLoginForm = createAction('FAIL_SUBMIT_LOGIN_FORM');
export const completeSubmitLoginForm = createAction('COMPLETE_SUBMIT_LOGIN_FORM');

export const startSessionLogin = createAction('START_SESSION_LOGIN');
export const failSessionLogin = createAction('FAIL_SESSION_LOGIN');
export const completeSessionLogin = createAction('COMPLETE_SESSION_LOGIN');

export const updateLoginFormEmailAddress = createAction('UPDATE_LOGIN_FORM_EMAIL_ADDRESS');
export const updateLoginFormPassword = createAction('UPDATE_LOGIN_FORM_PASSWORD');

export const startSubmitLogOut = createAction('START_SUBMIT_LOG_OUT');
export const failSubmitLogOut = createAction('FAIL_SUBMIT_LOG_OUT');
export const completeSubmitLogOut = createAction('COMPLETE_SUBMIT_LOG_OUT');

export const startSubmitForgotPassword = createAction('START_SUBMIT_FORGOT_PASSWORD');
export const failSubmitForgotPassword = createAction('FAIL_SUBMIT_FORGOT_PASSWORD');
export const completeSubmitForgotPassword = createAction('COMPLETE_SUBMIT_FORGOT_PASSWORD');

export const openForgotPasswordDialog = createAction('OPEN_FORGOT_PASSWORD_DIALOG');
export const closeForgotPasswordDialog = createAction('CLOSE_FORGOT_PASSWORD_DIALOG');
export const updateForgotPasswordEmailAddress =
    createAction('UPDATE_FORGOT_PASSWORD_EMAIL_ADDRESS');

export const resetAuthFormState = createAction('RESET_AUTH_FORM_STATE');
export const resetAuthState = createAction('RESET_AUTH_STATE');

export function submitSignUpForm() {
    return (dispatch, getState) => {
        dispatch(startSubmitSignUpForm());

        const {
            auth: {
                signup: {
                    form,
                },
            },
        } = getState();

        const missingRequiredFieldErrorMessages = createSignupErrorMessages(form);

        if (missingRequiredFieldErrorMessages.length) {
            return dispatch(failSubmitSignUpForm(missingRequiredFieldErrorMessages));
        }

        if (form[registrationFieldsEnum.password] !==
            form[registrationFieldsEnum.confirmPassword]) {
            return dispatch(failSubmitSignUpForm([
                'Password and confirmation password don\'t match',
            ]));
        }

        // Drop confirmPassword from request sent to Django, since it's sent as password
        const { confirmPassword, ...dataForAPI } = form;
        const signupData = createSignupRequestData(dataForAPI);

        return csrfRequest
            .post(makeUserSignupURL(), signupData)
            .then(({ data }) => dispatch(completeSubmitSignUpForm(data)))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'An error prevented signing up',
                failSubmitSignUpForm,
            )));
    };
}

export function submitLoginForm() {
    return (dispatch, getState) => {
        dispatch(startSubmitLoginForm());

        const {
            auth: {
                login: {
                    form: {
                        email,
                        password,
                    },
                },
            },
        } = getState();

        if (!email || !password) {
            return dispatch(logErrorAndDispatchFailure(
                null,
                'Email and password are required',
                failSubmitLoginForm,
            ));
        }

        return csrfRequest
            .post(makeUserLoginURL(), { email, password })
            .then(({ data }) => dispatch(completeSubmitLoginForm(data)))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'An error prevented logging in',
                failSubmitLoginForm,
            )));
    };
}

export function sessionLogin() {
    return (dispatch) => {
        dispatch(startSessionLogin());

        return csrfRequest
            .get(makeUserLoginURL())
            .then(({ data }) => dispatch(completeSessionLogin(data)))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'User was not signed in',
                failSessionLogin,
            )));
    };
}

export function submitForgotPassword() {
    return (dispatch) => {
        dispatch(startSubmitForgotPassword());

        return Promise
            .resolve(true)
            .then(() => dispatch(completeSubmitForgotPassword()))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'An error prevented sending the forgot password email',
                failSubmitForgotPassword,
            )));
    };
}

export function submitLogOut() {
    return (dispatch) => {
        dispatch(startSubmitLogOut());

        return csrfRequest
            .post(makeUserLogoutURL())
            .then(({ data }) => dispatch(completeSubmitLogOut(data)))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'An error prevented logging out',
                failSubmitLogOut,
            )));
    };
}
