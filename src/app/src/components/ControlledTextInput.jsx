import React, { Fragment } from 'react';
import { func, string } from 'prop-types';

import '../styles/css/specialStates.css';

export default function ControlledTextInput({
    id,
    type,
    hint,
    value,
    onChange,
    placeholder,
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
            />
        </Fragment>
    );
}

ControlledTextInput.defaultProps = {
    type: 'text',
    hint: '',
    placeholder: '',
};

ControlledTextInput.propTypes = {
    id: string.isRequired,
    value: string.isRequired,
    type: string,
    hint: string,
    onChange: func.isRequired,
    placeholder: string,
};
