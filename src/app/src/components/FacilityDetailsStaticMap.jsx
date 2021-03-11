import React from 'react';
import { connect } from 'react-redux';
import { bool, string } from 'prop-types';

import { GOOGLE_CLIENT_SIDE_API_KEY } from '../util/constants.facilitiesMap';

import { facilityPropType } from '../util/propTypes';

import { COUNTRY_CODES } from '../util/constants';

import ShowOnly from './ShowOnly';

const staticParams = 'zoom=18&size=320x200&maptype=satellite';
const apiKey = `key=${GOOGLE_CLIENT_SIDE_API_KEY}`;

const makeGoogleMapsStaticMapURL = ({ baseURL, countryCode, lat, lng }) =>
    `${baseURL}?center=${lat},${lng}&markers=icon:${window.location.origin}/images/static-selectedmarker.png%7C${lat},${lng}&region=${countryCode}&${staticParams}&${apiKey}`;

function FacilityDetailsStaticMap({
    data: {
        geometry: {
            coordinates: [lng, lat],
        },
        properties: { name },
    },
    clientInfoFetched,
    baseURL,
    countryCode,
}) {
    return (
        <ShowOnly when={clientInfoFetched}>
            <img
                src={makeGoogleMapsStaticMapURL({
                    baseURL,
                    countryCode,
                    lat,
                    lng,
                })}
                alt={`Facility ${name} at latitide ${lat} and longitude ${lng}`}
                className="facility-detail_map"
            />
        </ShowOnly>
    );
}

FacilityDetailsStaticMap.propTypes = {
    data: facilityPropType.isRequired,
    clientInfoFetched: bool.isRequired,
    countryCode: string.isRequired,
    baseURL: string.isRequired,
};

function mapStateToProps({ clientInfo: { fetched, countryCode } }) {
    const host =
        countryCode === COUNTRY_CODES.china
            ? 'www.google.cn'
            : 'maps.googleapis.com';
    const baseURL = `https:///${host}/maps/api/staticmap`;

    return {
        clientInfoFetched: fetched,
        countryCode: countryCode || COUNTRY_CODES.default,
        baseURL,
    };
}

export default connect(mapStateToProps)(FacilityDetailsStaticMap);
