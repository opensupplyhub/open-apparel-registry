import React from 'react';
import { Switch, Route } from 'react-router-dom';

import ClaimedFacilitiesList from './ClaimedFacilitiesList';
import ClaimedFacilitiesDetails from './ClaimedFacilitiesDetails';
import RouteNotFound from './RouteNotFound';
import AppOverflow from './AppOverflow';
import AppGrid from './AppGrid';

import {
    claimedFacilitiesRoute,
    claimedFacilitiesDetailRoute,
} from '../util/constants';

export default function ClaimedFacilities() {
    return (
        <AppOverflow>
            <AppGrid
                title={
                    (
                        <Switch>
                            <Route
                                path={claimedFacilitiesDetailRoute}
                                render={() => 'Claimed Facility Details'}
                            />
                            <Route render={() => 'Claimed Facilities'} />
                        </Switch>
                    )
                }
            >
                <Switch>
                    <Route
                        path={claimedFacilitiesDetailRoute}
                        render={() => <Route component={ClaimedFacilitiesDetails} />}
                    />
                    <Route
                        path={claimedFacilitiesRoute}
                        component={ClaimedFacilitiesList}
                    />
                    <Route render={() => <RouteNotFound />} />
                </Switch>
            </AppGrid>
        </AppOverflow>
    );
}
