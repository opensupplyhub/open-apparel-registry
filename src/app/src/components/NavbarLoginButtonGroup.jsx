import React from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import noop from 'lodash/noop';
import startsWith from 'lodash/startsWith';

import COLOURS from '../util/COLOURS';

import NavbarDropdown from './NavbarDropdown';

import { submitLogOut } from '../actions/auth';

import { setFiltersFromQueryString } from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

import { userPropType } from '../util/propTypes';

import {
    authLoginFormRoute,
    authRegisterFormRoute,
    mainRoute,
    facilitiesRoute,
} from '../util/constants';

import { makeProfileRouteLink } from '../util/util';

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

const createUserDropdownLinks = (user, logoutAction, myFacilitiesAction) => Object.freeze([
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
    Object.freeze({
        text: 'My Facilities',
        type: 'button',
        action: user.contributor_id
            ? () => myFacilitiesAction(user.contributor_id)
            : noop,
    }),
    Object.freeze({
        text: 'Log Out',
        type: 'button',
        action: logoutAction,
    }),
]);

function NavbarLoginButtonGroup({
    user,
    logout,
    sessionFetching,
    navigateToMyFacilities,
}) {
    if (!user || sessionFetching) {
        return (
            <div style={componentStyles.containerStyle}>
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
                links={createUserDropdownLinks(user, logout, navigateToMyFacilities)}
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
    navigateToMyFacilities: func.isRequired,
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
}) {
    return {
        user,
        sessionFetching,
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

            if (pathname !== mainRoute || !startsWith(pathname, facilitiesRoute)) {
                push(facilitiesRoute);
            }
        },
        navigateToMyFacilities: (contributorID) => {
            dispatch(setFiltersFromQueryString(`?contributors=${contributorID}`));
            dispatch(fetchFacilities());

            if (pathname !== facilitiesRoute) {
                push(facilitiesRoute);
            }
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarLoginButtonGroup);
