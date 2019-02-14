import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import LandingAlert from './LandingAlert';
import FilterSidebar from './FilterSidebar';
import FacilityDetailsSidebar from './FacilityDetailSidebar';
import OARMap from './OARMap';

import '../styles/css/Map.css';

import withQueryStringSync from '../util/withQueryStringSync';

import { facilityDetailsRoute } from '../util/constants';

function MapAndSidebar() {
    return (
        <div>
            <LandingAlert />
            <Grid container>
                <Grid
                    item
                    xs={12}
                    sm={4}
                    id="panel-container"
                >
                    <Switch>
                        <Route
                            path={facilityDetailsRoute}
                            component={FacilityDetailsSidebar}
                        />
                        <Route component={FilterSidebar} />
                    </Switch>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={8}
                    style={{ position: 'relative' }}
                >
                    <Switch>
                        <Route
                            path={facilityDetailsRoute}
                            component={OARMap}
                        />
                        <Route component={OARMap} />
                    </Switch>
                </Grid>
            </Grid>
        </div>
    );
}

export default withQueryStringSync(MapAndSidebar);
