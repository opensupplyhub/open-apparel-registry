import React, { useState, useEffect, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import ControlledTextInput from './ControlledTextInput';
import { DEFAULT_SEARCH_TEXT } from '../util/constants';

const styles = {
    subsectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '15px',
        fontWeight: 'bold',
        margin: '10px 0',
    },
    reset: {
        background: 'none',
        border: 'none',
        padding: '0',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};

function EmbeddedMapTextSearchLabelConfig({
    textSearchLabel,
    setTextSearchLabel,
    anyFieldSearchable,
}) {
    const [textInputValue, setTextInputValue] = useState(textSearchLabel);
    const buttonRef = useRef(null);

    const saveTextValue = value => {
        setTextInputValue(value);
        setTextSearchLabel(value);
    };

    const setTextOnBlur = () => {
        if (textInputValue.trim()) {
            saveTextValue(textInputValue);
        } else {
            saveTextValue(DEFAULT_SEARCH_TEXT);
        }
    };

    const setTextOnChange = value => {
        if (value.trim()) {
            saveTextValue(value);
        } else {
            setTextInputValue(value);
        }
    };
    const onReset = e => {
        e.preventDefault();
        saveTextValue(DEFAULT_SEARCH_TEXT);
    };

    useEffect(() => {
        if (!anyFieldSearchable) {
            saveTextValue(DEFAULT_SEARCH_TEXT);
        }
    }, [anyFieldSearchable]);

    useEffect(() => {
        if (textInputValue === DEFAULT_SEARCH_TEXT) {
            buttonRef.current.style.display = 'none';
        } else {
            buttonRef.current.style.display = '';
        }
    }, [textInputValue]);

    return (
        <div>
            <Typography style={styles.subsectionHeader}>
                Search box label
            </Typography>
            <Typography>
                If you&apos;ve made any of your custom fields searchable, you
                can write your own custom label for the search box, so users
                know what they can search for&nbsp;&nbsp;&nbsp;&nbsp;
                <button
                    ref={buttonRef}
                    onClick={onReset}
                    type="button"
                    style={styles.reset}
                    className="inline-link"
                >
                    Reset to default
                </button>
            </Typography>
            <ControlledTextInput
                id="text-search-label"
                value={textInputValue}
                onChange={e => {
                    setTextOnChange(e.target.value);
                }}
                disabled={!anyFieldSearchable}
                onBlur={setTextOnBlur}
            />
        </div>
    );
}

export default withStyles(styles)(EmbeddedMapTextSearchLabelConfig);
