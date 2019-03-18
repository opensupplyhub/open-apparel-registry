import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import ControlledTextInput from './ControlledTextInput';
import AppGrid from './AppGrid';
import Button from './Button';
import ShowOnly from './ShowOnly';

import {
    updateResetPasswordFormUID,
    updateResetPasswordFormToken,
    updateResetPasswordFormPassword,
    updateResetPasswordFormPasswordConfirmation,
    submitResetPassword,
    resetResetPasswordFormState,
} from '../actions/auth';

import { formValidationErrorMessageStyle } from '../util/styles';

import {
    getValueFromEvent,
    getTokenFromQueryString,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import { authLoginFormRoute } from '../util/constants';

const NEW_PASSWORD = 'NEW_PASSWORD';
const CONFIRM_NEW_PASSWORD = 'CONFIRM_NEW_PASSWORD';

class ResetPasswordForm extends Component {
    componentDidMount() {
        this.props.setUID();
        return this.props.setToken();
    }

    componentWillUnmount() {
        return this.props.resetForm();
    }

    render() {
        const {
            newPassword,
            newPasswordConfirmation,
            fetching,
            error,
            confirmationResponse,
            updatePassword,
            updateConfirmPassword,
            submitForm,
            submitFormOnEnterKeyPress,
        } = this.props;

        if (confirmationResponse) {
            return (
                <AppGrid title="Reset Password">
                    <Grid item xs={12} sm={7}>
                        <p>
                            Your password was reset successfully.
                        </p>
                        <br />
                        <Link
                            to={authLoginFormRoute}
                            href={authLoginFormRoute}
                            className="link-underline"
                        >
                            Login
                        </Link>
                    </Grid>
                </AppGrid>
            );
        }

        return (
            <AppGrid title="Reset Password">
                <Grid item xs={12} sm={7}>
                    <div className="form__field">
                        <label
                            className="form__label"
                            htmlFor={NEW_PASSWORD}
                        >
                            New password
                        </label>
                        <ControlledTextInput
                            id={NEW_PASSWORD}
                            type="password"
                            value={newPassword}
                            onChange={updatePassword}
                            submitFormOnEnterKeyPress={submitFormOnEnterKeyPress}
                        />
                    </div>
                    <div className="form__field">
                        <label
                            className="form__label"
                            htmlFor={CONFIRM_NEW_PASSWORD}
                        >
                            Confirm new password
                        </label>
                        <ControlledTextInput
                            id={CONFIRM_NEW_PASSWORD}
                            type="password"
                            value={newPasswordConfirmation}
                            onChange={updateConfirmPassword}
                            submitFormOnEnterKeyPress={submitFormOnEnterKeyPress}
                        />
                    </div>
                    <ShowOnly when={!!(error && error.length)}>
                        <ul style={formValidationErrorMessageStyle}>
                            {
                                error && error.length
                                    ? error.map(err => (
                                        <li key={err}>
                                            {err}
                                        </li>))
                                    : null
                            }
                        </ul>
                    </ShowOnly>
                    <Button
                        text="Reset Password"
                        onClick={submitForm}
                        disabled={fetching}
                    />
                </Grid>
            </AppGrid>
        );
    }
}

ResetPasswordForm.defaultProps = {
    error: null,
};

ResetPasswordForm.propTypes = {
    newPassword: string.isRequired,
    newPasswordConfirmation: string.isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string),
    confirmationResponse: bool.isRequired,
    setUID: func.isRequired,
    setToken: func.isRequired,
    resetForm: func.isRequired,
    updatePassword: func.isRequired,
    updateConfirmPassword: func.isRequired,
    submitForm: func.isRequired,
};

function mapStateToProps({
    auth: {
        resetPassword: {
            newPassword,
            newPasswordConfirmation,
            fetching,
            error,
            confirmationResponse,
        },
    },
}) {
    return {
        newPassword,
        newPasswordConfirmation,
        fetching,
        error,
        confirmationResponse,
    };
}

function mapDispatchToProps(dispatch, {
    match: {
        params: {
            uid,
        },
    },
    history: {
        location: {
            search,
        },
    },
}) {
    return {
        setUID: () => dispatch(updateResetPasswordFormUID(uid)),
        setToken: () =>
            dispatch(updateResetPasswordFormToken(getTokenFromQueryString(search))),
        updatePassword: e =>
            dispatch(updateResetPasswordFormPassword(getValueFromEvent(e))),
        updateConfirmPassword: e =>
            dispatch(updateResetPasswordFormPasswordConfirmation(getValueFromEvent(e))),
        submitForm: () => dispatch(submitResetPassword()),
        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(submitResetPassword()),
        ),
        resetForm: () => dispatch(resetResetPasswordFormState()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPasswordForm);
