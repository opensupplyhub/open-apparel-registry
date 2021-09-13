import React from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { facilityDetailsPropType } from '../util/propTypes';

import DashboardFacilityCardDetails from './DashboardFacilityCardDetails';

const dashboardFacilityCardStyles = Object.freeze({
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
        marging: '10px 0',
    }),
});

export default function DashboardFacilityCard({
    updateOARID,
    fetchFacility,
    clearFacility,
    oarID,
    data,
    fetching,
    error,
    handleEnterKeyPress,
    title,
}) {
    const cardActions = data ? (
        <>
            <Typography style={dashboardFacilityCardStyles.oarIDStyles}>
                {oarID}
            </Typography>
            <Button
                onClick={clearFacility}
                variant="contained"
                color="secondary"
            >
                Clear
            </Button>
        </>
    ) : (
        <>
            <TextField
                variant="outlined"
                onChange={updateOARID}
                value={oarID}
                placeholder="Enter an OAR ID"
                onKeyPress={handleEnterKeyPress}
            />
            <Button
                onClick={fetchFacility}
                variant="contained"
                color="primary"
                disabled={fetching || !oarID}
            >
                Search
            </Button>
        </>
    );

    return (
        <Card style={dashboardFacilityCardStyles.cardStyles}>
            <Typography
                variant="title"
                style={dashboardFacilityCardStyles.textSectionStyles}
            >
                {title}
            </Typography>
            <CardActions style={dashboardFacilityCardStyles.cardActionsStyles}>
                {cardActions}
            </CardActions>
            <DashboardFacilityCardDetails
                data={data}
                fetching={fetching}
                error={error}
            />
        </Card>
    );
}

DashboardFacilityCard.defaultProps = {
    data: null,
    error: null,
};

DashboardFacilityCard.propTypes = {
    updateOARID: func.isRequired,
    fetchFacility: func.isRequired,
    clearFacility: func.isRequired,
    oarID: string.isRequired,
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    handleEnterKeyPress: func.isRequired,
    title: string.isRequired,
};
