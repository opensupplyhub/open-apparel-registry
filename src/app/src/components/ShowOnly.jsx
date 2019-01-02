import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class ShowOnly extends PureComponent {
    render() {
        const { style, children, if: _if } = this.props;

        if (_if) {
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
    if: PropTypes.bool,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node.isRequired,
};

ShowOnly.defaultProps = {
    style: {},
    if: false,
};

export default ShowOnly;
