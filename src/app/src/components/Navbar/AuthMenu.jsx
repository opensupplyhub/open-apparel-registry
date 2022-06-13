import React from 'react';
import { bool } from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import startsWith from 'lodash/startsWith';

import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { submitLogOut } from '../../actions/auth';
import COLOURS from '../../util/COLOURS';
import {
    authLoginFormRoute,
    authRegisterFormRoute,
    mainRoute,
    facilitiesRoute,
    contributeRoute,
    createUserDropdownLinks,
} from '../../util/constants';
import { userPropType } from '../../util/propTypes';
import { convertFeatureFlagsObjectToListOfActiveFlags } from '../../util/util';

const styles = {
    profileButton: {
        color: COLOURS.NEAR_BLACK,
        marginRight: '1rem',
    },
    contributeButton: {
        fontFamily: 'inherit',
        cursor: 'pointer',
        border: `1px solid ${COLOURS.NEAR_BLACK}`,
        fontSize: '0.875rem',
        letterSpacing: '0.125rem',
        textDecoration: 'none',
        textTransform: 'uppercase',
        color: 'inherit',
        padding: '8px 16px',
        borderRadius: '20px',
        marginRight: '1rem',
        marginLeft: '1rem',
    },
    loginButton: {
        fontFamily: 'inherit',
        cursor: 'pointer',
        border: '1px solid white',
        fontSize: '0.875rem',
        letterSpacing: '0.125rem',
        textDecoration: 'none',
        textTransform: 'uppercase',
        color: COLOURS.NEAR_BLACK,
        padding: '8px 16px',
        borderRadius: '20px',
        backgroundColor: 'white',
        marginRight: '1rem',
    },
    submenuButton: {
        fontFamily: 'inherit',
        cursor: 'pointer',
        border: '1px solid white',
        fontSize: '0.875rem',
        letterSpacing: '0.125rem',
        textDecoration: 'none',
        textTransform: 'uppercase',
        color: COLOURS.NEAR_BLACK,
        fontWeight: 'normal',
    },
};

function AuthMenu({
    user,
    logout,
    sessionFetching,
    featureFlagsFetching,
    activeSubmenu,
    setActiveSubmenu,
    activeFeatureFlags,
}) {
    const title = 'auth';
    const isActive = activeSubmenu === title;
    const toggleSubmenu = () =>
        isActive ? setActiveSubmenu(null) : setActiveSubmenu(title);

    const navSubmenuStyle = isActive
        ? { height: 'auto', opacity: 1 }
        : { height: 0, opacity: 0 };

    const links = createUserDropdownLinks(user, logout, activeFeatureFlags);

    const renderLink = ({ text, url, type, action }) => {
        if (type === 'link') {
            return (
                <Link
                    className="nav__link nav__link--level-2"
                    href={url}
                    to={url}
                    key={text}
                    target=""
                    onClick={() => {
                        setActiveSubmenu(null);
                    }}
                >
                    {text}
                </Link>
            );
        }
        if (type === 'button') {
            return (
                <Button
                    type="button"
                    onClick={() => {
                        setActiveSubmenu(null);
                        action();
                    }}
                    className="nav__link nav__link--level-2"
                    key={text}
                    style={styles.submenuButton}
                >
                    {text}
                </Button>
            );
        }
        return null;
    };

    if (!user || sessionFetching || featureFlagsFetching) {
        return (
            <>
                <Link
                    className="app-header-button"
                    style={styles.contributeButton}
                    to={authRegisterFormRoute}
                    href={authRegisterFormRoute}
                    disabled={sessionFetching}
                >
                    Register/Contribute
                </Link>
                <Link
                    className="app-header-button"
                    to={authLoginFormRoute}
                    href={authLoginFormRoute}
                    disabled={sessionFetching}
                    style={styles.loginButton}
                >
                    Login
                </Link>
            </>
        );
    }

    return (
        <>
            <div
                className="nav__parent"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Link
                    className="app-header-button"
                    style={styles.contributeButton}
                    to={contributeRoute}
                    href={contributeRoute}
                >
                    Contribute
                </Link>
            </div>
            <div
                className={`nav__parent ${isActive && 'nav-submenu-is-active'}`}
            >
                <IconButton
                    className="nav__link"
                    style={styles.profileButton}
                    onClick={toggleSubmenu}
                >
                    <AccountCircleIcon fontSize="large" />
                </IconButton>
                <div className="nav__submenu" style={navSubmenuStyle}>
                    {links.map(renderLink)}
                </div>
            </div>
        </>
    );
}

AuthMenu.defaultProps = {
    user: null,
};

AuthMenu.propTypes = {
    user: userPropType,
    sessionFetching: bool.isRequired,
    featureFlagsFetching: bool.isRequired,
};

function mapStateToProps({
    auth: {
        user: { user },
        session: { fetching: sessionFetching },
    },
    featureFlags: { fetching: featureFlagsFetching, flags },
}) {
    return {
        user,
        sessionFetching,
        featureFlagsFetching,
        activeFeatureFlags: convertFeatureFlagsObjectToListOfActiveFlags(flags),
    };
}

function mapDispatchToProps(
    dispatch,
    {
        history: {
            push,
            location: { pathname },
        },
    },
) {
    return {
        logout: () => {
            dispatch(submitLogOut());

            if (
                pathname !== mainRoute &&
                !startsWith(pathname, facilitiesRoute)
            ) {
                push(facilitiesRoute);
            }
        },
    };
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(AuthMenu),
);
