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
import { BackButtonArrowLeft, MobileSubmenuButtonArrowRight } from './navIcons';
import MobileNavSubmenuColumnSection from './MobileNavSubmenuColumnSection';

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
                className="mobile-nav-link"
                href={authLoginFormRoute}
                disabled={sessionFetching}
            >
                Login/Register
            </a>
        );
    }

    return (
        <>
            <button
                type="button"
                className="mobile-nav-submenu-button"
                onClick={toggleActive}
            >
                <span className="">
                    <AccountCircleIcon
                        fontSize="large"
                        style={{ verticalAlign: 'middle' }}
                    />
                    <span
                        style={{ marginLeft: '.5rem', verticalAlign: 'middle' }}
                    >
                        My Account
                    </span>
                </span>

                <MobileSubmenuButtonArrowRight />
            </button>

            <div
                className="mobile-nav-submenu"
                style={
                    isActive
                        ? { width: '100%', height: 'auto', left: '100%' }
                        : {}
                }
            >
                <button
                    type="button"
                    className="mobile-nav-back-button"
                    onClick={setInactive}
                >
                    <BackButtonArrowLeft />
                    <span>Back</span>
                </button>

                <MobileNavSubmenuColumnSection
                    columnSection={{
                        label: 'User Links',
                        items: createUserDropdownLinks(
                            user,
                            logout,
                            activeFeatureFlags,
                        ).map(item => ({
                            ...item,
                            type: 'link',
                            internal: true,
                        })),
                    }}
                    startOpen
                />
            </div>
        </>
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
