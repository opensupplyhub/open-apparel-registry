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

import './App.css';

import { sessionLogin } from './actions/auth';

import {
    mainRoute,
    authLoginFormRoute,
    authRegisterFormRoute,
    authResetPasswordFormRoute,
    contributeRoute,
    listsRoute,
    facilityListItemsRoute,
    facilitiesRoute,
    profileRoute,
} from './util/constants';

const styles = {
    root: {
        flexGrow: 1,
    },
};

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
                        <div>
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
                            </Switch>
                        </div>
                        <Footer />
                        <ToastContainer
                            position="bottom-center"
                            transition={Slide}
                        />
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

export default connect(() => ({}), mapDispatchToProps)(withStyles(styles)(App));
