import React, { Component } from 'react';
import PropTypes from 'prop-types';

const styles = {
    errorContainer: {
        margin: 'auto',
        boxSizing: 'border-box',
    },
};

class SimpleErrorBoundary extends Component {
    state = {};

    componentDidCatch(error) {
        this.setState({ error });

        // Report error to Rollbar
        if (window.Rollbar) {
            window.Rollbar.error(error);
        }
    }

    render() {
        if (this.state.error) {
            return (
                <div style={styles.errorContainer}>
                    <h2>Whoops! Something went wrong :(</h2>
                    <p>
                        We&apos;ve recorded the issue and are working on a fix.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

SimpleErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default SimpleErrorBoundary;
