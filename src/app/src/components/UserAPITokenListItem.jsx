import React from 'react';
import { func } from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { tokenPropType } from '../util/propTypes';

export default function UserAPITokenListItem({
    token: {
        token,
        id,
        created_at: created,
    },
    handleDelete,
}) {
    return (
        <ListItem>
            <ListItemText
                primary={token}
                secondary={created}
            />
            <ListItemSecondaryAction>
                <IconButton
                    aria-label="Delete"
                    action={() => handleDelete(id)}
                >
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
}

UserAPITokenListItem.propTypes = {
    token: tokenPropType.isRequired,
    handleDelete: func.isRequired,
};
