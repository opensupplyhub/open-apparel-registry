import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import SidebarWithErrorBoundary from './SidebarWithErrorBoundary';
import FacilitiesMap from './FacilitiesMap';
import FacilitiesMapErrorMessage from './FacilitiesMapErrorMessage';
import FeatureFlag from './FeatureFlag';
import VectorTileFacilitiesMap from './VectorTileFacilitiesMap';

import '../styles/css/Map.css';

import withQueryStringSync from '../util/withQueryStringSync';

import {
    mainRoute,
    facilitiesRoute,
    facilityDetailsRoute,
    VECTOR_TILE,
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
                        <Route component={SidebarWithErrorBoundary} />
                    </Grid>
                    <Grid item xs={12} sm={8} style={{ position: 'relative' }}>
                        {!hasError && (
                            <Switch>
                                <Route
                                    exact
                                    path={facilityDetailsRoute}
                                    render={() => (
                                        <FeatureFlag
                                            flag={VECTOR_TILE}
                                            alternative={<Route component={FacilitiesMap} />}
                                        >
                                            <Route component={VectorTileFacilitiesMap} />
                                        </FeatureFlag>
                                    )}
                                />
                                <Route
                                    exact
                                    path={facilitiesRoute}
                                    render={() => (
                                        <FeatureFlag
                                            flag={VECTOR_TILE}
                                            alternative={<Route component={FacilitiesMap} />}
                                        >
                                            <Route component={VectorTileFacilitiesMap} />
                                        </FeatureFlag>
                                    )}
                                />
                                <Route
                                    exact
                                    path={mainRoute}
                                    render={() => (
                                        <FeatureFlag
                                            flag={VECTOR_TILE}
                                            alternative={<Route component={FacilitiesMap} />}
                                        >
                                            <Route component={VectorTileFacilitiesMap} />
                                        </FeatureFlag>
                                    )}
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
