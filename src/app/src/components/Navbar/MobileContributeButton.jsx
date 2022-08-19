import React from 'react';
import { bool } from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import startsWith from 'lodash/startsWith';

import { submitLogOut } from '../../actions/auth';
import { userPropType } from '../../util/propTypes';

import {
    authRegisterFormRoute,
    authLoginFormRoute,
    mainRoute,
    facilitiesRoute,
    contributeRoute,
} from '../../util/constants';

import { convertFeatureFlagsObjectToListOfActiveFlags } from '../../util/util';

const styles = {
    contributeButton: {
        border: '1px solid white',
        cursor: 'pointer',
        textTransform: 'uppercase',
        color: '#FFCF3F',
        fontWeight: 'normal',
        padding: '0.5rem 1rem',
        fontSize: '1.5rem',
        textDecoration: 'none',
        borderRadius: '20px',
    },
    loginButton: {
        color: '#0c46e1',
        border: '1px solid white',
        cursor: 'pointer',
        textTransform: 'uppercase',
        fontWeight: 'normal',
        padding: '0.5rem 1rem',
        fontSize: '1.5rem',
        textDecoration: 'none',
        borderRadius: '20px',
    },
};

function MobileContributeButton({
    user,
    sessionFetching,
    featureFlagsFetching,
    onClose,
}) {
    const handleClose = () => {
        onClose();
    };

    if (!user || sessionFetching || featureFlagsFetching) {
        return (
            <>
                <div className="mobile-nav__item mobile-nav__item--button">
                    <Link
                        className="app-header-button"
                        to={authRegisterFormRoute}
                        href={authRegisterFormRoute}
                        disabled={sessionFetching}
                        style={styles.contributeButton}
                        onClick={handleClose}
                    >
                        Register/Contribute
                    </Link>
                </div>
                <div className="mobile-nav__item mobile-nav__item--button">
                    <Link
                        className="button app-header-button"
                        to={authLoginFormRoute}
                        href={authLoginFormRoute}
                        disabled={sessionFetching}
                        style={styles.loginButton}
                        onClick={handleClose}
                    >
                        Login
                    </Link>
                </div>
            </>
        );
    }

    return (
        <div className="mobile-nav__item mobile-nav__item--button">
            <Link
                className="app-header-button"
                to={contributeRoute}
                href={contributeRoute}
                target=""
                style={styles.contributeButton}
                onClick={handleClose}
            >
                Contribute
            </Link>
        </div>
    );
}

MobileContributeButton.defaultProps = {
    user: null,
};

MobileContributeButton.propTypes = {
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
    connect(mapStateToProps, mapDispatchToProps)(MobileContributeButton),
);
