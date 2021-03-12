import React from 'react';
import {
    arrayOf,
    bool,
    func,
    oneOf,
    oneOfType,
    shape,
    string,
} from 'prop-types';

import ControlledTextInput from './ControlledTextInput';
import ControlledSelectInput from './ControlledSelectInput';
import ControlledCheckboxInput from './ControlledCheckboxInput';

import {
    inputTypesEnum,
    registrationFieldsEnum,
    contributorTypeOptions,
} from '../util/constants';

export default function RegisterFormField({
    id,
    label,
    link,
    type,
    options,
    required,
    hint,
    value,
    handleChange,
    isHidden,
    submitFormOnEnterKeyPress,
    autoFocus,
}) {
    if (isHidden) {
        return null;
    }

    const requiredIndicator = required ? (
        <span style={{ color: 'red' }}>{' *'}</span>
    ) : null;

    if (type === inputTypesEnum.select) {
        return (
            <div className="form__field">
                <label htmlFor={id} className="form__label">
                    {label}
                    {requiredIndicator}
                </label>
                <ControlledSelectInput
                    handleChange={handleChange}
                    options={options}
                    value={value}
                />
            </div>
        );
    }

    if (type === inputTypesEnum.checkbox) {
        return (
            <div className="form__field">
                <ControlledCheckboxInput
                    key={id}
                    id={id}
                    onChange={handleChange}
                    checked={value}
                    text={label}
                    link={link}
                />
            </div>
        );
    }

    return (
        <div className="form__field">
            <label htmlFor={id} className="form__label">
                {label}
                {requiredIndicator}
            </label>
            <ControlledTextInput
                autoFocus={autoFocus}
                value={value}
                onChange={handleChange}
                id={id}
                hint={hint}
                type={type}
                submitFormOnEnterKeyPress={submitFormOnEnterKeyPress}
            />
        </div>
    );
}

RegisterFormField.defaultProps = {
    required: false,
    hint: null,
    value: '',
    options: null,
    link: null,
    autoFocus: false,
};

RegisterFormField.propTypes = {
    id: oneOf(Object.values(registrationFieldsEnum)).isRequired,
    label: string.isRequired,
    type: oneOf(Object.values(inputTypesEnum)).isRequired,
    options: arrayOf(oneOf(contributorTypeOptions)),
    required: bool,
    hint: string,
    value: oneOfType([bool, string]),
    handleChange: func.isRequired,
    isHidden: bool.isRequired,
    link: shape({
        prefixText: string,
        url: string.isRequired,
    }),
    submitFormOnEnterKeyPress: func.isRequired,
    autoFocus: bool,
};
