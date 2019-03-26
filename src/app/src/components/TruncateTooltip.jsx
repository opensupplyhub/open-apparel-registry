import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';

class TruncateTooltip extends Component {
    render() {
        const insetComponent = (() => {
            if (this.props.truncate.length > 40) {
                return (
                    <Tooltip title={this.props.truncate} placement="top">
                        <span>
                            {this.props.truncate.substring(0, 40)}...
                        </span>
                    </Tooltip>
                );
            }

            return (this.props.truncate);
        })();

        return insetComponent;
    }
}

TruncateTooltip.propTypes = {
    truncate: PropTypes.node.isRequired,
};

export default TruncateTooltip;
