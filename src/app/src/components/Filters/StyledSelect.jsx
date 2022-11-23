import React from 'react';
import { connect } from 'react-redux';
import { string, bool, func } from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import ReactSelect from 'react-select';
import { withStyles } from '@material-ui/core/styles';

import { makeFilterStyles } from '../../util/styles';
import { OARColor } from '../../util/constants';

import ArrowDropDownIcon from '../ArrowDropDownIcon';
import CreatableInputOnly from '../CreatableInputOnly';

const makeSelectFilterStyles = (color, windowWidth) => {
    const themeColor = color || OARColor;
    return {
        multiValue: provided => ({
            ...provided,
            background: '#C0EBC7',
            borderRadius: '100px',
            fontFamily: 'Darker Grotesque',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '16px',
            paddingLeft: '5px',
            paddingRight: '5px',
        }),
        control: (provided, state) => {
            const isInUse = state.isFocused || state.menuIsOpen;
            return {
                ...provided,
                borderRadius: 0,
                '*': {
                    boxShadow: 'none !important',
                },
                boxShadow: 'none',
                borderColor: isInUse ? themeColor : provided.borderColor,
                '&:hover': {
                    borderColor: isInUse ? themeColor : provided.borderColor,
                },
            };
        },
        clearIndicator: provided => ({
            ...provided,
            padding:
                windowWidth > 699 && windowWidth < 900 ? 0 : provided.padding,
        }),
    };
};

function StyledSelect({
    name,
    label,
    color,
    creatable,
    classes,
    renderIcon,
    windowWidth,
    ...rest
}) {
    const selectFilterStyles = makeSelectFilterStyles(color, windowWidth);
    return (
        <>
            <InputLabel
                shrink={false}
                htmlFor={name}
                className={classes.inputLabelStyle}
            >
                {label} {renderIcon()}
            </InputLabel>
            {creatable ? (
                <CreatableInputOnly
                    isMulti
                    id={name}
                    name={name}
                    className={`basic-multi-select ${classes.selectStyle}`}
                    classNamePrefix="select"
                    styles={selectFilterStyles}
                    placeholder="Select"
                    {...rest}
                />
            ) : (
                <ReactSelect
                    isMulti
                    id={name}
                    components={{
                        DropdownIndicator: () => (
                            <div
                                style={{
                                    display: 'flex',
                                    marginRight: '0.5em',
                                }}
                            >
                                <ArrowDropDownIcon />
                            </div>
                        ),
                        IndicatorSeparator: null,
                    }}
                    name={name}
                    className={`basic-multi-select notranslate ${classes.selectStyle}`}
                    classNamePrefix="select"
                    styles={selectFilterStyles}
                    placeholder="Select"
                    {...rest}
                />
            )}
        </>
    );
}

StyledSelect.defaultProps = {
    creatable: false,
    renderIcon: () => {},
};

StyledSelect.propTypes = {
    name: string.isRequired,
    label: string.isRequired,
    creatable: bool,
    renderIcon: func,
};

function mapStateToProps({
    embeddedMap: { config },
    ui: {
        window: { innerWidth },
    },
}) {
    return {
        color: config?.color,
        windowWidth: innerWidth,
    };
}

export default connect(mapStateToProps)(
    withStyles(makeFilterStyles)(StyledSelect),
);
