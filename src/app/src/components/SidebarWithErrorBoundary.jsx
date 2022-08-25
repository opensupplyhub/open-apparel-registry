import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import {
    facilityDetailsRoute,
    facilitiesRoute,
    mainRoute,
} from '../util/constants';

import FacilityDetailsSidebar from './FacilityDetailSidebar';
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
        return (
            <Switch>
                <Route
                    key={JSON.stringify(this.state.hasError)}
                    exact
                    path={facilityDetailsRoute}
                    component={FacilityDetailsSidebar}
                />
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
