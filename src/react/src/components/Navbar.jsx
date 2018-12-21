import React, { PureComponent } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import logo from '../styles/images/OAR_Logo.png';
import LoggedInBadge from './LoggedInBadge';
import Translate from './Translate';
import NavbarDropdown from './NavbarDropdown';
import * as mapActions from '../actions/map';

const mapStateToProps = ({ map }) => ({ map });

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(mapActions, dispatch),
});

class Navbar extends PureComponent {
    render() {
        const { user } = this.props;
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
                            {user.loaded ? (
                                <Link to="/contribute" className="navButton">
                                    CONTRIBUTE
                                </Link>
                            ) : (
                                <Link to="/auth/login" className="navButton">
                                    CONTRIBUTE
                                </Link>
                            )}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'middle' }}>
                        <Link to="/" style={{ display: 'inline-flex' }}>
                            <img src={logo} className="App-logo" alt="logo" />
                        </Link>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginLeft: 'auto',
                            overflow: 'auto',
                        }}
                    >
                        {user.loaded ? (
                            <LoggedInBadge />
                        ) : (
                            <div style={{ display: 'flex' }}>
                                <Translate />
                                <Link to="/auth/register" className="navButton">
                                    REGISTER
                                </Link>
                                <Link to="/auth/login" className="navButton">
                                    LOG IN
                                </Link>
                            </div>
                        )}
                    </div>
                </Toolbar>
            </AppBar>
        );
    }
}

Navbar.propTypes = {
    user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Navbar);
