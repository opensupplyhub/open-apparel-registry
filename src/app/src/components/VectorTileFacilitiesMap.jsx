import React, { useState } from 'react';
import { array, arrayOf, bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { Map as ReactLeafletMap, ZoomControl, GeoJSON } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import L from 'leaflet';
import Control from 'react-leaflet-control';
import noop from 'lodash/noop';
import get from 'lodash/get';

import Button from './Button';
import VectorTileFacilitiesLayer from './VectorTileFacilitiesLayer';
import VectorTileFacilityGridLayer from './VectorTileFacilityGridLayer';
import VectorTileGridLegend from './VectorTileGridLegend';
import SearchControls from './SearchControls';
import PolygonalSearchControl from './PolygonalSearchControl';
import CopySearch from './CopySearch';

import { COUNTRY_CODES, SILVER_MAP_STYLE } from '../util/constants';

import { makeFacilityDetailLink } from '../util/util';

import { resetSingleFacility } from '../actions/facilities';

import { facilityDetailsPropType } from '../util/propTypes';

import {
    initialCenter,
    initialZoom,
    detailsZoomLevel,
    minimumZoom,
    maxVectorTileFacilitiesGridZoom,
    GOOGLE_CLIENT_SIDE_API_KEY,
} from '../util/constants.facilitiesMap';

import useUpdateLeafletMapImperatively from '../util/hooks';

const mapComponentStyles = Object.freeze({
    mapContainerStyles: Object.freeze({
        height: '100%',
        width: '100%',
    }),
    copySearchButtonStyle: Object.freeze({
        fontSize: '12px',
    }),
});

function VectorTileFacilitiesMap({
    resetButtonClickCount,
    clientInfoFetched,
    countryCode,
    handleMarkerClick,
    handleFacilityClick,
    match: {
        params: { oarID },
    },
    history: { push },
    location,
    facilityDetailsData,
    gridColorRamp,
    extent,
    zoomToSearch,
    drawFilterActive,
    boundary,
    isEmbedded,
    mapStyle,
}) {
    const mapRef = useUpdateLeafletMapImperatively(resetButtonClickCount, {
        oarID,
        data: facilityDetailsData,
        shouldPanMapToFacilityDetails: get(
            location,
            'state.panMapToFacilityDetails',
            false,
        ),
        isVectorTileMap: true,
        extent,
        zoomToSearch,
        boundary,
    });

    const [currentMapZoomLevel, setCurrentMapZoomLevel] = useState(
        oarID ? detailsZoomLevel : initialZoom,
    );

    const handleZoomEnd = e => {
        const newMapZoomLevel = get(e, 'target._zoom', null);

        return newMapZoomLevel
            ? setCurrentMapZoomLevel(newMapZoomLevel)
            : noop();
    };

    if (!clientInfoFetched) {
        return null;
    }

    const handleCellClick = event => {
        const { xmin, ymin, xmax, ymax, count } = get(
            event,
            'layer.properties',
            {},
        );
        const leafletMap = get(mapRef, 'current.leafletElement', null);
        if (count && leafletMap) {
            leafletMap.fitBounds([
                [ymin, xmin],
                [ymax, xmax],
            ]);
        }
    };

    return (
        <ReactLeafletMap
            id="oar-leaflet-map"
            ref={mapRef}
            center={initialCenter}
            zoom={initialZoom}
            scrollWheelZoom={!isEmbedded}
            minZoom={minimumZoom}
            renderer={L.canvas()}
            style={mapComponentStyles.mapContainerStyles}
            zoomControl={false}
            maxBounds={[
                [-90, -180],
                [90, 180],
            ]}
            worldCopyJump
            onZoomEnd={handleZoomEnd}
        >
            <ReactLeafletGoogleLayer
                googleMapsLoaderConf={{
                    KEY: GOOGLE_CLIENT_SIDE_API_KEY,
                    REGION: countryCode,
                    VERSION: 3.47,
                }}
                type="roadmap"
                styles={mapStyle === 'silver' ? SILVER_MAP_STYLE : null}
                continuousWorld
                minZoom={1}
                zIndex={1}
            />
            <Control position="topleft">
                <SearchControls />
            </Control>
            <Control position="bottomleft">
                <VectorTileGridLegend
                    currentZoomLevel={currentMapZoomLevel}
                    gridColorRamp={gridColorRamp}
                />
            </Control>
            {isEmbedded ? null : (
                <Control position="topright">
                    <CopySearch>
                        <Button
                            text="Share This Search"
                            onClick={noop}
                            style={mapComponentStyles.copySearchButtonStyle}
                        />
                    </CopySearch>
                </Control>
            )}
            <ZoomControl position="bottomright" />
            <VectorTileFacilitiesLayer
                handleMarkerClick={handleMarkerClick}
                handleFacilityClick={handleFacilityClick}
                oarID={oarID}
                pushRoute={push}
                minZoom={maxVectorTileFacilitiesGridZoom + 1}
                maxZoom={22}
            />
            <VectorTileFacilityGridLayer
                handleCellClick={handleCellClick}
                minZoom={1}
                maxZoom={maxVectorTileFacilitiesGridZoom}
                zoomLevel={currentMapZoomLevel}
            />
            {drawFilterActive && <PolygonalSearchControl />}
            {boundary != null && (
                <GeoJSON
                    data={boundary}
                    style={{
                        renderer: L.svg({ padding: 0.5 }),
                        interactive: false,
                    }}
                />
            )}
        </ReactLeafletMap>
    );
}

VectorTileFacilitiesMap.defaultProps = {
    facilityDetailsData: null,
};

VectorTileFacilitiesMap.propTypes = {
    resetButtonClickCount: number.isRequired,
    clientInfoFetched: bool.isRequired,
    countryCode: string.isRequired,
    handleMarkerClick: func.isRequired,
    match: shape({
        params: shape({
            oarID: string,
        }),
    }).isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
    location: shape({
        state: shape({
            panMapToFacilityDetails: bool,
        }),
    }).isRequired,
    facilityDetailsData: facilityDetailsPropType,
    gridColorRamp: arrayOf(array).isRequired,
};

function mapStateToProps({
    ui: {
        facilitiesSidebarTabSearch: { resetButtonClickCount },
        zoomToSearch,
        drawFilterActive,
    },
    clientInfo: { fetched, countryCode },
    facilities: {
        singleFacility: { data },
        facilities: { data: facilitiesData },
    },
    vectorTileLayer: { gridColorRamp },
    filters: { boundary },
    embeddedMap: { embed: isEmbedded, config },
}) {
    return {
        resetButtonClickCount,
        clientInfoFetched: fetched,
        countryCode: countryCode || COUNTRY_CODES.default,
        facilityDetailsData: data,
        gridColorRamp,
        extent: facilitiesData ? facilitiesData.extent : null,
        zoomToSearch,
        drawFilterActive,
        boundary,
        isEmbedded,
        mapStyle: config.map_style,
    };
}

function mapDispatchToProps(
    dispatch,
    { history: { push }, match: { params } },
) {
    const visitFacility = oarID => {
        if (oarID && oarID !== params?.oarID) {
            dispatch(resetSingleFacility());
            return push(makeFacilityDetailLink(oarID));
        }

        return noop();
    };
    return {
        handleMarkerClick: e => {
            const oarID = get(e, 'layer.properties.id', null);
            visitFacility(oarID);
        },
        handleFacilityClick: visitFacility,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VectorTileFacilitiesMap);
