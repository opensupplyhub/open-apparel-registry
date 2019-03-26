import React, { Component } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';

import ControlledTextInput from './ControlledTextInput';
import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import Button from './Button';
import ShowOnly from './ShowOnly';
import SendResetPasswordEmailForm from './SendResetPasswordEmailForm';

import {
    updateLoginFormEmailAddress,
    updateLoginFormPassword,
    submitLoginForm,
    resetAuthFormState,
} from '../actions/auth';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import { userPropType } from '../util/propTypes';

import {
    authRegisterFormRoute,
    facilitiesRoute,
} from '../util/constants';

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
            ? history.push(facilitiesRoute)
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
            submitFormOnEnterKeyPress,
            sessionFetching,
        } = this.props;

        if (sessionFetching) {
            return null;
        }

        return (
            <AppOverflow>
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
                                autoFocus
                                id={LOGIN_EMAIL}
                                type="email"
                                value={email}
                                onChange={updateEmail}
                                submitFormOnEnterKeyPress={submitFormOnEnterKeyPress}
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
                                submitFormOnEnterKeyPress={submitFormOnEnterKeyPress}
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
            </AppOverflow>
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
    submitFormOnEnterKeyPress: func.isRequired,
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
        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(submitLoginForm()),
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
