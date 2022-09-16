import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import FacilitiesMap from './FacilitiesMap';
import FacilitiesMapErrorMessage from './FacilitiesMapErrorMessage';
import FeatureFlag from './FeatureFlag';
import VectorTileFacilitiesMap from './VectorTileFacilitiesMap';

import '../styles/css/Map.css';

import {
    facilitiesRoute,
    facilityDetailsRoute,
    VECTOR_TILE,
} from '../util/constants';

class Map extends Component {
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
            <Grid
                item
                sm={12}
                md={7}
                style={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                }}
                className="map-container"
            >
                {!hasError && (
                    <Switch>
                        <Route
                            exact
                            path={facilityDetailsRoute}
                            render={() => (
                                <FeatureFlag
                                    flag={VECTOR_TILE}
                                    alternative={
                                        <Route
                                            render={props => (
                                                <FacilitiesMap
                                                    {...props}
                                                    disableZoom
                                                />
                                            )}
                                        />
                                    }
                                >
                                    <Route
                                        render={props => (
                                            <VectorTileFacilitiesMap
                                                {...props}
                                                disableZoom
                                            />
                                        )}
                                    />
                                </FeatureFlag>
                            )}
                        />
                        <Route
                            exact
                            path={facilitiesRoute}
                            render={() => (
                                <FeatureFlag
                                    flag={VECTOR_TILE}
                                    alternative={
                                        <Route component={FacilitiesMap} />
                                    }
                                >
                                    <Route
                                        component={VectorTileFacilitiesMap}
                                    />
                                </FeatureFlag>
                            )}
                        />
                    </Switch>
                )}
                {hasError && <FacilitiesMapErrorMessage />}
            </Grid>
        );
    }
}

export default Map;
