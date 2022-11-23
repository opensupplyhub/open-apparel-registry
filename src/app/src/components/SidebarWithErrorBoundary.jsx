import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import { facilitiesRoute, mainRoute } from '../util/constants';

import FilterSidebar from './FilterSidebar';
import HomepageSidebar from './HomepageSidebar';

export default class SidebarWithErrorBoundary extends Component {
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
        if (this.state.hasError) {
            return (
                <Grid item xs={12} sm={7}>
                    <h2>Whoops! Something went wrong :(</h2>
                    <p>
                        We&apos;ve recorded the issue and are working on a fix.
                    </p>
                </Grid>
            );
        }

        return (
            <Switch>
                <Route
                    key={JSON.stringify(this.state.hasError)}
                    exact
                    path={facilitiesRoute}
                    component={FilterSidebar}
                />
                <Route
                    key={JSON.stringify(this.state.hasError)}
                    exact
                    path={mainRoute}
                    component={HomepageSidebar}
                />
            </Switch>
        );
    }
}
