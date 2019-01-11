import React from 'react';
import { arrayOf, bool, func, oneOf, string } from 'prop-types';

import ControlledTextInput from '../components/inputs/ControlledTextInput';
import ControlledSelectInput from '../components/inputs/ControlledSelectInput';

import {
    inputTypesEnum,
    registrationFieldsEnum,
    contributorTypeOptions,
} from '../util/constants';

export default function RegisterFormField({
    id,
    label,
    type,
    options,
    required,
    hint,
    value,
    handleChange,
    isHidden,
}) {
    if (isHidden) {
        return null;
    }

    if (type === inputTypesEnum.select) {
        return (
            <div className="form__field">
                <p className="form__label">
                    {label}
                </p>
                <ControlledSelectInput
                    handleChange={handleChange}
                    options={options}
                    value={value}
                />
            </div>
        );
    }

    const requiredIndicator = required
        ? (
            <span style={{ color: 'red' }}>
                {' *'}
            </span>)
        : null;

    return (
        <div className="form__field">
            <label
                htmlFor={id}
                className="form__label"
            >
                {label}
                {requiredIndicator}
            </label>
            <ControlledTextInput
                value={value}
                onChange={handleChange}
                id={id}
                hint={hint}
            />
        </div>
    );
}

RegisterFormField.defaultProps = {
    required: false,
    hint: null,
    value: '',
    options: null,
};

RegisterFormField.propTypes = {
    id: oneOf(Object.values(registrationFieldsEnum)).isRequired,
    label: string.isRequired,
    type: oneOf(Object.values(inputTypesEnum)).isRequired,
    options: arrayOf(oneOf(contributorTypeOptions)),
    required: bool,
    hint: string,
    value: string,
    handleChange: func.isRequired,
    isHidden: bool.isRequired,
};
