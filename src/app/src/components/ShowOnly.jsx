import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class ShowOnly extends PureComponent {
    render() {
        const { style, children, showChildren } = this.props;

        if (showChildren) {
            return (
                <React.Fragment>
                    {Object.keys(style).length ? (
                        <span style={style}> {children} </span>
                    ) : (
                        children
                    )}
                </React.Fragment>
            );
        }

        return null;
    }
}

ShowOnly.propTypes = {
    showChildren: PropTypes.bool.isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node.isRequired,
};

ShowOnly.defaultProps = {
    style: {},
};
