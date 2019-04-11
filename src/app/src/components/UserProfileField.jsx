import React from 'react';
import { arrayOf, bool, func, oneOf, string } from 'prop-types';

import ControlledTextInput from './ControlledTextInput';
import ControlledSelectInput from './ControlledSelectInput';
import ShowOnly from './ShowOnly';

import {
    inputTypesEnum,
    profileFieldsEnum,
    registrationFieldsEnum,
    contributorTypeOptions,
} from '../util/constants';

import { addProtocolToWebsiteURLIfMissing } from '../util/util';

const userProfileFieldStyles = Object.freeze({
    viewOnlyStyles: Object.freeze({
        padding: '1rem 0',
        fontSize: '20px',
    }),
});

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
    isEditableProfile,
    hideOnViewOnlyProfile,
    submitFormOnEnterKeyPress,
    autoFocus,
    header,
}) {
    if (type === inputTypesEnum.checkbox) {
        window.console.warn(`checkbox not yet implemented for ${id}`);
    }

    if (isHidden) {
        return null;
    }

    if (hideOnViewOnlyProfile && !isEditableProfile) {
        return null;
    }

    if (!isEditableProfile && id === registrationFieldsEnum.website && !value) {
        return null;
    }

    if (!isEditableProfile || id === registrationFieldsEnum.email) {
        return (
            <div className="control-panel__group">
                <div className="form__field">
                    <label
                        htmlFor={id}
                        className="form__label"
                    >
                        {label}
                    </label>
                    <div style={userProfileFieldStyles.viewOnlyStyles}>
                        {
                            id === registrationFieldsEnum.website
                                ? (
                                    <a
                                        href={addProtocolToWebsiteURLIfMissing(value)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {value}
                                    </a>)
                                : value
                        }
                    </div>
                </div>
            </div>
        );
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
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="control-panel__group">
            <ShowOnly when={!!header}>
                <div className="form__field-header">
                    {header}
                </div>
            </ShowOnly>
            <div className="form__field">
                <label
                    htmlFor={id}
                    className="form__label"
                >
                    {label}
                    {requiredIndicator}
                </label>
                <ControlledTextInput
                    autoFocus={autoFocus}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    type={type}
                    submitFormOnEnterKeyPress={submitFormOnEnterKeyPress}
                />
            </div>
        </div>
    );
}

UserProfileField.defaultProps = {
    options: null,
    isEditableProfile: false,
    hideOnViewOnlyProfile: false,
    autoFocus: false,
    header: null,
};

UserProfileField.propTypes = {
    id: oneOf(Object.values(profileFieldsEnum)).isRequired,
    label: string.isRequired,
    header: string,
    type: oneOf(Object.values(inputTypesEnum)).isRequired,
    options: arrayOf(oneOf(contributorTypeOptions)),
    value: string.isRequired,
    handleChange: func.isRequired,
    required: bool.isRequired,
    disabled: bool.isRequired,
    isHidden: bool.isRequired,
    isEditableProfile: bool,
    hideOnViewOnlyProfile: bool,
    submitFormOnEnterKeyPress: func.isRequired,
    autoFocus: bool,
};
