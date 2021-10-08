import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import CardActions from '@material-ui/core/CardActions';

import DashboardFacilityCardDetails from './DashboardFacilityCardDetails';

import {
    fetchFacilityForCard,
    linkFacilityId,
    clearFacilityForCard,
} from '../actions/linkFacilityId';
import { getValueFromEvent } from '../util/util';

const styles = Object.freeze({
    textSectionStyles: Object.freeze({
        padding: '10px 20px',
    }),
    cardActionsStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
    }),
    container: Object.freeze({
        width: '100%',
    }),
    bodyContainer: Object.freeze({
        margin: '10px 20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'stretch',
    }),
    contentsContainer: Object.freeze({
        maxHeight: '300px',
        overflow: 'scroll',
        height: '100%',
    }),
    cardContainerStyle: Object.freeze({
        flex: 1,
    }),
});

function DashboardLinkToOarID({
    fetchingSource,
    sourceData,
    error,
    fetchingNewID,
    newIDData,
    fetchSourceFacility,
    fetchNewFacility,
    linkId,
    resetCards,
}) {
    const [sourceID, setSourceID] = useState('');
    const [newID, setNewID] = useState('');

    useEffect(() => {
        resetCards();
    }, [resetCards]);

    const handleFetchSourceFacility = () => fetchSourceFacility(sourceID);
    const handleSourceKeypress = ({ key }) => {
        if (key === 'Enter') {
            handleFetchSourceFacility();
        }
    };
    const handleFetchNewFacility = () => fetchNewFacility(newID);
    const handleNewKeypress = ({ key }) => {
        if (key === 'Enter') {
            handleFetchNewFacility();
        }
    };
    const handleCancel = () => {
        resetCards();
        setSourceID('');
        setNewID('');
    };
    const handleLinkFacilityId = () => linkId(newID, sourceID);
    const currentLinkedId = sourceData?.properties?.new_oar_id;

    return (
        <div style={styles.container}>
            <div style={styles.bodyContainer}>
                <div style={styles.cardContainerStyle}>
                    <Typography
                        variant="title"
                        style={styles.textSectionStyles}
                    >
                        Facility to link
                    </Typography>
                    <CardActions style={styles.cardActionsStyles}>
                        <TextField
                            variant="outlined"
                            onChange={e => setSourceID(getValueFromEvent(e))}
                            value={sourceID}
                            placeholder="Enter an OAR ID"
                            onKeyPress={handleSourceKeypress}
                        />
                        <Button
                            onClick={handleFetchSourceFacility}
                            variant="contained"
                            color="primary"
                            disabled={fetchingSource || !sourceID}
                        >
                            Search
                        </Button>
                    </CardActions>
                    {sourceData && <Divider />}
                    <div style={styles.contentsContainer}>
                        <div style={styles.textSectionStyles}>
                            {currentLinkedId && (
                                <div>
                                    <strong>Linked OAR ID:</strong>{' '}
                                    {currentLinkedId}
                                </div>
                            )}
                        </div>
                        <DashboardFacilityCardDetails
                            fetching={fetchingSource}
                            data={sourceData}
                            error={error}
                        />
                    </div>
                </div>
                <div style={styles.cardContainerStyle}>
                    <Typography
                        variant="title"
                        style={styles.textSectionStyles}
                    >
                        New OAR ID
                    </Typography>
                    <CardActions style={styles.cardActionsStyles}>
                        <TextField
                            variant="outlined"
                            onChange={e => setNewID(getValueFromEvent(e))}
                            value={newID}
                            placeholder="Enter an OAR ID"
                            onKeyPress={handleNewKeypress}
                        />
                        <Button
                            onClick={handleFetchNewFacility}
                            variant="contained"
                            color="primary"
                            disabled={fetchingNewID || !newID}
                        >
                            Search
                        </Button>
                    </CardActions>
                    {newIDData && <Divider />}
                    <div style={styles.contentsContainer}>
                        <div style={styles.textSectionStyles} />
                        <DashboardFacilityCardDetails
                            fetching={fetchingNewID}
                            data={newIDData}
                            error={error}
                        />
                    </div>
                </div>
            </div>
            {sourceData && newIDData && <Divider />}
            {sourceData && newIDData && (
                <CardActions style={styles.cardActionsStyles}>
                    <Button onClick={handleCancel} variant="contained">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLinkFacilityId}
                        variant="contained"
                        color="primary"
                    >
                        Link Facility
                    </Button>
                </CardActions>
            )}
        </div>
    );
}

const SOURCE = 'source';
const NEWID = 'newid';
function mapStateToProps({ facilityCards }) {
    const source = facilityCards.facilities[SOURCE];
    const newID = facilityCards.facilities[NEWID];
    return {
        fetchingSource: source.fetching,
        sourceData: source.data,
        error: facilityCards.error,
        fetchingNewID: newID.fetching,
        newIDData: newID.data,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchSourceFacility: oarID =>
            dispatch(fetchFacilityForCard({ oarID, card: SOURCE })),
        fetchNewFacility: oarID =>
            dispatch(fetchFacilityForCard({ oarID, card: NEWID })),
        linkId: (newOarID, oarID) =>
            dispatch(linkFacilityId({ newOarID, oarID })),
        resetCards: () => dispatch(clearFacilityForCard()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardLinkToOarID);
