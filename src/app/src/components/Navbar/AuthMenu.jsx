import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import startsWith from 'lodash/startsWith';

import AccountCircleIcon from '@material-ui/icons/AccountCircleOutlined';

import { submitLogOut } from '../../actions/auth';
import {
    authLoginFormRoute,
    mainRoute,
    facilitiesRoute,
    createUserDropdownLinks,
} from '../../util/constants';
import { convertFeatureFlagsObjectToListOfActiveFlags } from '../../util/util';
import { SubmenuButtonArrow } from './navIcons';
import NavSubmenu from './NavSubmenu';

function AuthMenu({
    user,
    logout,
    sessionFetching,
    featureFlagsFetching,
    isActive,
    setActive,
    setInactive,
    activeFeatureFlags,
}) {
    const toggleActive = isActive ? setInactive : setActive;

    if (!user || sessionFetching || featureFlagsFetching) {
        return (
            <a
                className="nav-link"
                href={authLoginFormRoute}
                disabled={sessionFetching}
            >
                Login/Register
            </a>
        );
    }

    return (
        <div className="auth-menu">
            <button
                type="button"
                className="nav-submenu-button"
                onClick={toggleActive}
            >
                <span className="nav-submenu-button__text">
                    <AccountCircleIcon fontSize="large" />
                </span>
                <span
                    className="nav-submenu-button__text"
                    style={{ marginLeft: '.75rem' }}
                >
                    My Account
                </span>
                <SubmenuButtonArrow />
            </button>

            <NavSubmenu
                open={isActive}
                columns={createUserDropdownLinks(
                    user,
                    logout,
                    activeFeatureFlags,
                ).map(item => [
                    {
                        label: '',
                        items: [{ ...item, type: 'auth-button' }],
                    },
                ])}
            />
        </div>
    );
}

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
