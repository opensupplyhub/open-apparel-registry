/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import logo from '../styles/images/OAR_Logo.png';
import NavbarDropdown from './NavbarDropdown';
import * as mapActions from '../actions/map';

import NavbarLoginButtonGroup from './NavbarLoginButtonGroup';

import {
    authLoginFormRoute,
    contributeRoute,
} from '../util/constants';

import { userPropType } from '../util/propTypes';

const mapStateToProps = ({ map }) => ({ map });

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(mapActions, dispatch),
});

class Navbar extends PureComponent {
    render() {
        const aboutLinks = [
            {
                text: 'Team',
                url: 'https://info.openapparel.org/team',
                type: 'external',
            },
            {
                text: 'Board & Governance',
                url: 'https://info.openapparel.org/board',
                type: 'external',
            },
        ];

        const reset = () => this.props.actions.selectFactory(null);

        return (
            <AppBar position="static" className="App-header">
                <Toolbar style={{ padding: 0 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginRight: 'auto',
                        }}
                    >
                        <Link to="/" className="navButton" onClick={reset}>
                            HOME
                        </Link>
                        <NavbarDropdown title="ABOUT" links={aboutLinks} />
                        <a
                            target="_blank"
                            className="navButton"
                            rel="noopener noreferrer"
                            href="https://info.openapparel.org/faq/"
                        >
                            FAQs
                        </a>
                        <a
                            target="_blank"
                            className="navButton"
                            rel="noopener noreferrer"
                            href="https://info.openapparel.org/apiinstructions"
                        >
                            API
                        </a>
                        <span>
                            <Link
                                className="navButton"
                                to={this.props.user ? contributeRoute : authLoginFormRoute}
                                href={this.props.user ? contributeRoute : authLoginFormRoute}
                            >
                                CONTRIBUTE
                            </Link>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'middle' }}>
                        <Link to="/" style={{ display: 'inline-flex' }}>
                            <img src={logo} className="App-logo" alt="logo" />
                        </Link>
                    </div>
                    <NavbarLoginButtonGroup />
                </Toolbar>
            </AppBar>
        );
    }
}

Navbar.defaultProps = {
    user: null,
};

Navbar.propTypes = {
    user: userPropType,
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Navbar);
