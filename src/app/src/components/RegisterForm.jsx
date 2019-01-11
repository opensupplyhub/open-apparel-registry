import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import AppGrid from '../containers/AppGrid';
import Checkbox from './inputs/Checkbox';
import ShowOnly from './ShowOnly';
import Button from './Button';
import RegisterFormField from './RegisterFormField';

import {
    updateSignUpFormInput,
    submitSignUpForm,
    resetAuthState,
} from '../actions/auth';

import {
    OTHER,
    registrationFieldsEnum,
    registrationFormFields,
} from '../util/constants';

import {
    registrationFormValuesPropType,
    registrationFormInputHandlersPropType,
} from '../util/propTypes';

import {
    getValueFromEvent,
    getCheckedFromEvent,
} from '../util/util';

class RegisterForm extends Component {
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
        } = this.props;

        const errorMessages = error && error.length
            ? (
                <ShowOnly
                    showChildren
                    style={{
                        display: 'block',
                        fontSize: '12px',
                        margin: '8px 0 0 0',
                        color: '#FF2D55',
                        width: '100%',
                    }}
                >
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

        const formInputs = registrationFormFields
            .map(field => (
                <RegisterFormField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    type={field.type}
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
            <AppGrid title="Register">
                <p>
                    Already have an account?{' '}
                    <Link to="/auth/login" href="/auth/login" className="link-underline">
                        Log In
                    </Link>
                    .
                </p>
                {errorMessages}
                <Grid container className="margin-bottom-100">
                    <Grid item xs={12} sm={8}>
                        <p>
                            Thank you for contributing to the OAR. Every
                            contribution further improves the accuracy of the
                            database. Create an account to begin:
                        </p>
                        {formInputs}
                        <div className="form__field">
                            <Checkbox
                                onChange={inputUpdates[registrationFieldsEnum.newsletter]}
                                text="Sign up for OAR newsletter"
                            />
                            <Checkbox
                                onChange={inputUpdates[registrationFieldsEnum.tos]}
                                text="Agree to "
                                link={{
                                    text: 'Terms of Services',
                                    url: 'https://info.openapparel.org/tos/',
                                }}
                            />
                        </div>
                        <Button
                            text="Register"
                            onClick={submitForm}
                            disabled={fetching}
                        />
                    </Grid>
                </Grid>
            </AppGrid>
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
};

function mapStateToProps({
    auth: {
        fetching,
        error,
        signup: {
            form,
        },
    },
}) {
    return {
        fetching,
        error,
        form,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        inputUpdates: {
            [registrationFieldsEnum.email]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.email,
                })),
            [registrationFieldsEnum.name]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.name,
                })),
            [registrationFieldsEnum.description]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.description,
                })),
            [registrationFieldsEnum.website]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.website,
                })),
            [registrationFieldsEnum.contributorType]: value =>
                dispatch(updateSignUpFormInput({
                    value,
                    field: registrationFieldsEnum.contributorType,
                })),
            [registrationFieldsEnum.otherContributorType]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.otherContributorType,
                })),
            [registrationFieldsEnum.password]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.password,
                })),
            [registrationFieldsEnum.confirmPassword]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.confirmPassword,
                })),
            [registrationFieldsEnum.tos]: e =>
                dispatch(updateSignUpFormInput({
                    value: getCheckedFromEvent(e),
                    field: registrationFieldsEnum.tos,
                })),
            [registrationFieldsEnum.newsletter]: e =>
                dispatch(updateSignUpFormInput({
                    value: getCheckedFromEvent(e),
                    field: registrationFieldsEnum.newsletter,
                })),
        },
        submitForm: () => dispatch(submitSignUpForm()),
        clearForm: () => dispatch(resetAuthState()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
