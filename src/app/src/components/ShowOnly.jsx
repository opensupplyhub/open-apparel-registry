import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class ShowOnly extends PureComponent {
    render() {
        const { style, children, when } = this.props;

        if (when) {
            return (
                // eslint-disable-next-line react/jsx-no-useless-fragment
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

ShowOnly.defaultProps = {
    when: false,
};

ShowOnly.propTypes = {
    when: PropTypes.bool,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node.isRequired,
};

ShowOnly.defaultProps = {
    style: {},
};
