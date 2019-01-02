import React, { PureComponent } from 'react';
import MaterialButton from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import COLOURS from '../util/COLOURS';

class Button extends PureComponent {
    render() {
        const {
            onClick, text, disabled, style,
        } = this.props;

        return (
            <MaterialButton
                onClick={onClick}
                disabled={disabled}
                style={{
                    background: disabled ? COLOURS.GREY : COLOURS.NAVY_BLUE,
                    color: COLOURS.WHITE,
                    borderRadius: '0',
                    padding: '8px 16px',
                    textTransform: 'uppercase',
                    boxShadow: 'none',
                    ...style,
                }}
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
