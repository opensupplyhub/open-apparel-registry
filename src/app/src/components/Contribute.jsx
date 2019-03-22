import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bool } from 'prop-types';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import ContributeHeader from './ContributeHeader';
import ContributeForm from './ContributeForm';
import ContributeTroubleshooting from './ContributeTroubleshooting';

import {
    listsRoute,
    authLoginFormRoute,
    aboutProcessingRoute,
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
                        <p>
                            Read about how your facility lists are processed and
                            matched in this&nbsp;
                            <Link to={aboutProcessingRoute} href={aboutProcessingRoute}>guide</Link>
                        </p>

                        <p>
                            To contribute your supplier list to the OAR,
                            please complete the following steps:
                        </p>
                        <Paper style={{
                            padding: '20px',
                            marginBottom: '20px',
                        }}
                        >
                            <ContributeHeader />
                        </Paper>
                        <Paper style={{
                            padding: '20px',
                            marginBottom: '20px',
                        }}
                        >
                            <ContributeForm />
                        </Paper>
                        <Paper style={{
                            padding: '20px',
                        }}
                        >
                            <div className="form__field">
                                <p className="form__label">
                                    Once the list has been successfully
                                    uploaded, view your list and confirm or reject
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
                        </Paper>
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
