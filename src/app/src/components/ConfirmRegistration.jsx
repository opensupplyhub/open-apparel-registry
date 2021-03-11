import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import ShowOnly from './ShowOnly';

import {
    confirmAccountRegistration,
    resetConfirmAccountRegistration,
} from '../actions/auth';

import {
    authLoginFormRoute,
    contributeRoute,
    facilitiesRoute,
} from '../util/constants';

const confirmRegistrationStyles = Object.freeze({
    loadingStyles: Object.freeze({}),
    errorStyles: Object.freeze({
        color: 'red',
    }),
    successStyles: Object.freeze({}),
    nextLinkStyles: Object.freeze({
        padding: '1rem 0',
    }),
});

class ConfirmRegistration extends Component {
    componentDidMount() {
        return this.props.confirmRegistration();
    }

    componentWillUnmount() {
        return this.props.resetRegistration();
    }

    render() {
        const { error, fetching, hasLoggedInDuringSameSession } = this.props;

        const insetComponent = (() => {
            if (fetching) {
                return (
                    <div style={confirmRegistrationStyles.loadingStyles}>
                        <CircularProgress />
                    </div>
                );
            }

            if (error && error.length) {
                return (
                    <ul style={confirmRegistrationStyles.errorStyles}>
                        {error.map(err => (
                            <li key={err}>{err}</li>
                        ))}
                    </ul>
                );
            }

            return (
                <div style={confirmRegistrationStyles.successStyles}>
                    <div>Account was succesfully confirmed!</div>
                    <ShowOnly when={hasLoggedInDuringSameSession}>
                        <div style={confirmRegistrationStyles.nextLinkStyles}>
                            You can
                            <ul>
                                <li>
                                    <Link
                                        to={contributeRoute}
                                        href={contributeRoute}
                                    >
                                        Contribute a list of facilities
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to={facilitiesRoute}
                                        href={facilitiesRoute}
                                    >
                                        Search the existing facilities
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </ShowOnly>
                    <ShowOnly when={!hasLoggedInDuringSameSession}>
                        <Link href={authLoginFormRoute} to={authLoginFormRoute}>
                            Click here to log in
                        </Link>
                    </ShowOnly>
                </div>
            );
        })();

        return (
            <AppOverflow>
                <AppGrid title="Confirm account">
                    <Grid item xs={12} sm={7}>
                        {insetComponent}
                    </Grid>
                </AppGrid>
            </AppOverflow>
        );
    }
}

ConfirmRegistration.defaultProps = {
    error: null,
};

ConfirmRegistration.propTypes = {
    fetching: bool.isRequired,
    error: arrayOf(string),
    confirmRegistration: func.isRequired,
    resetRegistration: func.isRequired,
    hasLoggedInDuringSameSession: bool.isRequired,
};

function mapStateToProps({
    auth: {
        confirmRegistration: { fetching, error },
        session: { fetching: sessionFetching },
        user: { user },
    },
}) {
    return {
        fetching: fetching && sessionFetching,
        error,
        hasLoggedInDuringSameSession: !!user,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { uid },
        },
    },
) {
    return {
        confirmRegistration: () => dispatch(confirmAccountRegistration(uid)),
        resetRegistration: () => dispatch(resetConfirmAccountRegistration()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ConfirmRegistration);
