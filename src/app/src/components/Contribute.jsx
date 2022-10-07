import React from 'react';
import { Link, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { bool } from 'prop-types';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import ContributeForm from './ContributeForm';

import {
    listsRoute,
    authLoginFormRoute,
    InfoLink,
    InfoPaths,
} from '../util/constants';

function ContributeList({ userHasSignedIn, fetchingSessionSignIn }) {
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
                        <Link to={authLoginFormRoute} href={authLoginFormRoute}>
                            Log in to contribute to Open Supply Hub
                        </Link>
                    </Grid>
                </Grid>
            </AppGrid>
        );
    }

    return (
        <AppOverflow>
            <AppGrid title="Upload">
                <Grid container className="margin-bottom-64">
                    <Grid item xs={12}>
                        <p>
                            Thank you for contributing your data to Open Supply
                            Hub.
                        </p>

                        <p>
                            <a
                                href={`${InfoLink}/${InfoPaths.contribute}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Please follow these step-by-step instructions
                            </a>{' '}
                            to prepare and upload your data to OS Hub via CSV or
                            Excel file.
                        </p>

                        <p>
                            Once you have read the instructions and prepared
                            your file, submit your list using the fields below.
                        </p>
                        <Paper
                            style={{
                                padding: '20px',
                                marginBottom: '20px',
                            }}
                        >
                            <Route component={ContributeForm} />
                        </Paper>
                        <Paper
                            style={{
                                padding: '20px',
                            }}
                        >
                            <div className="form__field">
                                <p className="form__label">
                                    Once the list has been successfully
                                    uploaded, you will receive an email letting
                                    you know{' '}
                                    <a
                                        href={`${InfoLink}/${InfoPaths.dataQuality}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        your list processing
                                    </a>{' '}
                                    is complete. You can then view your list,
                                    resolve errors, and confirm or reject
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
        user: { user },
        session: { fetching },
    },
}) {
    return {
        userHasSignedIn: !!user,
        fetchingSessionSignIn: fetching,
    };
}

export default connect(mapStateToProps)(ContributeList);
