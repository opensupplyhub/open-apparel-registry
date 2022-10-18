import React, { useState } from 'react';
import { array, arrayOf, bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { Map as ReactLeafletMap, ZoomControl, GeoJSON } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import L from 'leaflet';
import Control from 'react-leaflet-control';
import noop from 'lodash/noop';
import get from 'lodash/get';

import VectorTileFacilitiesLayer from './VectorTileFacilitiesLayer';
import VectorTileFacilityGridLayer from './VectorTileFacilityGridLayer';
import VectorTileGridLegend from './VectorTileGridLegend';
import SearchControls from './SearchControls';
import PolygonalSearchControl from './PolygonalSearchControl';

import {
    COUNTRY_CODES,
    SILVER_MAP_STYLE,
    facilitiesRoute,
    mainRoute,
} from '../util/constants';

import { makeFacilityDetailLink, getIsMobile } from '../util/util';

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
});

function VectorTileFacilitiesMap({
    resetButtonClickCount,
    clientInfoFetched,
    countryCode,
    handleMarkerClick,
    handleFacilityClick,
    match: {
        params: { osID },
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
    mapStyle = 'silver',
    navigateToFacilities,
    isMobile,
    disableZoom,
    disableZoomToSearch,
}) {
    const mapRef = useUpdateLeafletMapImperatively(resetButtonClickCount, {
        osID,
        data: facilityDetailsData,
        shouldPanMapToFacilityDetails: get(
            location,
            'state.panMapToFacilityDetails',
            false,
        ),
        isVectorTileMap: true,
        extent,
        zoomToSearch: disableZoomToSearch ? false : zoomToSearch,
        boundary,
    });

    const [currentMapZoomLevel, setCurrentMapZoomLevel] = useState(
        osID ? detailsZoomLevel : initialZoom,
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
            scrollWheelZoom={!isEmbedded && !isMobile && !disableZoom}
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
            <ZoomControl position="bottomright" />
            <VectorTileFacilitiesLayer
                handleMarkerClick={handleMarkerClick}
                handleFacilityClick={handleFacilityClick}
                osID={osID}
                pushRoute={push}
                minZoom={maxVectorTileFacilitiesGridZoom + 1}
                maxZoom={22}
            />
            {currentMapZoomLevel <= maxVectorTileFacilitiesGridZoom && (
                <VectorTileFacilityGridLayer
                    handleCellClick={handleCellClick}
                    minZoom={1}
                    maxZoom={maxVectorTileFacilitiesGridZoom}
                    zoomLevel={currentMapZoomLevel}
                />
            )}
            {drawFilterActive && (
                <PolygonalSearchControl
                    navigateToFacilities={navigateToFacilities}
                />
            )}

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
            osID: string,
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
        window: { innerWidth: windowInnerWidth },
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
        isMobile: getIsMobile(windowInnerWidth),
    };
}

function mapDispatchToProps(
    dispatch,
    { history: { push, replace, location }, match: { params } },
) {
    const navigateToFacilities = () => {
        if (location?.pathname === mainRoute) {
            replace(`${facilitiesRoute}/${location?.search}`);
        }
        return noop();
    };
    const visitFacility = osID => {
        if (osID && osID !== params?.osID) {
            dispatch(resetSingleFacility());
            return push(makeFacilityDetailLink(osID));
        }

        return noop();
    };
    return {
        handleMarkerClick: e => {
            const osID = get(e, 'layer.properties.id', null);
            visitFacility(osID);
        },
        handleFacilityClick: visitFacility,
        navigateToFacilities,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VectorTileFacilitiesMap);
