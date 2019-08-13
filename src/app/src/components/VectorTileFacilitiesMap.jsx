import React, { useEffect, useRef, useState } from 'react';
import { bool, number, string } from 'prop-types';
import { connect } from 'react-redux';
import { Map as ReactLeafletMap, ZoomControl } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import L from 'leaflet';
import Control from 'react-leaflet-control';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import noop from 'lodash/noop';
import get from 'lodash/get';

import Button from './Button';
import VectorTileFacilitiesLayer from './VectorTileFacilitiesLayer';

import { COUNTRY_CODES } from '../util/constants';

import {
    initialCenter,
    initialZoom,
    GOOGLE_CLIENT_SIDE_API_KEY,
} from '../util/constants.facilitiesMap';

const mapComponentStyles = Object.freeze({
    mapContainerStyles: Object.freeze({
        height: '100%',
        width: '100%',
    }),
    copySearchButtonStyle: Object.freeze({
        right: '24px',
        top: '20px',
        fontSize: '12px',
    }),
});

function VectorTileFacilitiesMap({
    resetButtonClickCount,
    clientInfoFetched,
    countryCode,
}) {
    const mapRef = useRef(null);

    // Reset the map state when the reset button is clicked
    const [
        currentResetButtonClickCount,
        setCurrentResetButtonClickCount,
    ] = useState(resetButtonClickCount);

    useEffect(() => {
        if (resetButtonClickCount !== currentResetButtonClickCount) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);

            if (leafletMap) {
                leafletMap.setView(initialCenter, initialZoom);
            }

            setCurrentResetButtonClickCount(resetButtonClickCount);
        }
    }, [
        resetButtonClickCount,
        currentResetButtonClickCount,
        setCurrentResetButtonClickCount,
    ]);

    if (!clientInfoFetched) {
        return null;
    }

    return (
        <ReactLeafletMap
            id="oar-leaflet-map"
            ref={mapRef}
            center={initialCenter}
            zoom={initialZoom}
            renderer={L.canvas()}
            style={mapComponentStyles.mapContainerStyles}
            zoomControl={false}
            maxBounds={[[-90, -180], [90, 180]]}
            worldCopyJump
        >
            <ReactLeafletGoogleLayer
                googleMapsLoaderConf={{
                    KEY: GOOGLE_CLIENT_SIDE_API_KEY,
                    REGION: countryCode,
                    VERSION: 3.37,
                }}
                type="roadmap"
                continuousWorld
                minZoom={1}
                zIndex={1}
            />
            <Control position="topright">
                <CopyToClipboard
                    text={window.location.href}
                    onCopy={() => toast('Copied search to clipboard')}
                >
                    <Button
                        text="Share This Search"
                        onClick={noop}
                        style={mapComponentStyles.copySearchButtonStyle}
                    />
                </CopyToClipboard>
            </Control>
            <ZoomControl position="bottomright" />
            <VectorTileFacilitiesLayer />
        </ReactLeafletMap>
    );
}

VectorTileFacilitiesMap.propTypes = {
    resetButtonClickCount: number.isRequired,
    clientInfoFetched: bool.isRequired,
    countryCode: string.isRequired,
};

function mapStateToProps({
    ui: {
        facilitiesSidebarTabSearch: { resetButtonClickCount },
    },
    clientInfo: { fetched, countryCode },
}) {
    return {
        resetButtonClickCount,
        clientInfoFetched: fetched,
        countryCode: countryCode || COUNTRY_CODES.default,
    };
}

export default connect(mapStateToProps)(VectorTileFacilitiesMap);
