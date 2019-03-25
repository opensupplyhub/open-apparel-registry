import React, { Fragment } from 'react';
import { bool, func, string } from 'prop-types';
import noop from 'lodash/noop';

import '../styles/css/specialStates.css';

export default function ControlledTextInput({
    id,
    type,
    hint,
    value,
    onChange,
    placeholder,
    disabled,
    submitFormOnEnterKeyPress,
    autoFocus,
}) {
    return (
        <Fragment>
            <p className="form__hint">
                {hint}
            </p>
            <input
                autoFocus={autoFocus} // eslint-disable-line jsx-a11y/no-autofocus
                type={type}
                id={id}
                className="noFocus form__text-input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                onKeyPress={submitFormOnEnterKeyPress}
            />
        </Fragment>
    );
}

ControlledTextInput.defaultProps = {
    type: 'text',
    hint: '',
    placeholder: '',
    disabled: false,
    submitFormOnEnterKeyPress: noop,
    autoFocus: false,
};

ControlledTextInput.propTypes = {
    id: string.isRequired,
    value: string.isRequired,
    type: string,
    hint: string,
    onChange: func.isRequired,
    placeholder: string,
    disabled: bool,
    submitFormOnEnterKeyPress: func,
    autoFocus: bool,
};
