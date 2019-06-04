import React from 'react';
import { connect } from 'react-redux';
import { bool } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link, Route, Switch } from 'react-router-dom';

import DashboardLists from './DashboardLists';
import DashboardClaims from './DashboardClaims';
import FeatureFlag from './FeatureFlag';

import { checkWhetherUserHasDashboardAccess } from '../util/util';
import { CLAIM_A_FACILITY, dashboardListsRoute, dashboardClaimsRoute } from '../util/constants';

import AppGrid from './AppGrid';

const dashboardStyles = Object.freeze({
    linkSectionStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
    }),
});

function Dashboard({
    userWithAccessHasSignedIn,
    fetchingSessionSignIn,
}) {
    if (fetchingSessionSignIn) {
        return (
            <AppGrid title="Dashboard">
                <CircularProgress />
            </AppGrid>
        );
    }

    if (!userWithAccessHasSignedIn) {
        return (
            <AppGrid title="Dashboard">
                Unauthorized
            </AppGrid>
        );
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
        </div>
    );

    return (
        <AppGrid title="Dashboard">
            <Switch>
                <Route path={dashboardListsRoute} component={DashboardLists} />
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
