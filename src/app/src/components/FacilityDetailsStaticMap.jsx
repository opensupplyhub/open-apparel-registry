import React from 'react';

import { GOOGLE_CLIENT_SIDE_API_KEY } from '../util/constants.facilitiesMap';

import { facilityPropType } from '../util/propTypes';

const baseURL = 'https:///maps.googleapis.com/maps/api/staticmap';
const staticParams =
    'zoom=18&size=320x200&maptype=satellite&region=IE';
const apiKey = `key=${GOOGLE_CLIENT_SIDE_API_KEY}`;

const makeGoogleMapsStaticMapURLFromLatLng = ({ lat, lng }) =>
    `${baseURL}?center=${lat},${lng}&markers=icon:${window.location.origin}/images/static-selectedmarker.png%7C${lat},${lng}&${staticParams}&${apiKey}`;

export default function FacilityDetailsStaticMap({
    data: {
        geometry: {
            coordinates: [
                lng,
                lat,
            ],
        },
        properties: {
            name,
        },
    },
}) {
    return (
        <img
            src={makeGoogleMapsStaticMapURLFromLatLng({ lat, lng })}
            alt={`Facility ${name} at latitide ${lat} and longitude ${lng}`}
            className="facility-detail_map"
        />
    );
}

FacilityDetailsStaticMap.propTypes = {
    data: facilityPropType.isRequired,
};
