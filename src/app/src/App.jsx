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
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Profile from './containers/Profile';
import Contribute from './containers/Contribute';
import Map from './containers/Map';
// import BetaAccessLogin from './containers/BetaAccessLogin'
import requireAuth from './requireAuth';
import Lists from './containers/Lists';
import ErrorBoundary from './components/ErrorBoundary';
import Maintenance from './containers/Maintenance';
import 'react-toastify/dist/ReactToastify.css'; // eslint-disable-line import/first
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
    // componentWillMount() {
    //     if (!this.props.user.betaAccess) {
    //         this.props.actions.checkAccess();
    //     }

    //     this.props.actions.loadUser();
    // }

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.user.loaded !== this.props.user.loaded ||
            nextProps.user.betaAccess !== this.props.user.betaAccess
        );
    }

    render() {
        // const { user, actions: { checkAccess } } = this.props
        const { user } = this.props;
        const isMaintenance = process.env.REACT_APP_MAINTENANCE;

        if (isMaintenance) {
            return (
                <ErrorBoundary>
                    <div>
                        <Maintenance />
                    </div>
                </ErrorBoundary>
            );
        }

        return (
            <ErrorBoundary>
                <div>
                    <div>
                        {/* { user.betaAccess ? ( */}
                        <Router history={history}>
                            <div className="App">
                                <Navbar user={user} />
                                <div>
                                    <Switch>
                                        <Route
                                            exact
                                            path="/"
                                            component={Map}
                                        />
                                        <Route
                                            path="/auth/register"
                                            component={RegisterForm}
                                        />
                                        <Route
                                            path="/auth/login"
                                            component={LoginForm}
                                        />
                                        <Route
                                            path="/profile/:id"
                                            component={Profile}
                                        />
                                        <Route
                                            path="/contribute"
                                            component={requireAuth(Contribute)}
                                        />
                                        <Route
                                            path="/lists"
                                            component={requireAuth(Lists)}
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
                        {/* <BetaAccessLogin checkAccess={ checkAccess } /> */}
                    </div>
                </div>
            </ErrorBoundary>
        );
    }
}

App.propTypes = {
    user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // TODO: re-enable the following line once auth check is possible
    // actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(styles)(App));
