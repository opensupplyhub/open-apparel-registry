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
import DashboardUpdateFacilityLocation from './DashboardUpdateFacilityLocation';
import DashboardApiBlocks from './DashboardApiBlocks';
import DashboardActivityReports from './DashboardActivityReports';
import DashboardApiBlock from './DashboardApiBlock';
import DashboardLinkToOsId from './DashboardLinkToOsId';
import DashboardGeocoder from './DashboardGeocoder';
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
    dashboardUpdateFacilityLocationRoute,
    dashboardApiBlocksRoute,
    dashboardApiBlockRoute,
    dashboardActivityReportsRoute,
    dashboardGeocoderRoute,
    dashboardLinkOsIdRoute,
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

const makeClickableSecondaryLink = ({ route, screenTitle }) => (
    <React.Fragment>
        {' / '}
        <Link to={route} href={route}>
            {screenTitle}
        </Link>
    </React.Fragment>
);

const makeClickableDashboardLinkFn = (screenTitle, secondaryLink) => () => (
    <span>
        <Link to={dashboardRoute} href={dashboardRoute}>
            Dashboard
        </Link>
        {secondaryLink && makeClickableSecondaryLink(secondaryLink)}
        {` / ${screenTitle}`}
    </span>
);

function Dashboard({ userWithAccessHasSignedIn, fetchingSessionSignIn }) {
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
            <Link to={dashboardListsRoute}>View Contributor Lists</Link>
            <FeatureFlag flag={CLAIM_A_FACILITY}>
                <Link to={dashboardClaimsRoute}>View Facility Claims</Link>
            </FeatureFlag>
            <Link to={dashboardDeleteFacilityRoute}>Delete a Facility</Link>
            <Link to={dashboardMergeFacilitiesRoute}>Merge Two Facilities</Link>
            <Link to={dashboardAdjustFacilityMatchesRoute}>
                Adjust Facility Matches
            </Link>
            <Link to={dashboardUpdateFacilityLocationRoute}>
                Update Facility Location
            </Link>
            <Link to={dashboardApiBlocksRoute}>View API Blocks</Link>
            <Link to={dashboardActivityReportsRoute}>View Status Reports</Link>
            <Link to={dashboardLinkOsIdRoute}>Link to New OS ID</Link>
            <Link to={dashboardGeocoderRoute}>Geocode</Link>
        </div>
    );

    return (
        <AppOverflow>
            <AppGrid
                style={dashboardStyles.appGridStyles}
                title={
                    <Switch>
                        <Route
                            exact
                            path={dashboardListsRoute}
                            render={makeClickableDashboardLinkFn(
                                'Contributor Lists',
                            )}
                        />
                        <Route
                            exact
                            path={dashboardClaimsDetailsRoute}
                            render={() => (
                                <FeatureFlag
                                    flag={CLAIM_A_FACILITY}
                                    alternative={DASHBOARD_TITLE}
                                >
                                    {makeClickableDashboardLinkFn(
                                        'Facility Claim Details',
                                        {
                                            route: dashboardClaimsRoute,
                                            screenTitle: 'Facility Claims',
                                        },
                                    )()}
                                </FeatureFlag>
                            )}
                        />
                        <Route
                            exact
                            path={dashboardClaimsRoute}
                            render={() => (
                                <FeatureFlag
                                    flag={CLAIM_A_FACILITY}
                                    alternative={DASHBOARD_TITLE}
                                >
                                    {makeClickableDashboardLinkFn(
                                        'Facility Claims',
                                    )()}
                                </FeatureFlag>
                            )}
                        />
                        <Route
                            exact
                            path={dashboardDeleteFacilityRoute}
                            render={makeClickableDashboardLinkFn(
                                'Delete Facility',
                            )}
                        />
                        <Route
                            exact
                            path={dashboardMergeFacilitiesRoute}
                            render={makeClickableDashboardLinkFn(
                                'Merge Facilities',
                            )}
                        />
                        <Route
                            exact
                            path={dashboardAdjustFacilityMatchesRoute}
                            render={makeClickableDashboardLinkFn(
                                'Adjust Facility Matches',
                            )}
                        />
                        <Route
                            exact
                            path={dashboardUpdateFacilityLocationRoute}
                            render={makeClickableDashboardLinkFn(
                                'Update Facility Location',
                            )}
                        />
                        <Route
                            exact
                            path={dashboardApiBlockRoute}
                            render={makeClickableDashboardLinkFn('API Block')}
                        />
                        <Route
                            exact
                            path={dashboardApiBlocksRoute}
                            render={makeClickableDashboardLinkFn('API Blocks')}
                        />
                        <Route
                            exact
                            path={dashboardActivityReportsRoute}
                            render={makeClickableDashboardLinkFn(
                                'Status Reports',
                            )}
                        />
                        <Route
                            exact
                            path={dashboardLinkOsIdRoute}
                            render={makeClickableDashboardLinkFn(
                                'Link to New OS ID',
                            )}
                        />
                        <Route
                            exact
                            path={dashboardGeocoderRoute}
                            render={makeClickableDashboardLinkFn('Geocoder')}
                        />
                        <Route
                            exact
                            path={dashboardRoute}
                            render={() => 'Dashboard'}
                        />
                    </Switch>
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
                        path={dashboardUpdateFacilityLocationRoute}
                        component={DashboardUpdateFacilityLocation}
                    />
                    <Route
                        exact
                        path={dashboardClaimsDetailsRoute}
                        render={() => (
                            <FeatureFlag
                                flag={CLAIM_A_FACILITY}
                                alternative={linkSection}
                            >
                                <Route component={DashboardClaimsDetails} />
                            </FeatureFlag>
                        )}
                    />
                    <Route
                        exact
                        path={dashboardClaimsRoute}
                        render={() => (
                            <FeatureFlag
                                flag={CLAIM_A_FACILITY}
                                alternative={linkSection}
                            >
                                <Route component={DashboardClaims} />
                            </FeatureFlag>
                        )}
                    />
                    <Route
                        exact
                        path={dashboardApiBlockRoute}
                        component={DashboardApiBlock}
                    />
                    <Route
                        exact
                        path={dashboardApiBlocksRoute}
                        component={DashboardApiBlocks}
                    />
                    <Route
                        exact
                        path={dashboardActivityReportsRoute}
                        component={DashboardActivityReports}
                    />
                    <Route
                        exact
                        path={dashboardLinkOsIdRoute}
                        component={DashboardLinkToOsId}
                    />
                    <Route
                        exact
                        path={dashboardGeocoderRoute}
                        component={DashboardGeocoder}
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
        user: { user },
        session: { fetching },
    },
}) {
    return {
        userWithAccessHasSignedIn: checkWhetherUserHasDashboardAccess(user),
        fetchingSessionSignIn: fetching,
    };
}
export default connect(mapStateToProps)(Dashboard);
