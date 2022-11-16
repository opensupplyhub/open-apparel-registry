import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import { Hidden } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import SidebarWithErrorBoundary from './SidebarWithErrorBoundary';

import '../styles/css/Map.css';
import Map from './Map';

import { useMapHeight } from '../util/useHeightSubtract';

function MapAndSidebar() {
    const mapHeight = useMapHeight();

    return (
        <Fragment>
            <Grid container className="map-sidebar-container">
                <Route component={SidebarWithErrorBoundary} />
                <Hidden only="xs">
                    <Map height={mapHeight} />
                </Hidden>
            </Grid>
        </Fragment>
    );
}

export default MapAndSidebar;
