import React from 'react';
import head from 'lodash/head';
import last from 'lodash/last';
import partition from 'lodash/partition';

import FacilityDetailSidebarItem from './FacilityDetailSidebarItem';

import { facilitySidebarActions } from '../util/constants';

const FacilityDetailSidebarLocation = ({ data, embed }) => {
    const facilityLat = last(data.geometry.coordinates);
    const facilityLng = head(data.geometry.coordinates);

    const [canonicalLocationsData, otherLocationsData] = partition(
        data.properties.other_locations || [],
        ({ lng, lat }) => lng === facilityLng && lat === facilityLat,
    );

    const canonicalLocationData = head(canonicalLocationsData);
    const attribution = data.properties.has_inexact_coordinates
        ? `Unable to locate exact GPS coordinates for this facility. If you
            have access to accurate coordinates for this facility, please report
            them ${
                embed
                    ? 'on the Open Apparel Registry.'
                    : `using the "${facilitySidebarActions.SUGGEST_AN_EDIT}" link below.`
            }`
        : canonicalLocationData?.contributor_name;

    return (
        <>
            <FacilityDetailSidebarItem
                label="GPS"
                primary={`${facilityLng}, ${facilityLat}`}
                secondary={attribution}
                additionalContent={otherLocationsData}
            />
        </>
    );
};

export default FacilityDetailSidebarLocation;
