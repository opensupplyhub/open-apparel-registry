import React, { Fragment } from 'react';
import { bool, func, string } from 'prop-types';

import '../styles/css/specialStates.css';

export default function ControlledTextInput({
    id,
    type,
    hint,
    value,
    onChange,
    placeholder,
    disabled,
}) {
    return (
        <Fragment>
            <p className="form__hint">
                {hint}
            </p>
            <input
                type={type}
                id={id}
                className="noFocus form__text-input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
            />
        </Fragment>
    );
}

ControlledTextInput.defaultProps = {
    type: 'text',
    hint: '',
    placeholder: '',
    disabled: false,
};

ControlledTextInput.propTypes = {
    id: string.isRequired,
    value: string.isRequired,
    type: string,
    hint: string,
    onChange: func.isRequired,
    placeholder: string,
    disabled: bool,
};
