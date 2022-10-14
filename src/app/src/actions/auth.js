import { createAction } from 'redux-act';
import isEmail from 'validator/lib/isEmail';
import { toast } from 'react-toastify';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeUserLoginURL,
    makeUserLogoutURL,
    makeResetPasswordEmailURL,
    makeResetPasswordConfirmURL,
} from '../util/util';

export const startSubmitSignUpForm = createAction('START_SUBMIT_SIGN_UP_FORM');
export const failSubmitSignUpForm = createAction('FAIL_SUBMIT_SIGN_UP_FORM');
export const completeSubmitSignUpForm = createAction(
    'COMPLETE_SUBMIT_SIGN_UP_FORM',
);

export const updateSignUpFormInput = createAction('UPDATE_SIGN_UP_FORM_INPUT');

export const startSubmitLoginForm = createAction('START_SUBMIT_LOGIN_FORM');
export const failSubmitLoginForm = createAction('FAIL_SUBMIT_LOGIN_FORM');
export const completeSubmitLoginForm = createAction(
    'COMPLETE_SUBMIT_LOGIN_FORM',
);

export const startSessionLogin = createAction('START_SESSION_LOGIN');
export const failSessionLogin = createAction('FAIL_SESSION_LOGIN');
export const completeSessionLogin = createAction('COMPLETE_SESSION_LOGIN');

export const updateLoginFormEmailAddress = createAction(
    'UPDATE_LOGIN_FORM_EMAIL_ADDRESS',
);
export const updateLoginFormPassword = createAction(
    'UPDATE_LOGIN_FORM_PASSWORD',
);

export const startSubmitLogOut = createAction('START_SUBMIT_LOG_OUT');
export const failSubmitLogOut = createAction('FAIL_SUBMIT_LOG_OUT');
export const completeSubmitLogOut = createAction('COMPLETE_SUBMIT_LOG_OUT');

export const startRequestForgotPasswordEmail = createAction(
    'START_REQUEST_FORGOT_PASSWORD_EMAIL',
);
export const failRequestForgotPasswordEmail = createAction(
    'FAIL_REQUEST_FORGOT_PASSWORD_EMAIL',
);
export const completeRequestForgotPasswordEmail = createAction(
    'COMPLETE_REQUEST_FORGOT_PASSWORD_EMAIL',
);

export const openForgotPasswordDialog = createAction(
    'OPEN_FORGOT_PASSWORD_DIALOG',
);
export const closeForgotPasswordDialog = createAction(
    'CLOSE_FORGOT_PASSWORD_DIALOG',
);
export const updateForgotPasswordEmailAddress = createAction(
    'UPDATE_FORGOT_PASSWORD_EMAIL_ADDRESS',
);

export const resetAuthFormState = createAction('RESET_AUTH_FORM_STATE');
export const resetAuthState = createAction('RESET_AUTH_STATE');

export const updateResetPasswordFormUID = createAction(
    'UPDATE_RESET_PASSWORD_FORM_UID',
);
export const updateResetPasswordFormToken = createAction(
    'UPDATE_RESET_PASSWORD_FORM_TOKEN',
);
export const updateResetPasswordFormPassword = createAction(
    'UPDATE_RESET_PASSWORD_FORM_PASSWORD',
);
export const updateResetPasswordFormPasswordConfirmation = createAction(
    'UPDATE_RESET_PASSWORD_FORM_PASSWORD_CONFIRMATION',
);

export const startSubmitResetPasswordForm = createAction(
    'START_SUBMIT_RESET_PASSWORD_FORM',
);
export const failSubmitResetPasswordForm = createAction(
    'FAIL_SUBMIT_RESET_PASSWORD_FORM',
);
export const completeSubmitResetPasswordForm = createAction(
    'COMPLETE_SUBMIT_RESET_PASSWORD_FORM',
);
export const resetResetPasswordFormState = createAction(
    'RESET_RESET_PASSWORD_FORM_STATE',
);

export function submitLoginForm() {
    return (dispatch, getState) => {
        dispatch(startSubmitLoginForm());

        const {
            auth: {
                login: {
                    form: { email, password },
                },
            },
        } = getState();

        if (!email || !password) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'Email and password are required',
                    failSubmitLoginForm,
                ),
            );
        }

        return apiRequest
            .post(makeUserLoginURL(), { email, password })
            .then(({ data }) => dispatch(completeSubmitLoginForm(data)))
            .catch(e =>
                dispatch(
                    logErrorAndDispatchFailure(
                        e,
                        'An error prevented logging in',
                        failSubmitLoginForm,
                    ),
                ),
            );
    };
}

export function sessionLogin() {
    return dispatch => {
        dispatch(startSessionLogin());

        return apiRequest
            .get(makeUserLoginURL())
            .then(({ data }) => dispatch(completeSessionLogin(data)))
            .catch(e =>
                dispatch(
                    logErrorAndDispatchFailure(
                        e,
                        'User was not signed in',
                        failSessionLogin,
                    ),
                ),
            );
    };
}

export function requestForgotPasswordEmail() {
    return (dispatch, getState) => {
        dispatch(startRequestForgotPasswordEmail());

        const {
            auth: {
                forgotPassword: {
                    form: { email },
                },
            },
        } = getState();

        if (!email) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'Email address was not provided',
                    failRequestForgotPasswordEmail,
                ),
            );
        }

        if (!isEmail(email)) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'Email address is invalid',
                    failRequestForgotPasswordEmail,
                ),
            );
        }

        return apiRequest
            .post(makeResetPasswordEmailURL(), { email })
            .then(() => {
                toast('Check your email for password reset instructions');
                return dispatch(completeRequestForgotPasswordEmail());
            })
            .catch(() =>
                dispatch(
                    logErrorAndDispatchFailure(
                        null,
                        'An error prevented sending the forgot password email',
                        failRequestForgotPasswordEmail,
                    ),
                ),
            );
    };
}

export function submitLogOut() {
    return dispatch => {
        dispatch(startSubmitLogOut());

        return apiRequest
            .post(makeUserLogoutURL())
            .then(({ data }) => dispatch(completeSubmitLogOut(data)))
            .catch(e =>
                dispatch(
                    logErrorAndDispatchFailure(
                        e,
                        'An error prevented logging out',
                        failSubmitLogOut,
                    ),
                ),
            );
    };
}

export function submitResetPassword() {
    return (dispatch, getState) => {
        dispatch(startSubmitResetPasswordForm());

        const {
            auth: {
                resetPassword: {
                    uid,
                    token,
                    newPassword,
                    newPasswordConfirmation,
                },
            },
        } = getState();

        if (!uid || !token) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'An error prevented resetting your password',
                    failSubmitResetPasswordForm,
                ),
            );
        }

        if (!newPassword || !newPasswordConfirmation) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'Password and password confirmation fields are required',
                    failSubmitResetPasswordForm,
                ),
            );
        }

        if (newPassword !== newPasswordConfirmation) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    "Password and confirmation don't match",
                    failSubmitResetPasswordForm,
                ),
            );
        }

        return apiRequest
            .post(makeResetPasswordConfirmURL(), {
                uid,
                token,
                new_password1: newPassword,
                new_password2: newPasswordConfirmation,
            })
            .then(() => dispatch(completeSubmitResetPasswordForm()))
            .catch(e =>
                dispatch(
                    logErrorAndDispatchFailure(
                        e,
                        'An error prevented resetting your password',
                        failSubmitResetPasswordForm,
                    ),
                ),
            );
    };
}
