import React from 'react';
import { Route } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import LandingAlert from './LandingAlert';
import FilterSidebar from './FilterSidebar';
import OARMap from './Map';

export default function MapAndSidebar() {
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
                    <FilterSidebar />
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={8}
                    style={{ position: 'relative' }}
                >
                    <Route component={OARMap} />
                </Grid>
            </Grid>
        </div>
    );
}
