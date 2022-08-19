import React from 'react';
import { bool } from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import startsWith from 'lodash/startsWith';

import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { submitLogOut } from '../../actions/auth';
import { userPropType } from '../../util/propTypes';

import {
    mainRoute,
    facilitiesRoute,
    MOBILE_HEADER_HEIGHT,
    createUserDropdownLinks,
} from '../../util/constants';

import { convertFeatureFlagsObjectToListOfActiveFlags } from '../../util/util';
import COLOURS from '../../util/COLOURS';

const styles = {
    mobileNavActive: {
        left: 0,
        width: '100%',
        top: MOBILE_HEADER_HEIGHT,
        opacity: 1,
    },
    mobileNavInactive: { left: '100%', opacity: 0 },
    profileButton: {
        color: COLOURS.NEAR_BLACK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        fontSize: '1.5rem',
    },
    submenuButton: {
        cursor: 'pointer',
        textTransform: 'uppercase',
        color: 'white',
        fontWeight: 'normal',
        padding: '1.5rem 1rem',
        fontSize: '1.5rem',
        width: '100%',
        justifyContent: 'flex-start',
    },
};

function AuthMenu({
    user,
    logout,
    sessionFetching,
    featureFlagsFetching,
    activeFeatureFlags,
    mobileNavActive,
    setMobileNavActive,
}) {
    const title = 'auth';
    const isActive = mobileNavActive === title;
    const handleClose = () => setMobileNavActive(null);
    const toggleNav = () =>
        isActive ? handleClose() : setMobileNavActive(title);
    const links = createUserDropdownLinks(user, logout, activeFeatureFlags);

    const renderLink = ({ text, url, type, action }) => {
        if (type === 'link') {
            return (
                <div className="mobile-nav__item" key={url}>
                    <Link
                        className="mobile-nav__link"
                        href={url}
                        to={url}
                        key={text}
                        target=""
                        onClick={handleClose}
                    >
                        <span>{text}</span>
                    </Link>
                </div>
            );
        }
        if (type === 'button') {
            return (
                <div className="mobile-nav__item " key={text}>
                    <Button
                        type="button"
                        onClick={() => {
                            handleClose();
                            action();
                        }}
                        style={styles.submenuButton}
                    >
                        {text}
                    </Button>
                </div>
            );
        }
        return null;
    };

    if (!user || sessionFetching || featureFlagsFetching) {
        return null;
    }

    return (
        <>
            {!mobileNavActive && (
                <IconButton
                    className="nav__link mobile-auth"
                    style={styles.profileButton}
                    onClick={toggleNav}
                >
                    <AccountCircleIcon fontSize="large" />
                </IconButton>
            )}
            <nav
                className="mobile-nav"
                id="mobile-nav"
                role="navigation"
                style={
                    isActive ? styles.mobileNavActive : styles.mobileNavInactive
                }
            >
                {links.map(renderLink)}
            </nav>
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
