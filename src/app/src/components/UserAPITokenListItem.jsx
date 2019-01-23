import React from 'react';
import { func } from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';

import { tokenPropType } from '../util/propTypes';

export default function UserAPITokenListItem({
    token: {
        token,
        created,
    },
    handleDelete,
}) {
    const secondaryText = created
        ? `created ${new Date(Date.parse(created)).toUTCString()}`
        : 'API token';

    const displayToast = () => toast('Copied Token to clipboard');

    return (
        <ListItem>
            <ListItemText
                primary={token}
                secondary={secondaryText}
            />
            <ListItemSecondaryAction>
                <CopyToClipboard
                    text={token}
                    onCopy={displayToast}
                >
                    <IconButton aria-label="Copy Token to clipboard">
                        <FileCopyIcon />
                    </IconButton>
                </CopyToClipboard>
                <IconButton
                    aria-label="Delete"
                    onClick={handleDelete}
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
