import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';

import ControlledTextInput from './inputs/ControlledTextInput';
import AppGrid from '../containers/AppGrid';
import Button from './Button';
import ShowOnly from './ShowOnly';
import SendResetPasswordEmailForm from './SendResetPasswordEmailForm';

import {
    updateLoginFormEmailAddress,
    updateLoginFormPassword,
    submitLoginForm,
    resetAuthState,
} from '../actions/auth';

import { getValueFromEvent } from '../util/util';

const LOGIN_EMAIL = 'LOGIN_EMAIL';
const LOGIN_PASSWORD = 'LOGIN_PASSWORD';

class LoginForm extends Component {
    componentWillUnmount() {
        return this.props.clearForm();
    }

    render() {
        const {
            email,
            password,
            fetching,
            error,
            updateEmail,
            updatePassword,
            submitForm,
        } = this.props;

        const errorMessages = error && error.length
            ? (
                <ShowOnly
                    showChildren
                    style={{
                        color: 'red',
                        display: 'block',
                        marginBottom: '5px',
                        width: '100%',
                    }}
                >
                    <p>{this.getError()}</p>
                    <ul>
                        {
                            error.map(err => (
                                <li key={err}>
                                    {err}
                                </li>
                            ))
                        }
                    </ul>
                </ShowOnly>)
            : null;

        return (
            <AppGrid title="Log In">
                <Grid item xs={12} sm={7}>
                    <p>
                        You must be a registered user to contribute to the Open
                        Apparel Registry.
                        <br />
                        Don&apos;t have an account?{' '}
                        <Link
                            to="/auth/register"
                            href="/auth/register"
                            className="link-underline"
                        >
                            Register
                        </Link>
                        .
                    </p>
                    {errorMessages}
                    <div className="form__field">
                        <label
                            className="form__label"
                            htmlFor={LOGIN_EMAIL}
                        >
                            Email Address
                        </label>
                        <ControlledTextInput
                            id={LOGIN_EMAIL}
                            type="email"
                            value={email}
                            onChange={updateEmail}
                        />
                    </div>
                    <div className="form__field">
                        <label
                            className="form__label"
                            htmlFor={LOGIN_PASSWORD}
                        >
                            Password
                        </label>
                        <ControlledTextInput
                            id={LOGIN_PASSWORD}
                            type="password"
                            value={password}
                            onChange={updatePassword}
                        />
                    </div>
                    <SendResetPasswordEmailForm />
                    <Button
                        text="Log In"
                        onClick={submitForm}
                        disabled={fetching}
                    />
                </Grid>
            </AppGrid>
        );
    }
}

LoginForm.defaultProps = {
    error: null,
};

LoginForm.propTypes = {
    email: string.isRequired,
    password: string.isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string.isRequired),
    updateEmail: func.isRequired,
    updatePassword: func.isRequired,
    submitForm: func.isRequired,
    clearForm: func.isRequired,
};

function mapStateToProps({
    auth: {
        login: {
            form: {
                email,
                password,
            },
        },
        fetching,
        error,
    },
}) {
    return {
        email,
        password,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateEmail: e => dispatch(updateLoginFormEmailAddress(getValueFromEvent(e))),
        updatePassword: e => dispatch(updateLoginFormPassword(getValueFromEvent(e))),
        submitForm: () => dispatch(submitLoginForm()),
        clearForm: () => dispatch(resetAuthState()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
