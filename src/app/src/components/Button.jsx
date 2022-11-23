import React, { PureComponent } from 'react';
import MaterialButton from '@material-ui/core/Button';
import PropTypes from 'prop-types';

class Button extends PureComponent {
    render() {
        const {
            onClick,
            text,
            Icon,
            disabled,
            style,
            className,
            color,
        } = this.props;

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
                className={className}
            >
                <div style={{ display: 'flex' }}>
                    {Icon && <Icon color={color} />}
                    {text}
                </div>
            </MaterialButton>
        );
    }
}

Button.propTypes = {
    Icon: PropTypes.func,
    onClick: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Button.defaultProps = {
    Icon: null,
    disabled: false,
    style: {},
};

export default Button;
