import React from 'react';
import head from 'lodash/head';
import last from 'lodash/last';
import partition from 'lodash/partition';

import FacilityDetailsItem from './FacilityDetailsItem';

import { facilityDetailsActions } from '../util/constants';

const getDetailsText = ({
    embed,
    canonicalLocationData,
    hasInexactCoordinates,
    hasInvalidClaimCoordinates,
}) => {
    if (hasInexactCoordinates) {
        return `Unable to locate exact GPS coordinates for this facility. If you
            have access to accurate coordinates for this facility, please report
            them ${
                embed
                    ? 'on the Open Supply Hub.'
                    : `using the "${facilityDetailsActions.SUGGEST_AN_EDIT}" link below.`
            }`;
    }
    if (hasInvalidClaimCoordinates) {
        return "The address provided by the claimant could not be geolocated. An alternate address' GPS is displayed.";
    }
    return canonicalLocationData?.contributor_name;
};

const FacilityDetailsLocation = ({ data, embed }) => {
    const facilityLat = last(data.geometry.coordinates);
    const facilityLng = head(data.geometry.coordinates);

    const [canonicalLocationsData, otherLocationsData] = partition(
        data.properties.other_locations || [],
        ({
            lng,
            lat,
            is_from_claim: isFromClaim,
            has_invalid_location: hasInvalidLocation,
        }) =>
            (isFromClaim && !hasInvalidLocation) ||
            (lng === facilityLng && lat === facilityLat),
    );

    const canonicalLocationData = head(canonicalLocationsData);
    const detailsText = getDetailsText({
        embed,
        canonicalLocationData,
        hasInexactCoordinates: data.properties.has_inexact_coordinates,
        hasInvalidClaimCoordinates: data.properties.other_locations.some(
            item => item.has_invalid_location,
        ),
    });

    return (
        <>
            <FacilityDetailsItem
                label="GPS"
                primary={`${facilityLng}, ${facilityLat}`}
                secondary={detailsText}
                embed={embed}
                isFromClaim={canonicalLocationData?.is_from_claim}
                additionalContent={otherLocationsData
                    .filter(item => !item.has_invalid_location)
                    .map((item, i) => ({
                        primary: `${item.lng}, ${item.lat}`,
                        secondary: item.contributor_name,
                        key: `${item.lng}, ${item.lat} - ${i}`,
                        isFromClaim: item.is_from_claim,
                    }))}
            />
        </>
    );
};

export default FacilityDetailsLocation;
