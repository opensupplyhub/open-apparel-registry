import React from 'react';
import Typography from '@material-ui/core/Typography';

import { facilityDetailsPropType } from '../util/propTypes';

import COLOURS from '../util/COLOURS';

const claimFacilityHeaderStyles = Object.freeze({
    containerStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'center',
        borderRadius: '4px',
    }),
    facilityTextSectionStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
    }),
    textStyles: Object.freeze({
        color: COLOURS.WHITE,
        textTransform: 'uppercase',
    }),
});

export default function ClaimFacilityHeader({
    data: {
        properties: { name, address, country_name: countryName },
    },
}) {
    return (
        <div
            style={claimFacilityHeaderStyles.containerStyles}
            className="panel-header"
        >
            <div style={claimFacilityHeaderStyles.facilityTextSectionStyles}>
                <Typography
                    variant="headline"
                    style={claimFacilityHeaderStyles.textStyles}
                >
                    {name}
                </Typography>
                <Typography
                    variant="subheading"
                    style={claimFacilityHeaderStyles.textStyles}
                >
                    {address} - {countryName}
                </Typography>
            </div>
        </div>
    );
}

ClaimFacilityHeader.propTypes = {
    data: facilityDetailsPropType.isRequired,
};
