import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';

import { facilityClaimNotePropType } from '../util/propTypes';

const dashboardClaimsDetailsNoteStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        padding: '25px',
        margin: '20px 0',
    }),
    noteStyles: Object.freeze({
        padding: '10px 0',
        whiteSpace: 'pre-line',
    }),
});

export default function DashboardClaimsDetailsNote({
    note: {
        author,
        created_at: createdAt,
        note,
    },
}) {
    return (
        <Paper style={dashboardClaimsDetailsNoteStyles.containerStyles}>
            <Typography variant="body1">
                by {author} on {moment(createdAt).format('LLL')}
            </Typography>
            <Typography
                variant="title"
                style={dashboardClaimsDetailsNoteStyles.noteStyles}
            >
                {note}
            </Typography>
        </Paper>
    );
}

DashboardClaimsDetailsNote.propTypes = {
    note: facilityClaimNotePropType.isRequired,
};
