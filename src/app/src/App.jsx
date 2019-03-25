import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { func } from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // eslint-disable-line import/first

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

import './App.css';

import { sessionLogin } from './actions/auth';

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
        bottom: '47px',
    }),
});

class App extends Component {
    componentDidMount() {
        return this.props.logIn();
    }

    render() {
        return (
            <ErrorBoundary>
                <Router history={history}>
                    <div className="App">
                        <Navbar />
                        <main style={appStyles.mainPanelStyle}>
                            <Switch>
                                <Route
                                    exact
                                    path={mainRoute}
                                    component={MapAndSidebar}
                                />
                                <Route
                                    path={facilitiesRoute}
                                    component={MapAndSidebar}
                                />
                                <Route
                                    path={authRegisterFormRoute}
                                    component={RegisterForm}
                                />
                                <Route
                                    path={authLoginFormRoute}
                                    component={LoginForm}
                                />
                                <Route
                                    path={authResetPasswordFormRoute}
                                    component={ResetPasswordForm}
                                />
                                <Route
                                    path={authConfirmRegistrationRoute}
                                    component={ConfirmRegistration}
                                />
                                <Route
                                    path={profileRoute}
                                    component={UserProfile}
                                />
                                <Route
                                    path={contributeRoute}
                                    component={Contribute}
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
                                    path={aboutProcessingRoute}
                                    component={AboutProcessing}
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
        logIn: () => dispatch(sessionLogin()),
    };
}

export default connect(() => ({}), mapDispatchToProps)(withStyles(appStyles)(App));
