import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import { Hidden } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import SidebarWithErrorBoundary from './SidebarWithErrorBoundary';

import '../styles/css/Map.css';
import Map from './Map';

function MapAndSidebar() {
    return (
        <Fragment>
            <Grid container className="map-sidebar-container">
                <Route component={SidebarWithErrorBoundary} />
                <Hidden mdDown>
                    <Map />
                </Hidden>
            </Grid>
        </Fragment>
    );
}

export default MapAndSidebar;
