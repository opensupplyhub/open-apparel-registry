import React from 'react';
import { func, array } from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import UndoIcon from '@material-ui/icons/Undo';
import MenuIcon from '@material-ui/icons/Menu';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { withStyles } from '@material-ui/core/styles';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EmbeddedMapSearchLabelConfig from './EmbeddedMapTextSearchLabelConfig';

const styles = {
    section: {
        marginTop: '20px',
    },
    sectionDisabled: {
        marginTop: '20px',
        opacity: '30%',
    },
    sectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '24px',
        margin: '10px 0',
    },
    subsectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '15px',
        fontWeight: 'bold',
        margin: '10px 0',
    },
    list: {
        marginTop: '10px',
        padding: 0,
        listStyleType: 'none',
        minWidth: '550px',
    },
    listItem: {
        listStyleType: 'none',
        '& .draggable': {
            display: 'none',
        },
        '&:hover .draggable': {
            display: 'inline',
            cursor: 'grab',
        },
        '& .drag-arrow': {
            display: 'none',
        },
        '&:hover .drag-arrow': {
            display: 'inline',
        },
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
    searchable: {
        marginLeft: '15px',
    },
    icon: {
        color: 'rgba(0, 0, 0, 0.38)',
    },
    tooltip: {
        fontSize: '0.875rem',
    },
};

const getItemStyle = (isDragging, draggableStyle) => ({
    background: isDragging ? 'white' : '',
    ...draggableStyle,
    left: isDragging ? draggableStyle.offsetLeft : draggableStyle.left,
    top: isDragging ? draggableStyle.offsetTop : draggableStyle.top,
});

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result.map((el, i) => ({ ...el, order: i }));
};

const isFieldSearchable = ({ searchable, visible }) => {
    if (!visible) return false;
    return searchable;
};

function EmbeddedMapFieldsConfig({
    fields,
    setFields,
    preferContributorName,
    setPreferContributorName,
    classes,
    errors,
    textSearchLabel,
    setTextSearchLabel,
    anyFieldSearchable,
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

    const onDragEnd = result => {
        // dropped outside the list
        if (!result.destination) return;

        setFields(
            reorder(fields, result.source.index, result.destination.index),
        );
    };

    const reorderUpward = index => {
        if (index === 0) return;
        setFields(reorder(fields, index, index - 1));
    };

    const reorderDownward = index => {
        if (index === fields.length) return;
        setFields(reorder(fields, index, index + 1));
    };

    const renderField = (
        { visible, displayName, columnName, order, searchable },
        index,
    ) => (
        <Draggable key={columnName} draggableId={columnName} index={index}>
            {(provided, snapshot) => {
                const draggableProps = { ...provided.draggableProps };
                if (snapshot.isDragging) {
                    draggableProps.style.left = draggableProps.style.offsetLeft;
                    draggableProps.style.top = draggableProps.style.offsetTop;
                }
                return (
                    <li
                        key={columnName}
                        ref={provided.innerRef}
                        {...draggableProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            draggableProps.style,
                        )}
                        className={classes.listItem}
                    >
                        <Checkbox
                            checked={visible}
                            onChange={e =>
                                updateItem({
                                    displayName,
                                    columnName,
                                    visible: e.target.checked,
                                    searchable: isFieldSearchable({
                                        searchable,
                                        visible: e.target.checked,
                                    }),
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
                                    searchable,
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
                                                    searchable,
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

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={searchable}
                                    onChange={e =>
                                        updateItem({
                                            displayName,
                                            columnName,
                                            searchable: e.target.checked,
                                            visible,
                                            order,
                                        })
                                    }
                                    value="searchable"
                                    style={{
                                        color: visible
                                            ? 'rgb(0, 0, 0)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                        paddingRight: 0,
                                    }}
                                    disabled={!visible}
                                />
                            }
                            style={styles.searchable}
                        />
                        <IconButton
                            className="draggable"
                            style={{ marginLeft: 0 }}
                            {...provided.dragHandleProps}
                        >
                            <MenuIcon />
                        </IconButton>
                        {index !== fields.length - 1 && (
                            <IconButton
                                className="drag-arrow"
                                style={{ padding: '10px 5px' }}
                                onClick={() => reorderDownward(index)}
                            >
                                <ArrowDownwardIcon />
                            </IconButton>
                        )}
                        {index !== 0 && (
                            <IconButton
                                className="drag-arrow"
                                style={{ padding: '10px 5px' }}
                                onClick={() => reorderUpward(index)}
                            >
                                <ArrowUpwardIcon />
                            </IconButton>
                        )}
                    </li>
                );
            }}
        </Draggable>
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={styles.section}>
                <Typography style={styles.sectionHeader}>Fields</Typography>
                <div style={styles.section}>
                    <Typography style={styles.subsectionHeader}>
                        Include these fields
                    </Typography>
                    <Typography>
                        Choose which fields to display on your map (the number
                        of fields you are able to display corresponds to your
                        Embedded Map package). Facility name, address, and OS
                        Hub ID will always be included.
                    </Typography>
                    {errors?.embed_fields && (
                        <Typography style={{ color: 'red' }}>
                            Error: {errors.embed_fields.join(', ')}
                        </Typography>
                    )}
                    {errors?.show_other_contributor_information && (
                        <Typography style={{ color: 'red' }}>
                            Error:{' '}
                            {errors.show_other_contributor_information.join(
                                ', ',
                            )}
                        </Typography>
                    )}
                    <Droppable droppableId="droppable">
                        {provided => (
                            <ul
                                className={classes.list}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                <li style={styles.listItemNonEditable}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={allSelected}
                                                onChange={e =>
                                                    setFields(
                                                        fields.map(f => ({
                                                            ...f,
                                                            visible:
                                                                e.target
                                                                    .checked,
                                                            searchable: isFieldSearchable(
                                                                {
                                                                    searchable:
                                                                        f.searchable,
                                                                    visible:
                                                                        e.target
                                                                            .checked,
                                                                },
                                                            ),
                                                        })),
                                                    )
                                                }
                                                style={styles.checkbox}
                                                value="allSelected"
                                                indeterminate={someSelected}
                                            />
                                        }
                                        label="Select All"
                                        style={{ width: '284px' }}
                                        classes={{
                                            label: classes.listText,
                                        }}
                                    />
                                    <Tooltip
                                        title="Choose which visible fields to include in text search for your map. Facility name, address, and OS Hub ID will always be included."
                                        classes={{ tooltip: classes.tooltip }}
                                    >
                                        <FormLabel
                                            style={{ color: 'rgb(0,0,0)' }}
                                        >
                                            Searchable{' '}
                                            <i
                                                className={`${classes.icon} fas fa-fw fa-question-circle`}
                                            />
                                        </FormLabel>
                                    </Tooltip>
                                </li>
                                {fields
                                    .sort((a, b) => a.order - b.order)
                                    .map(renderField)}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </div>
                <div style={styles.section}>
                    <Typography style={styles.subsectionHeader}>
                        Promoted Fields
                    </Typography>
                    <Typography>
                        Choose whether to display your provided data instead of
                        the default information.
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={preferContributorName}
                                onChange={e =>
                                    setPreferContributorName(e.target.checked)
                                }
                                style={styles.checkbox}
                                value="preferContributorName"
                            />
                        }
                        label="Use my facility name"
                        classes={{ label: classes.listText }}
                    />
                </div>
                <div
                    style={
                        anyFieldSearchable
                            ? styles.section
                            : styles.sectionDisabled
                    }
                >
                    <EmbeddedMapSearchLabelConfig
                        anyFieldSearchable={anyFieldSearchable}
                        textSearchLabel={textSearchLabel}
                        setTextSearchLabel={setTextSearchLabel}
                    />
                </div>
            </div>
        </DragDropContext>
    );
}

EmbeddedMapFieldsConfig.propTypes = {
    fields: array.isRequired,
    setFields: func.isRequired,
};

export default withStyles(styles)(EmbeddedMapFieldsConfig);
