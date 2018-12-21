import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Checkbox from '../components/inputs/Checkbox';
import AppGrid from './AppGrid';
import TextInput from '../components/inputs/TextInput';
import ShowOnly from '../components/ShowOnly';
import Button from '../components/Button';
import SelectInput from '../components/inputs/SelectInput';
import * as userActions from '../actions/user';

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(userActions, dispatch),
});

const contributorTypeOptions = [
    'Auditor',
    'Brand/Retailer',
    'Civil Society Organization',
    'Factory / Facility',
    'Manufacturing Group / Supplier / Vendor',
    'Multi Stakeholder Initiative',
    'Researcher / Academic',
    'Service Provider',
    'Union',
    'Other',
];

class AuthRegister extends Component {
    state = {
        email: '',
        name: '',
        description: '',
        website: '',
        password: '',
        confirmPassword: '',
        contributorType: '',
        otherContributor: '',
        error: {},
        newsletterOptIn: false,
        termsOptIn: false,
        emailBlur: false,
        nameBlur: false,
        descriptionBlur: false,
        passwordBlur: false,
        confirmPasswordBlur: false,
        contributorTypeBlur: false,
    };

    componentWillUpdate({ user }) {
        const { history } = this.props;

        if (user.loaded) {
            history.push(`/profile/${user.uid}`);
        }
    }

    onBlurInputField = field => () => {
        const attribute = {};
        attribute[field] = true;
        this.setState(attribute);
    };

    getError = () => {
        const {
            error: { code },
        } = this.state;
        const errorMap = {
            'auth/email-already-in-use':
                'The email address you entered is already in use by another account',
        };

        return errorMap[code];
    };

    getErrorElement = () => (
        <p className="form__error">This field is required.</p>
    );

    updateInputField = field => (event) => {
        const attribute = {};
        attribute[field] = event.target.value;

        this.setState(attribute);
    };

    updateCheckbox = field => () => {
        const attribute = {};
        attribute[field] = !this.state[field];

        this.setState(attribute);
    };

    register = () => {
        const {
            email,
            name,
            password,
            description,
            website,
            contributorType,
            otherContributor,
            newsletterOptIn,
            termsOptIn,
        } = this.state;

        const {
            actions: { createUser },
        } = this.props;
        createUser({
            email,
            name,
            password,
            description,
            website,
            contributorType,
            otherContributor,
            newsletterOptIn,
            termsOptIn,
        }).catch(error => this.setState({ error }));
    };

    formValid = () =>
        [
            'email',
            'name',
            'description',
            'password',
            'confirmPassword',
            'contributorType',
            'termsOptIn',
        ].every(key => this.state[key]) &&
        this.state.password === this.state.confirmPassword;

    render() {
        const {
            error,
            contributorType,
            contributorTypeBlur,
            emailBlur,
            email,
            nameBlur,
            name,
            description,
            descriptionBlur,
            confirmPasswordBlur,
            confirmPassword,
            passwordBlur,
            password,
        } = this.state;

        return (
            <AppGrid title="Register">
                <p>
                    Already have an account?{' '}
                    <Link to="/auth/login" className="link-underline">
                        Log In
                    </Link>
                    .
                </p>
                <ShowOnly
                    if={!!error}
                    style={{
                        display: 'block',
                        fontSize: '12px',
                        margin: '8px 0 0 0',
                        color: '#FF2D55',
                        width: '100%',
                    }}
                >
                    <p>{this.getError()}</p>
                </ShowOnly>
                <Grid container className="margin-bottom-100">
                    <Grid item xs={12} sm={8}>
                        <p>
                            Thank you for contributing to the OAR. Every
                            contribution further improves the accuracy of the
                            database. Create an account to begin:
                        </p>
                        <div className="form__field">
                            <p className="form__label">
                                Email Address{' '}
                                <span style={{ color: 'red' }}>*</span>
                            </p>
                            <TextInput
                                type="email"
                                placeholder=""
                                onChange={this.updateInputField('email')}
                                onBlur={this.onBlurInputField('emailBlur')}
                            />
                            {emailBlur && !email && this.getErrorElement()}
                        </div>
                        <div className="form__field">
                            <p className="form__label">
                                Account Name{' '}
                                <span style={{ color: 'red' }}>*</span>
                            </p>
                            <TextInput
                                placeholder=""
                                hint="Your account name will appear as the contributor name on all facilities that you upload as the data source for each facility contributed."
                                onChange={this.updateInputField('name')}
                                onBlur={this.onBlurInputField('nameBlur')}
                            />
                            {nameBlur && !name && this.getErrorElement()}
                        </div>
                        <div className="form__field">
                            <p className="form__label">
                                Account Description{' '}
                                <span style={{ color: 'red' }}>*</span>
                            </p>
                            <TextInput
                                placeholder=""
                                hint="Enter a description of your account. This will appear in your account profile."
                                onChange={this.updateInputField('description')}
                                onBlur={this.onBlurInputField('descriptionBlur')}
                            />
                            {descriptionBlur &&
                                !description &&
                                this.getErrorElement()}
                        </div>
                        <div className="form__field">
                            <p className="form__label">Website (optional)</p>
                            <TextInput
                                placeholder="Website"
                                onChange={this.updateInputField('website')}
                            />
                        </div>
                        <div className="form__field">
                            <p className="form__label">
                                Contributor Type{' '}
                                <span style={{ color: 'red' }}>*</span>
                            </p>
                            <SelectInput
                                onChange={this.updateInputField('contributorType')}
                                options={contributorTypeOptions}
                                placeholder=" "
                                onBlur={this.onBlurInputField('descriptionBlur')}
                            />
                            {contributorTypeBlur &&
                                !contributorType &&
                                this.getErrorElement()}
                            <ShowOnly if={contributorType === 'Other'}>
                                <p className="form__label">
                                    Other Contributor Type
                                </p>
                                <TextInput
                                    placeholder="Please specify"
                                    onChange={this.updateInputField('otherContributor')}
                                />
                            </ShowOnly>
                        </div>
                        <div className="form__field">
                            <p className="form__label">
                                Password <span style={{ color: 'red' }}>*</span>
                            </p>
                            <TextInput
                                type="password"
                                placeholder="Password"
                                onChange={this.updateInputField('password')}
                                onBlur={this.onBlurInputField('passwordBlur')}
                            />
                            {passwordBlur &&
                                !password &&
                                this.getErrorElement()}
                        </div>
                        <div className="form__field">
                            <p className="form__label">
                                Confirm Password{' '}
                                <span style={{ color: 'red' }}>*</span>
                            </p>
                            <TextInput
                                type="password"
                                placeholder="Confirm Password"
                                onChange={this.updateInputField('confirmPassword')}
                                onBlur={this.onBlurInputField('confirmPasswordBlur')}
                            />
                            {confirmPasswordBlur &&
                                !confirmPassword &&
                                this.getErrorElement()}
                        </div>
                        <div className="form__field">
                            <Checkbox
                                onChange={this.updateCheckbox('newsletterOptIn')}
                                text="Sign up for OAR newsletter"
                            />
                            <Checkbox
                                onChange={this.updateCheckbox('termsOptIn')}
                                text="Agree to "
                                link={{
                                    text: 'Terms of Services',
                                    url: 'https://info.openapparel.org/tos/',
                                }}
                            />
                        </div>
                        <Button
                            text="Register"
                            onClick={this.register}
                            disabled={!this.formValid()}
                        />
                    </Grid>
                </Grid>
            </AppGrid>
        );
    }
}

AuthRegister.propTypes = {
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AuthRegister);
