import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

import FacilityDetails from './FacilityDetails';
import MapAndSidebar from './MapAndSidebar';

import withQueryStringSync from '../util/withQueryStringSync';
import {
    facilitiesRoute,
    facilityDetailsRoute,
    profileRoute,
} from '../util/constants';
import UserProfile from './UserProfile';

const Facilities = ({ fetchingFeatureFlags }) => {
    if (fetchingFeatureFlags) {
        return <CircularProgress />;
    }

    return (
        <Switch>
            <Route path={facilityDetailsRoute} component={FacilityDetails} />
            <Route path={facilitiesRoute} component={MapAndSidebar} />
            <Route
                path={profileRoute}
                component={({
                    match: {
                        params: { id },
                    },
                }) => <UserProfile id={id} />}
            />
        </Switch>
    );
};

function mapStateToProps({ featureFlags: { fetching: fetchingFeatureFlags } }) {
    return { fetchingFeatureFlags };
}

export default connect(mapStateToProps)(withQueryStringSync(Facilities));
