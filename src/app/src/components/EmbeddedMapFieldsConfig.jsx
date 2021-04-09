import React from 'react';
import { func, array } from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import UndoIcon from '@material-ui/icons/Undo';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    section: {
        marginTop: '30px',
    },
    sectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '18px',
        margin: '10px 0',
    },
    listItem: {
        listStyleType: 'none',
    },
    listItemNonEditable: {
        listStyleType: 'none',
        paddingLeft: '15px',
    },
    listText: {
        fontSize: '16px',
    },
    checkbox: {
        color: 'rgb(0, 0, 0)',
    },
    textInput: {
        width: '250px',
    },
};

function EmbeddedMapFieldsConfig({
    fields,
    setFields,
    includeOtherContributorFields,
    setIncludeOtherContributorFields,
    classes,
}) {
    const updateItem = item => {
        const index = fields.findIndex(f => f.value === item.value);
        const newFields = [
            ...fields.slice(0, index),
            item,
            ...fields.slice(index + 1),
        ];
        setFields(newFields);
    };
    const allSelected = !fields.some(f => !f.included);
    const someSelected = fields.some(f => f.included) && !allSelected;

    const renderField = ({ included, label, value }) => (
        <li style={styles.listItem} key={value}>
            <Checkbox
                checked={included}
                onChange={e =>
                    updateItem({ label, value, included: e.target.checked })
                }
                value="included"
                style={styles.checkbox}
            />
            <TextField
                id={`field-${value}`}
                value={label}
                onChange={e =>
                    updateItem({
                        included,
                        value,
                        label: e.target.value,
                    })
                }
                margin="normal"
                variant="outlined"
                disabled={!included}
                style={styles.textInput}
                InputProps={{
                    endAdornment: value !== label && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() =>
                                    updateItem({
                                        included,
                                        value,
                                        label: value,
                                    })
                                }
                            >
                                <UndoIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </li>
    );

    return (
        <div style={styles.section}>
            <Typography style={styles.sectionHeader}>
                Include these fields
            </Typography>
            <Typography>
                Choose which fields to display – and what to call them. Facility
                name, address, and country will always be included.
            </Typography>
            <ul>
                <li style={styles.listItemNonEditable}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={allSelected}
                                onChange={e =>
                                    setFields(
                                        fields.map(f => ({
                                            ...f,
                                            included: e.target.checked,
                                        })),
                                    )
                                }
                                style={styles.checkbox}
                                value="allSelected"
                                indeterminate={someSelected}
                            />
                        }
                        label="Select All"
                        classes={{
                            label: classes.listText,
                        }}
                    />
                </li>
                {fields.map(renderField)}
                <li style={styles.listItemNonEditable}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeOtherContributorFields}
                                onChange={e =>
                                    setIncludeOtherContributorFields(
                                        e.target.checked,
                                    )
                                }
                                value="includeOtherContributorFields"
                                style={styles.checkbox}
                            />
                        }
                        label="Information from other contributors"
                        classes={{
                            label: classes.listText,
                        }}
                    />
                </li>
            </ul>
        </div>
    );
}

EmbeddedMapFieldsConfig.propTypes = {
    fields: array.isRequired,
    setFields: func.isRequired,
};

export default withStyles(styles)(EmbeddedMapFieldsConfig);
