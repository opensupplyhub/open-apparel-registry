import React, { Component } from 'react';
import PropTypes from 'prop-types';

class BetaAccessLogin extends Component {
    login = () => {
        const { checkAccess } = this.props;
        localStorage.setItem('_betakey_mp', btoa(this.state.password));
        checkAccess();
    };

    updatePassword = (e) => {
        this.setState({ password: e.target.value });
    };

    render() {
        return (
            <div
                style={{
                    width: '450px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: '200px',
                    border: '1px solid grey',
                    padding: '40px',
                }}
            >
                <h2>Open Apparel Registry Beta</h2>
                <p>
                    In order to access this beta, please enter the password
                    provided to you by an administrator.
                </p>
                <input
                    type="password"
                    onChange={this.updatePassword}
                    placeholder="Password"
                    style={{
                        width: '350px',
                        height: '20px',
                        border: '1px solid grey',
                        paddingLeft: '10px',
                    }}
                />
                <button
                    onClick={this.login}
                    style={{ float: 'right', height: '24px' }}
                    type="button"
                >
                    Enter Beta
                </button>
            </div>
        );
    }
}

BetaAccessLogin.propTypes = {
    checkAccess: PropTypes.func.isRequired,
};

export default BetaAccessLogin;
