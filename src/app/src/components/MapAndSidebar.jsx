import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import FilterSidebar from './FilterSidebar';
import FacilityDetailsSidebar from './FacilityDetailSidebar';
import FacilitiesMap from './FacilitiesMap';
import FacilitiesMapErrorMessage from './FacilitiesMapErrorMessage';
import RouteNotFound from './RouteNotFound';

import '../styles/css/Map.css';

import withQueryStringSync from '../util/withQueryStringSync';

import {
    mainRoute,
    facilitiesRoute,
    facilityDetailsRoute,
} from '../util/constants';

function MapAndFilterSidebar({
    hasError,
}) {
    return (
        <>
            <Grid
                item
                xs={12}
                sm={4}
                id="panel-container"
            >
                <Route component={FilterSidebar} />
            </Grid>
            <Grid
                item
                xs={12}
                sm={8}
                style={{ position: 'relative' }}
            >
                <Route
                    component={hasError ? FacilitiesMapErrorMessage : FacilitiesMap}
                />
            </Grid>
        </>
    );
}

function MapAndDetailsSidebar({
    hasError,
}) {
    return (
        <>
            <Grid
                item
                xs={12}
                sm={4}
                id="panel-container"
            >
                <Route component={FacilityDetailsSidebar} />
            </Grid>
            <Grid
                item
                xs={12}
                sm={8}
                style={{ position: 'relative' }}
            >

                <Route
                    component={hasError ? FacilitiesMapErrorMessage : FacilitiesMap}
                />
            </Grid>
        </>
    );
}

class MapAndSidebar extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        if (window.Rollbar) {
            window.Rollbar.error(error);
        }
    }

    render() {
        const { hasError } = this.state;

        return (
            <Fragment>
                <Grid container className="map-sidebar-container">
                    <Switch>
                        <Route
                            exact
                            path={facilityDetailsRoute}
                            render={() => <MapAndDetailsSidebar hasError={hasError} />}
                        />
                        <Route
                            exact
                            path={facilitiesRoute}
                            render={() => <MapAndFilterSidebar hasError={hasError} />}
                        />
                        <Route
                            exact
                            path={mainRoute}
                            render={() => <MapAndFilterSidebar hasError={hasError} />}
                        />
                        <Route render={() => <RouteNotFound />} />
                    </Switch>
                </Grid>
            </Fragment>
        );
    }
}

export default withQueryStringSync(MapAndSidebar);
