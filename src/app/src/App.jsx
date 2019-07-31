import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { func } from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // eslint-disable-line import/first
import { hot } from 'react-hot-loader/root';

import history from './util/history';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import Contribute from './components/Contribute';
import MapAndSidebar from './components/MapAndSidebar';
import FacilityLists from './components/FacilityLists';
import FacilityListItems from './components/FacilityListItems';
import ErrorBoundary from './components/ErrorBoundary';
import GDPRNotification from './components/GDPRNotification';
import ConfirmRegistration from './components/ConfirmRegistration';
import AboutProcessing from './components/AboutProcessing';
import RouteNotFound from './components/RouteNotFound';
import Dashboard from './components/Dashboard';
import Translate from './components/Translate';
import FeatureFlag from './components/FeatureFlag';
import ClaimFacility from './components/ClaimFacility';
import ClaimedFacilities from './components/ClaimedFacilities';
import AboutClaimedFacilities from './components/AboutClaimedFacilities';

import './App.css';

import { sessionLogin } from './actions/auth';
import { fetchFeatureFlags } from './actions/featureFlags';
import { fetchClientInfo } from './actions/clientInfo';
import { reportWindowResize } from './actions/ui';

import {
    mainRoute,
    authLoginFormRoute,
    authRegisterFormRoute,
    authResetPasswordFormRoute,
    authConfirmRegistrationRoute,
    contributeRoute,
    listsRoute,
    facilityListItemsRoute,
    facilitiesRoute,
    profileRoute,
    aboutProcessingRoute,
    dashboardRoute,
    claimFacilityRoute,
    claimedFacilitiesRoute,
    CLAIM_A_FACILITY,
    aboutClaimedFacilitiesRoute,
} from './util/constants';

const appStyles = Object.freeze({
    root: Object.freeze({
        flexGrow: 1,
    }),
    mainPanelStyle: Object.freeze({
        top: '64px',
        right: '0',
        left: '0',
        position: 'fixed',
        bottom: '51px',
    }),
});

class App extends Component {
    componentDidMount() {
        window.addEventListener('resize', () => this.props.handleWindowResize({
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
        }));

        this.props.getFeatureFlags();
        this.props.getClientInfo();
        return this.props.logIn();
    }

    render() {
        return (
            <ErrorBoundary>
                <Router history={history}>
                    <div className="App">
                        <Translate />
                        <Navbar />
                        <main style={appStyles.mainPanelStyle}>
                            <Switch>
                                <Route
                                    exact
                                    path={claimFacilityRoute}
                                    render={() => (
                                        <FeatureFlag
                                            flag={CLAIM_A_FACILITY}
                                            alternative={<Route component={MapAndSidebar} />}
                                        >
                                            <Route component={ClaimFacility} />
                                        </FeatureFlag>
                                    )}
                                />
                                <Route
                                    path={claimedFacilitiesRoute}
                                    render={() => (
                                        <FeatureFlag
                                            flag={CLAIM_A_FACILITY}
                                            alternative={<RouteNotFound />}
                                        >
                                            <Route component={ClaimedFacilities} />
                                        </FeatureFlag>
                                    )}
                                />
                                <Route
                                    path={facilitiesRoute}
                                    component={MapAndSidebar}
                                />
                                <Route
                                    exact
                                    path={authRegisterFormRoute}
                                    component={RegisterForm}
                                />
                                <Route
                                    exact
                                    path={authLoginFormRoute}
                                    component={LoginForm}
                                />
                                <Route
                                    exact
                                    path={authResetPasswordFormRoute}
                                    component={ResetPasswordForm}
                                />
                                <Route
                                    exact
                                    path={authConfirmRegistrationRoute}
                                    component={ConfirmRegistration}
                                />
                                <Route
                                    exact
                                    path={profileRoute}
                                    component={UserProfile}
                                />
                                <Route
                                    exact
                                    path={contributeRoute}
                                    component={Contribute}
                                />
                                <Route
                                    path={dashboardRoute}
                                    component={Dashboard}
                                />
                                <Route
                                    path={facilityListItemsRoute}
                                    component={FacilityListItems}
                                />
                                <Route
                                    path={listsRoute}
                                    component={FacilityLists}
                                />
                                <Route
                                    exact
                                    path={aboutProcessingRoute}
                                    component={AboutProcessing}
                                />
                                <Route
                                    exact
                                    path={aboutClaimedFacilitiesRoute}
                                    render={() => (
                                        <FeatureFlag
                                            flag={CLAIM_A_FACILITY}
                                            alternative={<RouteNotFound />}
                                        >
                                            <AboutClaimedFacilities />
                                        </FeatureFlag>
                                    )}
                                />
                                <Route
                                    exact
                                    path={mainRoute}
                                    component={MapAndSidebar}
                                />
                                <Route render={() => <RouteNotFound />} />
                            </Switch>
                        </main>
                        <Footer />
                        <ToastContainer
                            position="bottom-center"
                            transition={Slide}
                        />
                        <GDPRNotification />
                    </div>
                </Router>
            </ErrorBoundary>
        );
    }
}

App.propTypes = {
    logIn: func.isRequired,
};

function mapDispatchToProps(dispatch) {
    return {
        getFeatureFlags: () => dispatch(fetchFeatureFlags()),
        getClientInfo: () => dispatch(fetchClientInfo()),
        logIn: () => dispatch(sessionLogin()),
        handleWindowResize: data => dispatch(reportWindowResize(data)),
    };
}

export default hot(connect(() => ({}), mapDispatchToProps)(withStyles(appStyles)(App)));
