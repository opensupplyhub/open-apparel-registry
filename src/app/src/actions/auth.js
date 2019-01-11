import { createAction } from 'redux-act';

import { logErrorAndDispatchFailure } from '../util/util';

export const startSubmitSignUpForm = createAction('START_SUBMIT_SIGN_UP_FORM');
export const failSubmitSignUpForm = createAction('FAIL_SUBMIT_SIGN_UP_FORM');
export const completeSubmitSignUpForm = createAction('COMPLETE_SUBMIT_SIGN_UP_FORM');

export const updateSignUpFormInput = createAction('UPDATE_SIGN_UP_FORM_INPUT');

export const startSubmitLoginForm = createAction('START_SUBMIT_LOGIN_FORM');
export const failSubmitLoginForm = createAction('FAIL_SUBMIT_LOGIN_FORM');
export const completeSubmitLoginForm = createAction('COMPLETE_SUBMIT_LOGIN_FORM');

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

export const resetAuthState = createAction('RESET_AUTH_STATE');

export function submitSignUpForm() {
    return (dispatch) => {
        dispatch(startSubmitSignUpForm());

        return Promise
            .resolve(true)
            .then(() => dispatch(completeSubmitSignUpForm()))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'An error prevented signing up',
                failSubmitSignUpForm,
            )));
    };
}

export function submitLoginForm() {
    return (dispatch) => {
        dispatch(startSubmitLoginForm());

        return Promise
            .resolve(true)
            .then(() => dispatch(completeSubmitLoginForm()))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'An error prevented logging in',
                failSubmitLoginForm,
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

        return Promise
            .resolve(true)
            .then(() => dispatch(completeSubmitLogOut()))
            .catch(e => dispatch(logErrorAndDispatchFailure(
                e,
                'An error prevented logging out',
                failSubmitLogOut,
            )));
    };
}
