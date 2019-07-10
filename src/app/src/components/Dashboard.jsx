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
import DashboardSplitFacilityMatches from './DashboardSplitFacilityMatches';
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
    dashboardSplitFacilityMatchesRoute,
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
            <Link to={dashboardSplitFacilityMatchesRoute}>
                Split facility matches
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
                                path={dashboardListsRoute}
                                render={makeClickableDashboardLinkFn('Contributor Lists')}
                            />
                            <Route
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
                                path={dashboardDeleteFacilityRoute}
                                render={makeClickableDashboardLinkFn('Delete Facility')}
                            />
                            <Route
                                path={dashboardMergeFacilitiesRoute}
                                render={makeClickableDashboardLinkFn('Merge Facilities')}
                            />
                            <Route
                                path={dashboardSplitFacilityMatchesRoute}
                                render={makeClickableDashboardLinkFn('Split Facility Matches')}
                            />
                            <Route render={() => DASHBOARD_TITLE} />
                        </Switch>
                    )
                }
            >
                <Switch>
                    <Route
                        path={dashboardListsRoute}
                        component={DashboardLists}
                    />
                    <Route
                        path={dashboardDeleteFacilityRoute}
                        component={DashboardDeleteFacility}
                    />
                    <Route
                        path={dashboardMergeFacilitiesRoute}
                        component={DashboardMergeFacilities}
                    />
                    <Route
                        path={dashboardSplitFacilityMatchesRoute}
                        component={DashboardSplitFacilityMatches}
                    />
                    <Route
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
                    <Route render={() => linkSection} />
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
