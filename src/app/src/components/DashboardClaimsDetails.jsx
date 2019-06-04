import React from 'react';
import { shape, string } from 'prop-types';
import Typography from '@material-ui/core/Typography';

export default function DashboardClaimsDetails({
    match: {
        params: {
            claimID,
        },
    },
}) {
    return (
        <Typography>
            Claim ID: {claimID}
        </Typography>
    );
}

DashboardClaimsDetails.propTypes = {
    match: shape({
        params: shape({
            claimID: string.isRequired,
        }).isRequired,
    }).isRequired,
};
