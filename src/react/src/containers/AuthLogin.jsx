import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ResetPwEmail from '../components/ResetPwEmail';
import TextInput from '../components/inputs/TextInput';
import * as userActions from '../actions/user';
import AppGrid from './AppGrid';
import Button from '../components/Button';
import ShowOnly from '../components/ShowOnly';

const mapStateToProps = state => ({
    user: state.user,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(userActions, dispatch),
});

class AuthLogin extends Component {
    state = {
        email: '',
        password: '',
        error: {},
    };

    componentWillUpdate({ user }) {
        const { history } = this.props;
        if (user.loaded) {
            history.push(`/profile/${user.uid}`);
        }
    }

    getError = () => {
        const {
            error: { code },
        } = this.state;
        const errorMap = {
            'auth/wrong-password':
                'The username and/or password you provided is incorrect.',
            'auth/user-not-found':
                'A user with the specified email does not exist.',
        };

        return errorMap[code];
    };

    formValid = () => Object.keys(this.state).every(key => this.state[key]);

    login = () => {
        const {
            actions: { logIn },
        } = this.props;
        const { password, email } = this.state;
        logIn(email, password).catch(error => this.setState({ error }));
    };

    updateInputField = field => (event) => {
        const attribute = {};
        attribute[field] = event.target.value;

        this.setState(attribute);
    };

    render() {
        const { error } = this.state;

        return (
            <AppGrid title="Log In">
                <p>
                    You must be a registered user to contribute to the Open
                    Apparel Registry.
                    <br />
                    Don&apos;t have an account?{' '}
                    <Link to="/auth/register" className="link-underline">
                        Register
                    </Link>
                    .
                </p>
                <ShowOnly
                    if={!!error}
                    style={{
                        color: 'red',
                        display: 'block',
                        marginBottom: '5px',
                        width: '100%',
                    }}
                >
                    <p>{this.getError()}</p>
                </ShowOnly>
                <Grid item xs={12} sm={7}>
                    <div className="form__field">
                        <p className="form__label">Email Address</p>
                        <TextInput
                            type="email"
                            placeholder="Email Address"
                            onChange={this.updateInputField('email')}
                        />
                    </div>
                    <div className="form__field">
                        <p className="form__label">Password</p>
                        <TextInput
                            type="password"
                            placeholder="Password"
                            onChange={this.updateInputField('password')}
                        />
                    </div>
                    <ResetPwEmail />
                    <Button
                        text="Log In"
                        onClick={this.login}
                        disabled={!this.formValid()}
                    />
                </Grid>
            </AppGrid>
        );
    }
}

AuthLogin.propTypes = {
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AuthLogin);
