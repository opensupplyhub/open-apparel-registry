import React, { PureComponent } from 'react';
import MaterialButton from '@material-ui/core/Button';
import PropTypes from 'prop-types';

class Button extends PureComponent {
    render() {
        const { onClick, text, disabled, style } = this.props;

        return (
            <MaterialButton
                onClick={onClick}
                disabled={disabled}
                style={{
                    borderRadius: '0',
                    padding: '8px 16px',
                    textTransform: 'uppercase',
                    boxShadow: 'none',
                    ...style,
                }}
                variant="contained"
                color="primary"
            >
                {text}
            </MaterialButton>
        );
    }
}

Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Button.defaultProps = {
    disabled: false,
    style: {},
};

export default Button;
