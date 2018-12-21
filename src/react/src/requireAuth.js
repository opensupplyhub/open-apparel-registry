import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = state => ({
    user: state.user,
});

export default function(ComposedComponent) {
    class Authentication extends Component {
        static contextTypes = {
            router: PropTypes.object,
        };

        componentWillMount() {
            if (!this.props.user.loaded) {
                this.context.router.history.push('/');
            }
        }

        componentWillUpdate(nextProps) {
            if (!nextProps.user.loaded) {
                this.context.router.history.push('/');
            }
        }

        render() {
            if (this.props.user.loaded) {
                /* eslint-disable react/jsx-filename-extension */
                return <ComposedComponent {...this.props} />;
                /* eslint-enable react/jsx-filename-extension */
            }

            return null;
        }
    }

    Authentication.propTypes = {
        user: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    };

    Authentication.defaultProps = {
        user: { loaded: false },
    };

    return connect(mapStateToProps)(Authentication);
}
