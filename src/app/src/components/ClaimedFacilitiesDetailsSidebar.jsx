import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import { facilityDetailsPropType } from '../util/propTypes';

import { makeFacilityDetailLink, makeProfileRouteLink } from '../util/util';

const claimedFacilitiesDetailsSidebarStyles = Object.freeze({
    containerStyles: Object.freeze({}),
    sectionStyles: Object.freeze({
        margin: '0 0 5px 0',
    }),
    bodyTextStyles: Object.freeze({
        margin: '10px 0',
    }),
});

export default function ClaimedFacilitiesDetailsSidebar({ facilityDetails }) {
    return (
        <div>
            <div style={claimedFacilitiesDetailsSidebarStyles.sectionStyles}>
                <Typography variant="title">
                    Contributed Facility Name
                </Typography>
                <Typography
                    variant="body1"
                    style={claimedFacilitiesDetailsSidebarStyles.bodyTextStyles}
                >
                    {facilityDetails.properties.name}
                </Typography>
            </div>
            <div style={claimedFacilitiesDetailsSidebarStyles.sectionStyles}>
                <Typography variant="title">OAR ID</Typography>
                <Typography
                    variant="body1"
                    style={claimedFacilitiesDetailsSidebarStyles.bodyTextStyles}
                >
                    <Link
                        to={makeFacilityDetailLink(facilityDetails.id)}
                        href={makeFacilityDetailLink(facilityDetails.id)}
                    >
                        {facilityDetails.id}
                    </Link>
                </Typography>
            </div>
            <div style={claimedFacilitiesDetailsSidebarStyles.sectionStyles}>
                <Typography variant="title">Contributors</Typography>
                <ul
                    style={claimedFacilitiesDetailsSidebarStyles.bodyTextStyles}
                >
                    {facilityDetails.properties.contributors.map(
                        ({ id, name }) => (
                            <li key={id}>
                                <Link
                                    to={makeProfileRouteLink(id)}
                                    href={makeProfileRouteLink(id)}
                                    key={id}
                                >
                                    {name}
                                </Link>
                            </li>
                        ),
                    )}
                </ul>
            </div>
        </div>
    );
}

ClaimedFacilitiesDetailsSidebar.propTypes = {
    facilityDetails: facilityDetailsPropType.isRequired,
};
