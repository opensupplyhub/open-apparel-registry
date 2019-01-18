import React, { Fragment } from 'react';
import { bool, func, shape, string } from 'prop-types';
import MaterialCheckbox from '@material-ui/core/Checkbox';

const controlledCheckboxInputStyles = Object.freeze({
    p: Object.freeze({
        display: 'inline-block',
        margin: '8px 0',
    }),
    checkbox: Object.freeze({
        marginLeft: '-15px',
    }),
});

export default function ControlledCheckboxInput({
    onChange,
    text,
    link,
    checked,
    id,
}) {
    const labelElement = link
        ? (
            <Fragment>
                {link.prefixText}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                    href={link.url}
                >
                    {text}
                </a>
            </Fragment>)
        : text;

    return (
        <Fragment>
            <MaterialCheckbox
                id={id}
                color="primary"
                onChange={onChange}
                style={controlledCheckboxInputStyles.checkbox}
                checked={checked}
            />
            <label
                htmlFor={id}
                style={controlledCheckboxInputStyles.p}
            >
                {labelElement}
            </label>
        </Fragment>
    );
}

ControlledCheckboxInput.defaultProps = {
    link: null,
};

ControlledCheckboxInput.propTypes = {
    onChange: func.isRequired,
    text: string.isRequired,
    checked: bool.isRequired,
    link: shape({
        prefixText: string,
        url: string.isRequired,
    }),
    id: string.isRequired,
};
