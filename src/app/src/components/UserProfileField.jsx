import React from 'react';
import { arrayOf, bool, func, oneOf, string } from 'prop-types';

import ControlledTextInput from './ControlledTextInput';
import ControlledSelectInput from './ControlledSelectInput';

import {
    inputTypesEnum,
    profileFieldsEnum,
    contributorTypeOptions,
} from '../util/constants';

export default function UserProfileField({
    id,
    type,
    label,
    options,
    value,
    handleChange,
    disabled,
    required,
    isHidden,
}) {
    if (type === inputTypesEnum.checkbox) {
        window.console.warn(`checkbox not yet implemented for ${id}`);
    }

    if (isHidden) {
        return null;
    }

    const requiredIndicator = required
        ? (
            <span style={{ color: 'red' }}>
                {' *'}
            </span>)
        : null;

    if (type === inputTypesEnum.select) {
        return (
            <div className="control-panel__group">
                <div className="form__field">
                    <label
                        htmlFor={id}
                        className="form__label"
                    >
                        {label}
                        {requiredIndicator}
                    </label>
                    <ControlledSelectInput
                        id={id}
                        handleChange={handleChange}
                        options={options}
                        value={value}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="control-panel__group">
            <div className="form__field">
                <label
                    htmlFor={id}
                    className="form__label"
                >
                    {label}
                    {requiredIndicator}
                </label>
                <ControlledTextInput
                    id={id}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    type={type}
                />
            </div>
        </div>
    );
}

UserProfileField.defaultProps = {
    options: null,
};

UserProfileField.propTypes = {
    id: oneOf(Object.values(profileFieldsEnum)).isRequired,
    label: string.isRequired,
    type: oneOf(Object.values(inputTypesEnum)).isRequired,
    options: arrayOf(oneOf(contributorTypeOptions)),
    value: string.isRequired,
    handleChange: func.isRequired,
    required: bool.isRequired,
    disabled: bool.isRequired,
    isHidden: bool.isRequired,
};
