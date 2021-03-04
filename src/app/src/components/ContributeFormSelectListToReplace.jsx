import React from 'react';
import { arrayOf, func, number } from 'prop-types';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';

import { facilityListPropType } from '../util/propTypes';

import { contributeReplacesNoneSelectionID } from '../util/constants';

const LIST_TO_REPLACE = 'LIST_TO_REPLACE';

const listToReplaceStyles = Object.freeze({
    rootStyle: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
    }),
});

export default function ContributeFormSelectListToReplace({
    lists,
    replaces,
    handleChange,
}) {
    const makePrimaryText = ({
        name,
        file_name: filename,
        is_active: active,
    }) => {
        if (active) {
            return name || filename;
        }

        if (name) {
            return `${name} (inactive)`;
        }

        return name ? `${name} (inactive)` : `${filename} (inactive)`;
    };

    return (
        <div style={listToReplaceStyles.rootStyle} className="form__field">
            <label htmlFor={LIST_TO_REPLACE} className="form__label">
                Select a list to replace
            </label>
            <Select
                id={LIST_TO_REPLACE}
                value={replaces}
                onChange={handleChange}
                style={{ width: '60%' }}
            >
                <MenuItem value={contributeReplacesNoneSelectionID}>
                    None (do not replace a list)
                </MenuItem>
                {lists.map(list => (
                    <MenuItem key={list.id} value={list.id}>
                        <ListItemText
                            primary={makePrimaryText(list)}
                            secondary={list.description}
                        />
                    </MenuItem>
                ))}
            </Select>
        </div>
    );
}

ContributeFormSelectListToReplace.propTypes = {
    replaces: number.isRequired,
    handleChange: func.isRequired,
    lists: arrayOf(facilityListPropType).isRequired,
};
