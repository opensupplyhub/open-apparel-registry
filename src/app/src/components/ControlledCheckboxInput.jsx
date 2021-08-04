import React, { Fragment } from 'react';
import { bool, func, shape, string } from 'prop-types';
import MaterialCheckbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';

const controlledCheckboxInputStyles = Object.freeze({
    p: Object.freeze({
        display: 'inline-block',
        margin: '8px 0',
        fontSize: '15px',
    }),
    checkbox: Object.freeze({
        marginLeft: '0px',
    }),
});

function ControlledCheckboxInput({
    onChange,
    text,
    link,
    checked,
    id,
    classes,
}) {
    const labelElement = link ? (
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
        </Fragment>
    ) : (
        text
    );

    return (
        <Fragment>
            <FormControlLabel
                control={
                    <MaterialCheckbox
                        id={id}
                        color="primary"
                        onChange={onChange}
                        className={classes.checkbox}
                        checked={checked}
                    />
                }
                label={labelElement}
                classes={{
                    label: classes.p,
                }}
            />
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

export default withStyles(controlledCheckboxInputStyles)(
    ControlledCheckboxInput,
);
