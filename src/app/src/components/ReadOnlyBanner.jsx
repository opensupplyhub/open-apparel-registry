import React from 'react';
import { Grid, withStyles } from '@material-ui/core';

const bannerStyles = theme => ({
    bannerContainer: {
        backgroundColor: 'black',
        height: '90px',
        [theme.breakpoints.up('lg')]: {
            height: '60px',
        },
    },
    bannerItem: { padding: '.5rem' },
    bannerText: { color: 'white' },
});

function ReadOnlyBanner({ classes }) {
    return (
        <Grid
            container
            className={`results-height-subtract ${classes.bannerContainer}`}
            justify="center"
            alignItems="center"
        >
            <Grid item className={classes.bannerItem}>
                <span className={classes.bannerText}>
                    Uploading new data to the OAR is disabled as of October 14
                    while we prepare to transition this database into Open
                    Supply Hub. Check back on November 2 when OS Hub goes live.
                </span>
            </Grid>
        </Grid>
    );
}

export default withStyles(bannerStyles)(ReadOnlyBanner);
