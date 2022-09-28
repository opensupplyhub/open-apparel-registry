import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bool, func } from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // eslint-disable-line import/first
import CircularProgress from '@material-ui/core/CircularProgress';

import history from './util/history';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmbeddedFooter from './components/EmbeddedFooter';
import ResetPasswordForm from './components/ResetPasswordForm';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import MapAndSidebar from './components/MapAndSidebar';
import FacilityLists from './components/FacilityLists';
import FacilityListItems from './components/FacilityListItems';
import ErrorBoundary from './components/ErrorBoundary';
import GDPRNotification from './components/GDPRNotification';
import RouteNotFound from './components/RouteNotFound';
import Dashboard from './components/Dashboard';
import Translate from './components/Translate';
import FeatureFlag from './components/FeatureFlag';
import ClaimFacility from './components/ClaimFacility';
import ClaimedFacilities from './components/ClaimedFacilities';
import SurveyDialogNotification from './components/SurveyDialogNotification';
import Settings from './components/Settings';
import ExternalRedirect from './components/ExternalRedirect';
import NotAvailable from './components/NotAvailable';

import { sessionLogin } from './actions/auth';
import { fetchFeatureFlags } from './actions/featureFlags';
import { fetchClientInfo } from './actions/clientInfo';
import { reportWindowResize } from './actions/ui';

import { setFacilityGridRamp } from './actions/vectorTileLayer';

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
    dashboardRoute,
    claimFacilityRoute,
    claimedFacilitiesRoute,
    CLAIM_A_FACILITY,
    settingsRoute,
    WEB_HEADER_HEIGHT,
    MOBILE_HEADER_HEIGHT,
    InfoLink,
    InfoPaths,
} from './util/constants';

const appStyles = theme =>
    Object.freeze({
        root: Object.freeze({
            flexGrow: 1,
        }),
        mainPanelStyle: Object.freeze({
            right: '0',
            top: MOBILE_HEADER_HEIGHT,
            bottom: 0,
            left: '0',
            position: 'fixed',
            [theme.breakpoints.up('lg')]: {
                top: WEB_HEADER_HEIGHT,
                bottom: '51px',
            },
        }),
    });

class Routes extends Component {
    componentDidMount() {
        window.addEventListener('resize', () =>
            this.props.handleWindowResize({
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
            }),
        );

        window.setGridColorRamp = this.props.setRamp;
        this.props.getFeatureFlags();
        this.props.getClientInfo();
        return this.props.logIn();
    }

    render() {
        const { fetchingFeatureFlags, embed, classes } = this.props;

        const mainPanelStyle = embed ? { top: 0, bottom: '64px' } : {};

        return (
            <ErrorBoundary>
                <Router history={history}>
                    <div className="App">
                        <Translate />
                        {!embed ? <Navbar /> : null}
                        <main
                            style={mainPanelStyle}
                            className={`mainPanel ${classes.mainPanelStyle}`}
                        >
                            <Switch>
                                <Route
                                    exact
                                    path={claimFacilityRoute}
                                    render={() => (
                                        <FeatureFlag
                                            flag={CLAIM_A_FACILITY}
                                            alternative={
                                                <Route
                                                    component={MapAndSidebar}
                                                />
                                            }
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
                                            <Route
                                                component={ClaimedFacilities}
                                            />
                                        </FeatureFlag>
                                    )}
                                />
                                <Route
                                    path={facilitiesRoute}
                                    render={() => {
                                        if (fetchingFeatureFlags) {
                                            return <CircularProgress />;
                                        }

                                        return (
                                            <Route component={MapAndSidebar} />
                                        );
                                    }}
                                />
                                <Route
                                    exact
                                    path={authRegisterFormRoute}
                                    component={NotAvailable}
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
                                    path={profileRoute}
                                    component={({
                                        match: {
                                            params: { id },
                                        },
                                    }) => <UserProfile id={id} />}
                                />
                                <Route
                                    exact
                                    path={contributeRoute}
                                    component={NotAvailable}
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
                                    path={settingsRoute}
                                    component={Settings}
                                />
                                <Route exact path="/about/processing">
                                    <ExternalRedirect
                                        to={`${InfoLink}/${InfoPaths.dataQuality}`}
                                    />
                                </Route>
                                <Route exact path="/about/claimedfacilities">
                                    <ExternalRedirect
                                        to={`${InfoLink}/${InfoPaths.claimedFacilities}`}
                                    />
                                </Route>
                                <Route exact path="/tos">
                                    <ExternalRedirect
                                        to={`${InfoLink}/${InfoPaths.termsOfUse}`}
                                    />
                                </Route>
                                <Route
                                    exact
                                    path={mainRoute}
                                    render={() => {
                                        if (fetchingFeatureFlags) {
                                            return <CircularProgress />;
                                        }

                                        return (
                                            <Route component={MapAndSidebar} />
                                        );
                                    }}
                                />
                                <Route render={() => <RouteNotFound />} />
                            </Switch>
                        </main>
                        {embed ? <EmbeddedFooter /> : <Footer />}
                        <ToastContainer
                            position="bottom-center"
                            transition={Slide}
                        />
                        <GDPRNotification />
                        <SurveyDialogNotification />
                    </div>
                </Router>
            </ErrorBoundary>
        );
    }
}

Routes.propTypes = {
    logIn: func.isRequired,
    fetchingFeatureFlags: bool.isRequired,
};

function mapStateToProps({
    featureFlags: { fetching: fetchingFeatureFlags },
    embeddedMap: { embed },
    filters,
}) {
    return {
        fetchingFeatureFlags,
        embed: !!embed,
        contributor: filters?.contributors[0],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getFeatureFlags: () => dispatch(fetchFeatureFlags()),
        getClientInfo: () => dispatch(fetchClientInfo()),
        logIn: () => dispatch(sessionLogin()),
        handleWindowResize: data => dispatch(reportWindowResize(data)),
        setRamp: ramp => dispatch(setFacilityGridRamp(ramp)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(appStyles)(Routes));
