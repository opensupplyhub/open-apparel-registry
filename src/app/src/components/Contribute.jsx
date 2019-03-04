import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bool } from 'prop-types';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import ContributeHeader from './ContributeHeader';
import ContributeForm from './ContributeForm';
import ContributeTroubleshooting from './ContributeTroubleshooting';

import {
    listsRoute,
    authLoginFormRoute,
} from '../util/constants';

function ContributeList({
    userHasSignedIn,
    fetchingSessionSignIn,
}) {
    if (fetchingSessionSignIn) {
        return (
            <AppGrid title="Contribute">
                <Grid container className="margin-bottom-64">
                    <Grid item xs={12}>
                        <CircularProgress />
                    </Grid>
                </Grid>
            </AppGrid>
        );
    }

    if (!userHasSignedIn) {
        return (
            <AppGrid title="Contribute">
                <Grid container className="margin-bottom-64">
                    <Grid item xs={12}>
                        <Link
                            to={authLoginFormRoute}
                            href={authLoginFormRoute}
                        >
                            Log in to contribute to Open Apparel Registry
                        </Link>
                    </Grid>
                </Grid>
            </AppGrid>
        );
    }

    return (
        <AppOverflow>
            <AppGrid title="Contribute">
                <Grid container className="margin-bottom-64">
                    <Grid item xs={12}>
                        <ContributeHeader />
                        <ContributeForm />
                        <div className="form__field">
                            <p className="form__label">
                                Once the list has been successfully
                                uploaded, view your list and confirm or deny
                                matches.
                            </p>
                        </div>
                        <div className="form__field">
                            <Link
                                to={listsRoute}
                                href={listsRoute}
                                className="outlined-button outlined-button--link margin-top-16"
                            >
                                View My Lists
                            </Link>
                        </div>
                    </Grid>
                    <ContributeTroubleshooting />
                </Grid>
            </AppGrid>
        </AppOverflow>
    );
}

ContributeList.propTypes = {
    userHasSignedIn: bool.isRequired,
    fetchingSessionSignIn: bool.isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
        session: {
            fetching,
        },
    },
}) {
    return {
        userHasSignedIn: !!user,
        fetchingSessionSignIn: fetching,
    };
}

export default connect(mapStateToProps)(ContributeList);
