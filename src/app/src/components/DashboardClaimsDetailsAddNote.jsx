import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
    updateFacilityClaimReviewNote,
    addNewFacilityClaimReviewNote,
    clearFacilityClaimReviewNote,
} from '../actions/claimFacilityDashboard';

import { getValueFromEvent } from '../util/util';

const dashboardClaimsDetailsAddNoteStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        padding: '25px',
        marginTop: '20px',
    }),
    textFieldStyles: Object.freeze({
        width: '100%',
        margin: '20px 0',
    }),
    buttonContainerStyles: Object.freeze({
        width: '100%',
        display: 'flex',
        justifyContent: 'end',
        alignItems: 'center',
    }),
    buttonStyles: Object.freeze({
        margin: '0 10px',
    }),
});

function DashboardClaimsDetailsAddNote({
    note,
    fetching,
    error,
    updateNote,
    submitNote,
    clearNote,
}) {
    // Clear the facility claim review note state on component unmount
    useEffect(() => clearNote, [clearNote]);

    return (
        <Paper style={dashboardClaimsDetailsAddNoteStyles.containerStyles}>
            <Typography variant="title" id="add-claim-review-note">
                Add a new note about this Facility Claim
            </Typography>
            <TextField
                id="add-claim-review-note"
                variant="outlined"
                value={note}
                onChange={updateNote}
                disabled={fetching}
                multiline
                rows={5}
                style={dashboardClaimsDetailsAddNoteStyles.textFieldStyles}
            />
            <div
                style={
                    dashboardClaimsDetailsAddNoteStyles.buttonContainerStyles
                }
            >
                {fetching && <CircularProgress />}
                {error && (
                    <span style={{ color: 'red', marginRight: '30px' }}>
                        An error prevented saving that note
                    </span>
                )}
                <Button
                    onClick={submitNote}
                    variant="outlined"
                    color="primary"
                    style={dashboardClaimsDetailsAddNoteStyles.buttonStyles}
                    disabled={fetching || !note}
                >
                    Submit
                </Button>
                <Button
                    onClick={clearNote}
                    variant="outlined"
                    color="secondary"
                    style={dashboardClaimsDetailsAddNoteStyles.buttonStyles}
                    disabled={fetching}
                >
                    Cancel
                </Button>
            </div>
        </Paper>
    );
}

function mapStateToProps({
    claimFacilityDashboard: {
        note: { note, fetching, error },
    },
}) {
    return {
        note,
        fetching,
        error,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { claimID },
        },
    },
) {
    return {
        updateNote: e =>
            dispatch(updateFacilityClaimReviewNote(getValueFromEvent(e))),
        submitNote: () => dispatch(addNewFacilityClaimReviewNote(claimID)),
        clearNote: () => dispatch(clearFacilityClaimReviewNote()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardClaimsDetailsAddNote);
