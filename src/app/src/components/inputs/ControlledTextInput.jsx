import React, { Fragment } from 'react';
import { func, string } from 'prop-types';

import '../../styles/css/specialStates.css';

export default function ControlledTextInput({
    id,
    type,
    hint,
    value,
    onChange,
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
            />
        </Fragment>
    );
}

ControlledTextInput.defaultProps = {
    type: 'text',
    hint: '',
};

ControlledTextInput.propTypes = {
    id: string.isRequired,
    value: string.isRequired,
    type: string,
    hint: string,
    onChange: func.isRequired,
};
