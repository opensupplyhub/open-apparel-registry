import React from 'react';
import { connect } from 'react-redux';
import { bool } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link, Route, Switch } from 'react-router-dom';

import DashboardLists from './DashboardLists';
import DashboardClaims from './DashboardClaims';
import DashboardClaimsDetails from './DashboardClaimsDetails';
import DashboardDeleteFacility from './DashboardDeleteFacility';
import DashboardMergeFacilities from './DashboardMergeFacilities';
import DashboardAdjustFacilityMatches from './DashboardAdjustFacilityMatches';
import FeatureFlag from './FeatureFlag';
import RouteNotFound from './RouteNotFound';

import { checkWhetherUserHasDashboardAccess } from '../util/util';

import {
    CLAIM_A_FACILITY,
    dashboardRoute,
    dashboardListsRoute,
    dashboardClaimsRoute,
    dashboardClaimsDetailsRoute,
    dashboardDeleteFacilityRoute,
    dashboardMergeFacilitiesRoute,
    dashboardAdjustFacilityMatchesRoute,
} from '../util/constants';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';

const dashboardStyles = Object.freeze({
    linkSectionStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
    }),
    appGridStyles: Object.freeze({
        marginBottom: '100px',
    }),
});

const DASHBOARD_TITLE = 'Dashboard';

function Dashboard({
    userWithAccessHasSignedIn,
    fetchingSessionSignIn,
}) {
    if (fetchingSessionSignIn) {
        return (
            <AppGrid title="">
                <CircularProgress />
            </AppGrid>
        );
    }

    if (!userWithAccessHasSignedIn) {
        return <RouteNotFound />;
    }

    const linkSection = (
        <div style={dashboardStyles.linkSectionStyles}>
            <Link to={dashboardListsRoute}>
                View Contributor Lists
            </Link>
            <FeatureFlag flag={CLAIM_A_FACILITY}>
                <Link to={dashboardClaimsRoute}>
                    View Facility Claims
                </Link>
            </FeatureFlag>
            <Link to={dashboardDeleteFacilityRoute}>
                Delete a facility
            </Link>
            <Link to={dashboardMergeFacilitiesRoute}>
                Merge two facilities
            </Link>
            <Link to={dashboardAdjustFacilityMatchesRoute}>
                Adjust facility matches
            </Link>
        </div>
    );

    const makeClickableDashboardLinkFn = screenTitle => () => (
        <span>
            <Link to={dashboardRoute} href={dashboardRoute}>
                Dashboard
            </Link>
            {` / ${screenTitle}`}
        </span>
    );

    return (
        <AppOverflow>
            <AppGrid
                style={dashboardStyles.appGridStyles}
                title={
                    (
                        <Switch>
                            <Route
                                exact
                                path={dashboardListsRoute}
                                render={makeClickableDashboardLinkFn('Contributor Lists')}
                            />
                            <Route
                                exact
                                path={dashboardClaimsDetailsRoute}
                                render={
                                    () => (
                                        <FeatureFlag
                                            flag={CLAIM_A_FACILITY}
                                            alternative={DASHBOARD_TITLE}
                                        >
                                            {makeClickableDashboardLinkFn('Facility Claim Details')}
                                        </FeatureFlag>
                                    )
                                }
                            />
                            <Route
                                exact
                                path={dashboardClaimsRoute}
                                render={
                                    () => (
                                        <FeatureFlag
                                            flag={CLAIM_A_FACILITY}
                                            alternative={DASHBOARD_TITLE}
                                        >
                                            {makeClickableDashboardLinkFn('Facility Claims')}
                                        </FeatureFlag>
                                    )
                                }
                            />
                            <Route
                                exact
                                path={dashboardDeleteFacilityRoute}
                                render={makeClickableDashboardLinkFn('Delete Facility')}
                            />
                            <Route
                                exact
                                path={dashboardMergeFacilitiesRoute}
                                render={makeClickableDashboardLinkFn('Merge Facilities')}
                            />
                            <Route
                                exact
                                path={dashboardAdjustFacilityMatchesRoute}
                                render={makeClickableDashboardLinkFn('Adjust Facility Matches')}
                            />
                            <Route
                                exact
                                path={dashboardRoute}
                                render={() => 'Dashboard'}
                            />
                        </Switch>
                    )
                }
            >
                <Switch>
                    <Route
                        exact
                        path={dashboardListsRoute}
                        component={DashboardLists}
                    />
                    <Route
                        exact
                        path={dashboardDeleteFacilityRoute}
                        component={DashboardDeleteFacility}
                    />
                    <Route
                        exact
                        path={dashboardMergeFacilitiesRoute}
                        component={DashboardMergeFacilities}
                    />
                    <Route
                        exact
                        path={dashboardAdjustFacilityMatchesRoute}
                        component={DashboardAdjustFacilityMatches}
                    />
                    <Route
                        exact
                        path={dashboardClaimsDetailsRoute}
                        render={
                            () => (
                                <FeatureFlag
                                    flag={CLAIM_A_FACILITY}
                                    alternative={linkSection}
                                >
                                    <Route component={DashboardClaimsDetails} />
                                </FeatureFlag>
                            )
                        }
                    />
                    <Route
                        exact
                        path={dashboardClaimsRoute}
                        render={
                            () => (
                                <FeatureFlag
                                    flag={CLAIM_A_FACILITY}
                                    alternative={linkSection}
                                >
                                    <Route component={DashboardClaims} />
                                </FeatureFlag>
                            )
                        }
                    />
                    <Route
                        exact
                        path={dashboardRoute}
                        render={() => linkSection}
                    />
                    <Route render={() => <RouteNotFound />} />
                </Switch>
            </AppGrid>
        </AppOverflow>
    );
}

Dashboard.propTypes = {
    userWithAccessHasSignedIn: bool.isRequired,
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
        userWithAccessHasSignedIn: checkWhetherUserHasDashboardAccess(user),
        fetchingSessionSignIn: fetching,
    };
}

export default connect(mapStateToProps)(Dashboard);
