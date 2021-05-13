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
    errors,
}) {
    const updateItem = item => {
        const index = fields.findIndex(f => f.columnName === item.columnName);
        const newFields = [
            ...fields.slice(0, index),
            item,
            ...fields.slice(index + 1),
        ];
        setFields(newFields);
    };
    const allSelected = !fields.some(f => !f.visible);
    const someSelected = fields.some(f => f.visible) && !allSelected;

    const renderField = ({ visible, displayName, columnName, order }) => (
        <li style={styles.listItem} key={columnName}>
            <Checkbox
                checked={visible}
                onChange={e =>
                    updateItem({
                        displayName,
                        columnName,
                        visible: e.target.checked,
                        order,
                    })
                }
                value="visible"
                style={styles.checkbox}
            />
            <TextField
                id={`field-${columnName}`}
                value={displayName}
                onChange={e =>
                    updateItem({
                        visible,
                        columnName,
                        displayName: e.target.value,
                        order,
                    })
                }
                margin="normal"
                variant="outlined"
                disabled={!visible}
                style={styles.textInput}
                InputProps={{
                    endAdornment: columnName !== displayName && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() =>
                                    updateItem({
                                        visible,
                                        columnName,
                                        displayName: columnName,
                                        order,
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
            {errors?.embed_fields && (
                <Typography style={{ color: 'red' }}>
                    Error: {errors.embed_fields.join(', ')}
                </Typography>
            )}
            {errors?.show_other_contributor_information && (
                <Typography style={{ color: 'red' }}>
                    Error:{' '}
                    {errors.show_other_contributor_information.join(', ')}
                </Typography>
            )}
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
                                            visible: e.target.checked,
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
                {fields.sort((a, b) => a.order - b.order).map(renderField)}
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
