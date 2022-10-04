import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Map from './Map';

const locationFieldsStyles = theme =>
    Object.freeze({
        root: {
            color: '#191919',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '2px solid #F9F7F7',
            borderBottom: '2px solid #F9F7F7',
        },
        contentContainer: {
            width: '320px',
            height: '200px',
            padding: theme.spacing.unit * 3,
            [theme.breakpoints.up('sm')]: {
                width: '385px',
                maxWidth: '100%',
            },
            [theme.breakpoints.up('md')]: {
                width: '100%',
                maxWidth: '1072px',
                height: '457px',
                maxHeight: '100%',
            },
        },
    });

const FacilityDetailsInteractiveMap = ({ classes }) => (
    <div className={classes.root}>
        <div className={`${classes.contentContainer}`}>
            <Map height="100%" />
        </div>
    </div>
);

export default withStyles(locationFieldsStyles)(FacilityDetailsInteractiveMap);
