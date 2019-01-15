import React, { Component } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';

import ControlledTextInput from './ControlledTextInput';
import AppGrid from '../containers/AppGrid';
import Button from './Button';
import ShowOnly from './ShowOnly';
import SendResetPasswordEmailForm from './SendResetPasswordEmailForm';

import {
    updateLoginFormEmailAddress,
    updateLoginFormPassword,
    submitLoginForm,
    resetAuthFormState,
} from '../actions/auth';

import { getValueFromEvent } from '../util/util';

import { userPropType } from '../util/propTypes';

import { authRegisterFormRoute } from '../util/constants';

import { formValidationErrorMessageStyle } from '../util/styles';

const LOGIN_EMAIL = 'LOGIN_EMAIL';
const LOGIN_PASSWORD = 'LOGIN_PASSWORD';

class LoginForm extends Component {
    componentDidUpdate() {
        const {
            user,
            history,
        } = this.props;

        return user
            ? history.push(`/profile/${user.id}`)
            : null;
    }

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
            sessionFetching,
        } = this.props;

        if (sessionFetching) {
            return null;
        }

        return (
            <AppGrid title="Log In">
                <Grid item xs={12} sm={7}>
                    <p>
                        You must be a registered user to contribute to the Open
                        Apparel Registry.
                        <br />
                        Don&apos;t have an account?{' '}
                        <Link
                            to={authRegisterFormRoute}
                            href={authRegisterFormRoute}
                            className="link-underline"
                        >
                            Register
                        </Link>
                        .
                    </p>
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
    user: null,
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
    user: userPropType,
    history: shape({
        push: func.isRequired,
    }).isRequired,
    sessionFetching: bool.isRequired,
};

function mapStateToProps({
    auth: {
        login: {
            form: {
                email,
                password,
            },
        },
        user: {
            user,
        },
        session: {
            fetching: sessionFetching,
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
        user,
        sessionFetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateEmail: e => dispatch(updateLoginFormEmailAddress(getValueFromEvent(e))),
        updatePassword: e => dispatch(updateLoginFormPassword(getValueFromEvent(e))),
        submitForm: () => dispatch(submitLoginForm()),
        clearForm: () => dispatch(resetAuthFormState()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
