import React from 'react';
import { arrayOf, bool, string } from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import get from 'lodash/get';

import { facilityDetailsPropType } from '../util/propTypes';

import FacilityDetailsStaticMap from './FacilityDetailsStaticMap';

const dashboardFacilityCardStyles = Object.freeze({
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
    errorStyles: Object.freeze({
        color: 'red',
    }),
    infoContainerStyles: Object.freeze({
        marging: '10px 0',
    }),
});

export default function DashboardFacilityCardDetails({
    data,
    fetching,
    error,
}) {
    const cardContent = (() => {
        if (fetching) {
            return <CircularProgress />;
        }

        if (error && error.length) {
            return (
                <ul style={dashboardFacilityCardStyles.errorStyles}>
                    {error.map(err => (
                        <li key={err}>
                            <span
                                style={dashboardFacilityCardStyles.errorStyles}
                            >
                                {err}
                            </span>
                        </li>
                    ))}
                </ul>
            );
        }

        if (!data) {
            return null;
        }

        const contributorContent = get(data, 'properties.contributors', [])
            .length && (
            <ul style={dashboardFacilityCardStyles.listStyles}>
                {data.properties.contributors.map(({ name }) => (
                    <li key={name}>
                        <Typography
                            style={dashboardFacilityCardStyles.fieldStyles}
                        >
                            {name}
                        </Typography>
                    </li>
                ))}
            </ul>
        );

        return (
            <>
                <div style={dashboardFacilityCardStyles.mapStyles}>
                    <FacilityDetailsStaticMap data={data} />
                </div>
                <div style={dashboardFacilityCardStyles.infoContainerStyles}>
                    <Typography style={dashboardFacilityCardStyles.labelStyles}>
                        Name
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.fieldStyles}>
                        {get(data, 'properties.name', null)}
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.labelStyles}>
                        Address
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.fieldStyles}>
                        {get(data, 'properties.address', null)}
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.labelStyles}>
                        Country
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.fieldStyles}>
                        {get(data, 'properties.country_name', null)}
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.labelStyles}>
                        Location
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.fieldStyles}>
                        {get(data, 'geometry.coordinates', []).join(', ')}
                    </Typography>
                    <Typography style={dashboardFacilityCardStyles.labelStyles}>
                        Contributors
                    </Typography>
                    <div style={dashboardFacilityCardStyles.fieldStyles}>
                        {contributorContent}
                    </div>
                </div>
            </>
        );
    })();

    return (
        <CardContent style={dashboardFacilityCardStyles.cardContentStyles}>
            {cardContent}
        </CardContent>
    );
}

DashboardFacilityCardDetails.defaultProps = {
    data: null,
    error: null,
};

DashboardFacilityCardDetails.propTypes = {
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
};
