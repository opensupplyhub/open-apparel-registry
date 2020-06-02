import React from 'react';
import { arrayOf, bool, func } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import startsWith from 'lodash/startsWith';
import includes from 'lodash/includes';

import COLOURS from '../util/COLOURS';

import NavbarDropdown from './NavbarDropdown';

import { submitLogOut } from '../actions/auth';

import { userPropType, featureFlagPropType } from '../util/propTypes';

import {
    authLoginFormRoute,
    authRegisterFormRoute,
    mainRoute,
    facilitiesRoute,
    dashboardRoute,
    CLAIM_A_FACILITY,
} from '../util/constants';

import {
    makeProfileRouteLink,
    checkWhetherUserHasDashboardAccess,
    convertFeatureFlagsObjectToListOfActiveFlags,
} from '../util/util';

const componentStyles = Object.freeze({
    containerStyle: Object.freeze({
        display: 'flex',
        overflow: 'auto',
    }),
    logoContainer: Object.freeze({
        borderRadius: '100%',
        width: '40px',
        height: '40px',
        border: '2px solid',
        borderColor: COLOURS.GREY,
        marginRight: '10px',
        display: 'inline-flex',
        justifyContent: 'middle',
        overflow: 'hidden',
        cursor: 'pointer',
    }),
    logoSpacer: Object.freeze({
        width: '30px',
        height: '30px',
        marginTop: '5px',
        marginLeft: '5px',
        display: 'inline-flex',
    }),
    logo: Object.freeze({
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '100%',
    }),
});

const createUserDropdownLinks = (user, logoutAction, activeFeatureFlags) => {
    const dashboardLink = checkWhetherUserHasDashboardAccess(user)
        ? Object.freeze([
            Object.freeze({
                text: 'Dashboard',
                url: dashboardRoute,
                type: 'link',
            }),
        ])
        : [];

    const userLinks = Object.freeze([
        Object.freeze({
            text: 'My Profile',
            url: makeProfileRouteLink(user.id),
            type: 'link',
        }),
        Object.freeze({
            text: 'My Lists',
            url: '/lists',
            type: 'link',
        }),
    ]);

    const claimedFacilityLinks = includes(activeFeatureFlags, CLAIM_A_FACILITY)
        ? Object.freeze([
            Object.freeze({
                text: 'My Facilities',
                url: '/claimed',
                type: 'link',
            }),
        ])
        : [];

    const logoutLinks = Object.freeze([
        Object.freeze({
            text: 'Log Out',
            type: 'button',
            action: logoutAction,
        }),
    ]);

    return dashboardLink.concat(userLinks).concat(claimedFacilityLinks).concat(logoutLinks);
};

function NavbarLoginButtonGroup({
    user,
    logout,
    sessionFetching,
    featureFlagsFetching,
    activeFeatureFlags,
}) {
    if (!user || sessionFetching || featureFlagsFetching) {
        return (
            <div style={componentStyles.containerStyle} className='NavbarLoginButtonGroup'>
                <Link
                    to={authRegisterFormRoute}
                    href={authRegisterFormRoute}
                    className="navButton"
                    disabled={sessionFetching}
                >
                    REGISTER
                </Link>
                <Link
                    to={authLoginFormRoute}
                    href={authLoginFormRoute}
                    className="navButton"
                    disabled={sessionFetching}
                >
                    LOG IN
                </Link>
            </div>
        );
    }

    return (
        <div style={componentStyles.containerStyle}>
            <NavbarDropdown
                title={user.name}
                links={createUserDropdownLinks(user, logout, activeFeatureFlags)}
            />
        </div>
    );
}

NavbarLoginButtonGroup.defaultProps = {
    user: null,
};

NavbarLoginButtonGroup.propTypes = {
    user: userPropType,
    logout: func.isRequired,
    sessionFetching: bool.isRequired,
    featureFlagsFetching: bool.isRequired,
    activeFeatureFlags: arrayOf(featureFlagPropType).isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
        session: {
            fetching: sessionFetching,
        },
    },
    featureFlags: {
        fetching: featureFlagsFetching,
        flags,
    },
}) {
    return {
        user,
        sessionFetching,
        featureFlagsFetching,
        activeFeatureFlags: convertFeatureFlagsObjectToListOfActiveFlags(flags),
    };
}

function mapDispatchToProps(dispatch, {
    history: {
        push,
        location: {
            pathname,
        },
    },
}) {
    return {
        logout: () => {
            dispatch(submitLogOut());

            if (pathname !== mainRoute && !startsWith(pathname, facilitiesRoute)) {
                push(facilitiesRoute);
            }
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarLoginButtonGroup);
