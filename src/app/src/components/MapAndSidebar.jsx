import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import FilterSidebar from './FilterSidebar';
import FacilityDetailsSidebar from './FacilityDetailSidebar';
import FacilitiesMap from './FacilitiesMap';
import FacilitiesMapErrorMessage from './FacilitiesMapErrorMessage';

import '../styles/css/Map.css';

import withQueryStringSync from '../util/withQueryStringSync';

import { facilityDetailsRoute } from '../util/constants';

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
        return (
            <Fragment>
                <Grid container className="map-sidebar-container">
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
                                component={
                                    this.state.hasError
                                        ? FacilitiesMapErrorMessage
                                        : FacilitiesMap
                                }
                            />
                            <Route
                                component={
                                    this.state.hasError
                                        ? FacilitiesMapErrorMessage
                                        : FacilitiesMap
                                }
                            />
                        </Switch>
                    </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default withQueryStringSync(MapAndSidebar);
