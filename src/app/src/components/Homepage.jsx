import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import SidebarWithErrorBoundary from './SidebarWithErrorBoundary';
import FacilitiesMap from './FacilitiesMap';
import FacilitiesMapErrorMessage from './FacilitiesMapErrorMessage';
import FeatureFlag from './FeatureFlag';
import VectorTileFacilitiesMap from './VectorTileFacilitiesMap';

import '../styles/css/Map.css';

import withQueryStringSync from '../util/withQueryStringSync';

import { VECTOR_TILE } from '../util/constants';

class Homepage extends Component {
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
                    <Grid item sm={12} md={6} id="sidebar-container">
                        <Route component={SidebarWithErrorBoundary} />
                    </Grid>
                    <Grid
                        item
                        sm={12}
                        md={6}
                        style={{ position: 'relative' }}
                        className="map-container"
                    >
                        {!hasError && (
                            <FeatureFlag
                                flag={VECTOR_TILE}
                                alternative={
                                    <Route component={FacilitiesMap} />
                                }
                            >
                                <Route component={VectorTileFacilitiesMap} />
                            </FeatureFlag>
                        )}
                        {hasError && <FacilitiesMapErrorMessage />}
                    </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default withQueryStringSync(Homepage);
