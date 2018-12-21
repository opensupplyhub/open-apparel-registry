import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { ToastContainer, Slide } from 'react-toastify';
import { PropTypes } from 'prop-types';
import history from './util/history';
import * as userActions from './actions/user';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthRegister from './containers/AuthRegister';
import AuthLogin from './containers/AuthLogin';
import Profile from './containers/Profile';
import Contribute from './containers/Contribute';
import Map from './containers/Map';
// import BetaAccessLogin from './containers/BetaAccessLogin'
import requireAuth from './requireAuth';
import Lists from './containers/Lists';
import ErrorBoundary from './components/ErrorBoundary';
import Maintenance from './containers/Maintenance';
import BrowserSupport from './containers/BrowserSupport';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const styles = {
    root: {
        flexGrow: 1,
    },
};

const mapStateToProps = state => ({
    user: state.user,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(userActions, dispatch),
});

class App extends Component {
    componentWillMount() {
        if (!this.props.user.betaAccess) this.props.actions.checkAccess();
        this.props.actions.loadUser();
        this.checkBrowser();
    }

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.user.loaded !== this.props.user.loaded ||
            nextProps.user.betaAccess !== this.props.user.betaAccess
        );
    }

    checkBrowser() {
        // Opera 8.0+
        const isOpera =
            (!!window.opr && !!window.opr.addons) ||
            !!window.opera ||
            navigator.userAgent.indexOf(' OPR/') >= 0;

        // Firefox 1.0+
        const isFirefox = typeof InstallTrigger !== 'undefined';

        // Chrome 1+
        const isChrome = !!window.chrome && !!window.chrome.webstore;

        // Safari 3.0+
        const isSafari =
            /constructor/i.test(window.HTMLElement) ||
            (p => p.toString() === '[object SafariRemoteNotification]')(
                !window.safari ||
                    (typeof safari !== 'undefined' &&
                        window.safari &&
                        window.safari.pushNotification)
            );

        // Internet Explorer 11+
        const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
        const isIE = /*@cc_on!@*/ false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;

        if (isSafari || isChrome || isFirefox || isEdge || isOpera || isIE11)
            this.browserSupported = true;
    }

    render() {
        // const { user, actions: { checkAccess } } = this.props
        const { user } = this.props;
        const ifMaintenance = process.env.REACT_APP_MAINTENANCE;
        return (
            <ErrorBoundary>
                {!this.browserSupported ? (
                    <BrowserSupport />
                ) : (
                    <div>
                        {ifMaintenance ? (
                            <Maintenance />
                        ) : (
                            <div>
                                {/* { user.betaAccess
                      ? ( */}
                                <Router history={history}>
                                    <div className='App'>
                                        <Navbar user={user} />
                                        <div>
                                            <Switch>
                                                <Route
                                                    exact
                                                    path='/'
                                                    component={Map}
                                                />
                                                <Route
                                                    path='/auth/register'
                                                    component={AuthRegister}
                                                />
                                                <Route
                                                    path='/auth/login'
                                                    component={AuthLogin}
                                                />
                                                <Route
                                                    path='/profile/:id'
                                                    component={Profile}
                                                />
                                                <Route
                                                    path='/contribute'
                                                    component={requireAuth(
                                                        Contribute
                                                    )}
                                                />
                                                <Route
                                                    path='/lists'
                                                    component={requireAuth(
                                                        Lists
                                                    )}
                                                />
                                            </Switch>
                                        </div>
                                        <Footer />
                                        <ToastContainer
                                            position='bottom-center'
                                            transition={Slide}
                                        />
                                    </div>
                                </Router>
                                )
                                {/* //   : <BetaAccessLogin checkAccess={ checkAccess } />
                    // } */}
                            </div>
                        )}
                    </div>
                )}
            </ErrorBoundary>
        );
    }
}

App.propTypes = {
    user: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(App));
