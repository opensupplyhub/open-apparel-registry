import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import FilterSidebar from './FilterSidebar';
import FacilityDetailsSidebar from './FacilityDetailSidebar';
import FacilitiesMap from './FacilitiesMap';

import '../styles/css/Map.css';

import withQueryStringSync from '../util/withQueryStringSync';

import { facilityDetailsRoute } from '../util/constants';

function MapAndSidebar() {
    return (
        <Fragment>
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
                            component={FacilitiesMap}
                        />
                        <Route component={FacilitiesMap} />
                    </Switch>
                </Grid>
            </Grid>
        </Fragment>
    );
}

export default withQueryStringSync(MapAndSidebar);
