import React, { useState } from 'react';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import CardActions from '@material-ui/core/CardActions';

import DashboardFacilityCardDetails from './DashboardFacilityCardDetails';
import {
    fetchFacilityToTransfer,
    clearFacilityToTransfer,
    transferFacilityMatch,
} from '../actions/adjustFacilityMatches';
import { getValueFromEvent } from '../util/util';

const styles = Object.freeze({
    cardStyles: Object.freeze({
        width: '45%',
        margin: '0 20px',
        padding: '10px',
    }),
    textSectionStyles: Object.freeze({
        padding: '10px 20px',
    }),
    cardActionsStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
    }),
    cardContentStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        padding: '0 20px',
    }),
    labelStyles: Object.freeze({
        fontSize: '16px',
        fontWeight: '700',
        padding: '5px 0 0',
    }),
    fieldStyles: Object.freeze({
        fontSize: '16px',
        padding: '0 0 5px',
    }),
    listStyles: Object.freeze({
        margin: '0 5px',
    }),
    mapStyles: Object.freeze({
        padding: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    }),
    oarIDStyles: Object.freeze({
        fontSize: '18px',
    }),
    errorStyles: Object.freeze({
        color: 'red',
    }),
    infoContainerStyles: Object.freeze({
        margin: '10px 0',
    }),
    dialogStyle: Object.freeze({
        margin: '25px',
    }),
    container: Object.freeze({
        margin: '20px',
    }),
    contentsContainer: Object.freeze({
        maxHeight: '300px',
        overflow: 'scroll',
    }),
});

function MoveMatchDialog({
    matchToMove,
    handleClose,
    fetchFacility,
    data,
    fetching,
    error,
    clearFacility,
    moveMatch,
}) {
    const [oarID, updateOARID] = useState('');
    const onClose = () => {
        updateOARID('');
        clearFacility();
        handleClose();
    };

    const handleFetchFacility = () => fetchFacility(oarID);
    const handleMoveMatch = () => {
        moveMatch({ oarID, matchID: matchToMove.match_id });
        onClose();
    };
    const fetchOnEnter = ({ key }) => {
        if (key === 'Enter') {
            handleFetchFacility();
        }
    };

    return (
        <Dialog
            open={Boolean(matchToMove)}
            onClose={onClose}
            aria-labelledby="move-dialog-title"
            style={styles.dialogStyle}
        >
            <div style={styles.container}>
                <Typography variant="title" style={styles.textSectionStyles}>
                    Transfer match to alternate facility
                </Typography>
                <CardActions style={styles.cardActionsStyles}>
                    <TextField
                        variant="outlined"
                        onChange={e => updateOARID(getValueFromEvent(e))}
                        value={oarID}
                        placeholder="Enter an OS Hub ID"
                        onKeyPress={fetchOnEnter}
                    />
                    <Button
                        onClick={handleFetchFacility}
                        variant="contained"
                        color="primary"
                        disabled={fetching || !oarID}
                    >
                        Search
                    </Button>
                </CardActions>
                {data && <Divider />}
                <div style={styles.contentsContainer}>
                    <DashboardFacilityCardDetails
                        fetching={fetching}
                        data={data}
                        error={error}
                    />
                </div>
                {data && <Divider />}
                {data && (
                    <CardActions style={styles.cardActionsStyles}>
                        <Button onClick={onClose} variant="contained">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMoveMatch}
                            variant="contained"
                            color="primary"
                        >
                            Transfer Match
                        </Button>
                    </CardActions>
                )}
            </div>
        </Dialog>
    );
}

function mapStateToProps({
    adjustFacilityMatches: {
        transferFacility: { data, fetching, error },
    },
}) {
    return {
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchFacility: oarID => dispatch(fetchFacilityToTransfer(oarID)),
        clearFacility: () => dispatch(clearFacilityToTransfer()),
        moveMatch: ({ oarID, matchID }) =>
            dispatch(transferFacilityMatch({ oarID, matchID })),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoveMatchDialog);
