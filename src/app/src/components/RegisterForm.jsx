import React, { Component } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import memoize from 'lodash/memoize';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import ShowOnly from './ShowOnly';
import Button from './Button';
import RegisterFormField from './RegisterFormField';

import {
    updateSignUpFormInput,
    submitSignUpForm,
    resetAuthFormState,
} from '../actions/auth';

import {
    OTHER,
    registrationFieldsEnum,
    registrationFormFields,
    authLoginFormRoute,
} from '../util/constants';

import {
    registrationFormValuesPropType,
    registrationFormInputHandlersPropType,
} from '../util/propTypes';

import { getStateFromEventForEventType } from '../util/util';

import { formValidationErrorMessageStyle } from '../util/styles';

class RegisterForm extends Component {
    componentDidUpdate({ fetching: wasFetching }) {
        const {
            fetching,
            error,
            history,
        } = this.props;

        if (error) {
            return null;
        }

        if (fetching) {
            return null;
        }

        if (!wasFetching) {
            return null;
        }

        return history.push('/auth/login');
    }

    componentWillUnmount() {
        return this.props.clearForm();
    }

    render() {
        const {
            fetching,
            error,
            form,
            inputUpdates,
            submitForm,
            sessionFetching,
        } = this.props;

        if (sessionFetching) {
            return null;
        }

        const formInputs = registrationFormFields
            .map(field => (
                <RegisterFormField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    type={field.type}
                    link={field.link}
                    hint={field.hint}
                    required={field.required}
                    options={field.options}
                    value={form[field.id]}
                    handleChange={inputUpdates[field.id]}
                    isHidden={
                        form.contributorType !== OTHER &&
                        field.id === registrationFieldsEnum.otherContributorType
                    }
                />));

        return (
            <AppOverflow>
                <AppGrid title="Register">
                    <p>
                        Already have an account?{' '}
                        <Link
                            to={authLoginFormRoute}
                            href={authLoginFormRoute}
                            className="link-underline"
                        >
                            Log In
                        </Link>
                        .
                    </p>
                    <Grid container className="margin-bottom-100">
                        <Grid item xs={12} sm={8}>
                            <p>
                                Thank you for contributing to the OAR. Every
                                contribution further improves the accuracy of the
                                database. Create an account to begin:
                            </p>
                            {formInputs}
                            <ShowOnly when={!!(error && error.length)}>
                                <ul style={formValidationErrorMessageStyle}>
                                    {
                                        error && error.length
                                            ? error.map(err => (
                                                <li key={err}>
                                                    {err}
                                                </li>
                                            ))
                                            : null
                                    }
                                </ul>
                            </ShowOnly>
                            <Button
                                text="Register"
                                onClick={submitForm}
                                disabled={fetching}
                            />
                        </Grid>
                    </Grid>
                </AppGrid>
            </AppOverflow>
        );
    }
}

RegisterForm.defaultProps = {
    error: null,
};

RegisterForm.propTypes = {
    clearForm: func.isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string),
    form: registrationFormValuesPropType.isRequired,
    inputUpdates: registrationFormInputHandlersPropType.isRequired,
    submitForm: func.isRequired,
    sessionFetching: bool.isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
};

function mapStateToProps({
    auth: {
        fetching,
        error,
        session: {
            fetching: sessionFetching,
        },
        signup: {
            form,
        },
    },
}) {
    return {
        fetching,
        error,
        form,
        sessionFetching,
    };
}

const mapDispatchToProps = memoize((dispatch) => {
    const makeInputChangeHandler = (field, getStateFromEvent) => e =>
        dispatch(updateSignUpFormInput({
            value: getStateFromEvent(e),
            field,
        }));

    const inputUpdates = Object
        .values(registrationFieldsEnum)
        .reduce((acc, field) => {
            const { type } = registrationFormFields.find(({ id }) => id === field);
            const getStateFromEvent = getStateFromEventForEventType[type];

            return Object.assign({}, acc, {
                [field]: makeInputChangeHandler(field, getStateFromEvent),
            });
        }, {});

    return {
        inputUpdates,
        submitForm: () => dispatch(submitSignUpForm()),
        clearForm: () => dispatch(resetAuthFormState()),
    };
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
