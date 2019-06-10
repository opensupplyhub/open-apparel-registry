import React from 'react';
import { Switch, Route } from 'react-router-dom';

import ClaimedFacilitiesList from './ClaimedFacilitiesList';
import ClaimedFacilitiesDetails from './ClaimedFacilitiesDetails';
import RouteNotFound from './RouteNotFound';

import {
    claimedFacilitiesRoute,
    claimedFacilitiesDetailRoute,
} from '../util/constants';

export default function ClaimedFacilities() {
    return (
        <Switch>
            <Route
                path={claimedFacilitiesDetailRoute}
                component={ClaimedFacilitiesDetails}
            />
            <Route
                path={claimedFacilitiesRoute}
                component={ClaimedFacilitiesList}
            />
            <Route render={() => <RouteNotFound />} />
        </Switch>
    );
}
