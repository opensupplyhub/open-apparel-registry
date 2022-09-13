import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

import FacilityDetails from './FacilityDetails';
import MapAndSidebar from './MapAndSidebar';

import withQueryStringSync from '../util/withQueryStringSync';
import { facilitiesRoute, facilityDetailsRoute } from '../util/constants';

const Facilities = ({ fetchingFeatureFlags }) => {
    if (fetchingFeatureFlags) {
        return <CircularProgress />;
    }

    return (
        <Switch>
            <Route path={facilityDetailsRoute} component={FacilityDetails} />
            <Route path={facilitiesRoute} component={MapAndSidebar} />
        </Switch>
    );
};

function mapStateToProps({ featureFlags: { fetching: fetchingFeatureFlags } }) {
    return { fetchingFeatureFlags };
}

export default connect(mapStateToProps)(withQueryStringSync(Facilities));
