import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import FilterSidebar from './FilterSidebar';
import FacilityDetailsSidebar from './FacilityDetailSidebar';
import FacilitiesMap from './FacilitiesMap';
import FacilitiesMapErrorMessage from './FacilitiesMapErrorMessage';

import '../styles/css/Map.css';

import withQueryStringSync from '../util/withQueryStringSync';

import {
    mainRoute,
    facilitiesRoute,
    facilityDetailsRoute,
} from '../util/constants';

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
                    <Grid item xs={12} sm={4} id="panel-container">
                        <Switch>
                            <Route
                                exact
                                path={facilityDetailsRoute}
                                component={FacilityDetailsSidebar}
                            />
                            <Route
                                exact
                                path={facilitiesRoute}
                                component={FilterSidebar}
                            />
                            <Route
                                exact
                                path={mainRoute}
                                component={FilterSidebar}
                            />
                        </Switch>
                    </Grid>
                    <Grid item xs={12} sm={8} style={{ position: 'relative' }}>
                        {!hasError && (
                            <Switch>
                                <Route
                                    exact
                                    path={facilityDetailsRoute}
                                    component={FacilitiesMap}
                                />
                                <Route
                                    exact
                                    path={facilitiesRoute}
                                    component={FacilitiesMap}
                                />
                                <Route
                                    exact
                                    path={mainRoute}
                                    component={FacilitiesMap}
                                />
                            </Switch>
                        )}
                        {hasError && <FacilitiesMapErrorMessage />}
                    </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default withQueryStringSync(MapAndSidebar);
