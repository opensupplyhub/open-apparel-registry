import React, { useEffect, useRef, useState, useMemo } from 'react';
import { bool, func, number, string } from 'prop-types';
import { connect } from 'react-redux';
import VectorGridDefault from 'react-leaflet-vectorgrid';
import { withLeaflet, Popup } from 'react-leaflet';
import L from 'leaflet';
import get from 'lodash/get';
import noop from 'lodash/noop';
import filter from 'lodash/filter';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import intersection from 'lodash/intersection';
import sortBy from 'lodash/sortBy';

import { OARColor } from '../util/constants';
import FacilitiesMapPopup from './FacilitiesMapPopup';

import {
    createQueryStringFromSearchFilters,
    createTileURLWithQueryString,
    createTileCacheKeyWithEncodedFilters,
} from '../util/util';

const VectorGrid = withLeaflet(VectorGridDefault);

const createMarkerIcon = (color = '#838BA5') => {
    const fill = color.replace('#', '%23');
    return L.icon({
        iconUrl: `data:image/svg+xml;utf8,<svg fill="${fill}" height="506" viewBox="0 0 384 506" width="384" xmlns="http://www.w3.org/2000/svg"><path d="m0 192c0-106.039 85.961-192 192-192s192 85.961 192 192c0 70.692667-64 175.359373-192 314.00012-128-138.640747-192-243.307453-192-314.00012zm192 80c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>`,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
    });
};

const unselectedMarkerIcon = createMarkerIcon();

function useUpdateTileURL(
    tileURL,
    performingNewSearch,
    resetButtonClickCount,
    closeMultipleFacilitiesPopup,
) {
    const [
        vectorTileURLWithQueryParams,
        setVectorTileURLWithQueryParams,
    ] = useState(tileURL);

    const [isFetching, setIsFetching] = useState(performingNewSearch);
    const [storedResetCount, setStoredResetCount] = useState(
        resetButtonClickCount,
    );

    useEffect(() => {
        if (performingNewSearch && !isFetching) {
            setIsFetching(true);
        } else if (!performingNewSearch && isFetching) {
            setIsFetching(false);
            setVectorTileURLWithQueryParams(tileURL);
        } else if (resetButtonClickCount !== storedResetCount) {
            setIsFetching(false);
            closeMultipleFacilitiesPopup();
            setStoredResetCount(resetButtonClickCount);
            setVectorTileURLWithQueryParams(tileURL);
        }
    }, [
        tileURL,
        setVectorTileURLWithQueryParams,
        isFetching,
        setIsFetching,
        performingNewSearch,
        storedResetCount,
        setStoredResetCount,
        resetButtonClickCount,
        closeMultipleFacilitiesPopup,
    ]);

    return vectorTileURLWithQueryParams;
}

const useUpdateTileLayerWithMarkerForSelectedOARID = (
    oarID,
    selectedMarkerIcon,
    otherFacilitiesAtPoint = [],
) => {
    const tileLayerRef = useRef(null);

    const [currentSelectedMarkerID, setCurrentSelectedMarkerID] = useState(
        oarID,
    );

    useEffect(() => {
        const oarIDsAtSamePoint = map(otherFacilitiesAtPoint, f =>
            get(f, 'properties.oar_id', null),
        );
        const oarIDForSharedMarker = get(
            otherFacilitiesAtPoint,
            '[0].properties.visibleMarkerOARID',
            null,
        );

        const tileLayer = get(tileLayerRef, 'current.leafletElement', null);

        if (!tileLayer) {
            noop();
        } else if (!oarID && currentSelectedMarkerID) {
            tileLayer.setFeatureStyle(currentSelectedMarkerID, {
                icon: unselectedMarkerIcon,
            });

            setCurrentSelectedMarkerID(null);
        } else if (
            oarIDsAtSamePoint.length < 2 &&
            oarID !== currentSelectedMarkerID
        ) {
            tileLayer.setFeatureStyle(currentSelectedMarkerID, {
                icon: unselectedMarkerIcon,
            });

            tileLayer.setFeatureStyle(oarID, {
                icon: selectedMarkerIcon,
            });

            setCurrentSelectedMarkerID(oarID);
        } else if (
            intersection(oarIDsAtSamePoint, [oarID, currentSelectedMarkerID])
                .length
        ) {
            if (currentSelectedMarkerID) {
                tileLayer.setFeatureStyle(currentSelectedMarkerID, {
                    icon: unselectedMarkerIcon,
                });
            }

            if (oarIDForSharedMarker) {
                tileLayer.setFeatureStyle(oarIDForSharedMarker, {
                    icon: selectedMarkerIcon,
                });

                setCurrentSelectedMarkerID(oarIDForSharedMarker);
            }
        }
        /* eslint-disable react-hooks/exhaustive-deps */
        // Disabled to prevent rerendering due to marker changes
    }, [
        oarID,
        currentSelectedMarkerID,
        setCurrentSelectedMarkerID,
        tileLayerRef,
        otherFacilitiesAtPoint,
    ]);

    return tileLayerRef;
};

const findFacilitiesAtSamePointFromVectorTile = (data, tileLayerRef = null) => {
    const properties = get(data, 'layer.properties', null);

    const vectorTileLayer = get(tileLayerRef, 'current.leafletElement', null);

    if (!properties || !vectorTileLayer) {
        return [];
    }

    const { x, y, z, id } = properties;

    if (!x || !y || !z || !id) {
        return [];
    }

    const tileKey = `${x}:${y}:${z}`;
    const featuresInVectorTile = get(
        vectorTileLayer,
        `_vectorTiles[${tileKey}]._features`,
        {},
    );

    const clickedFeature = get(featuresInVectorTile, `[${id}].feature`, null);

    if (!clickedFeature) {
        return [];
    }

    return map(
        filter(Object.values(featuresInVectorTile), f => {
            const featureProperties = get(f, 'feature.properties', null);
            const featurePoint = get(f, 'feature._point', null);
            const clickedFeaturePoint = get(clickedFeature, '_point', null);

            return (
                featureProperties &&
                featurePoint &&
                clickedFeaturePoint &&
                isEqual(featurePoint, clickedFeaturePoint)
            );
        }),
        f => ({
            properties: {
                oar_id: get(f, 'feature.properties.id', null),
                name: get(f, 'feature.properties.name', null),
                address: get(f, 'feature.properties.address', null),
                visibleMarkerOARID: get(clickedFeature, 'properties.id', null),
            },
        }),
    );
};

const VectorTileFacilitiesLayer = ({
    tileURL,
    handleMarkerClick,
    fetching,
    resetButtonClickCount,
    tileCacheKey,
    oarID,
    pushRoute,
    minZoom,
    maxZoom,
    iconColor,
}) => {
    const [multipleFacilitiesAtPoint, setMultipleFacilitiesAtPoint] = useState(
        null,
    );

    const [
        multipleFacilitiesAtPointPosition,
        setMultipleFacilitiesAtPointPosition,
    ] = useState(null);

    const selectedMarkerIcon = useMemo(() => createMarkerIcon(iconColor), [
        iconColor,
    ]);

    const closeMultipleFacilitiesPopup = () =>
        setMultipleFacilitiesAtPointPosition(null);

    const vectorTileURL = useUpdateTileURL(
        tileURL,
        fetching,
        resetButtonClickCount,
        closeMultipleFacilitiesPopup,
    );

    const selectFacilityOnClick = facilityID =>
        pushRoute(`/facilities/${facilityID}`);

    const vectorTileLayerRef = useUpdateTileLayerWithMarkerForSelectedOARID(
        oarID,
        selectedMarkerIcon,
        multipleFacilitiesAtPoint,
    );

    if (!tileCacheKey) {
        // We throw an error here if the tile cache key is missing.
        // This crashes the map, intentionally, but an ErrorBoundary
        // handles the crash so that the application continues to run.
        throw new Error('Missing tile cache key');
    }

    const handleVectorLayerClick = data => {
        try {
            setMultipleFacilitiesAtPoint(null);

            const facilitiesAtSamePoint = findFacilitiesAtSamePointFromVectorTile(
                data,
                vectorTileLayerRef,
            );

            if (facilitiesAtSamePoint.length < 1) {
                return noop();
            }

            if (facilitiesAtSamePoint.length === 1) {
                return handleMarkerClick(data);
            }

            setMultipleFacilitiesAtPoint(facilitiesAtSamePoint);
            return setMultipleFacilitiesAtPointPosition(data.latlng);
        } catch (e) {
            window.console.error(e);

            return noop();
        }
    };

    useEffect(() => {
        // Close multiple facilities popup on fresh searches
        if (fetching) {
            closeMultipleFacilitiesPopup();
        }
    }, [fetching]);

    return (
        <>
            <VectorGrid
                ref={vectorTileLayerRef}
                key={vectorTileURL}
                url={vectorTileURL}
                type="protobuf"
                rendererFactory={L.canvas.tile}
                minZoom={minZoom}
                maxZoom={maxZoom}
                vectorTileLayerStyles={{
                    facilities(properties) {
                        const facilityID = get(properties, 'id', null);

                        return {
                            icon:
                                oarID && facilityID === oarID
                                    ? selectedMarkerIcon
                                    : unselectedMarkerIcon,
                        };
                    },
                }}
                subdomains=""
                zIndex={100}
                interactive
                onClick={handleVectorLayerClick}
                getFeatureId={f => get(f, 'properties.id', null)}
            />
            {multipleFacilitiesAtPointPosition &&
                multipleFacilitiesAtPoint &&
                multipleFacilitiesAtPoint.length && (
                    <Popup
                        position={multipleFacilitiesAtPointPosition}
                        onClose={closeMultipleFacilitiesPopup}
                    >
                        <FacilitiesMapPopup
                            facilities={sortBy(
                                multipleFacilitiesAtPoint.slice(),
                                f => get(f, 'properties.name', null),
                            )}
                            closePopup={() =>
                                setMultipleFacilitiesAtPointPosition(null)
                            }
                            selectFacilityOnClick={selectFacilityOnClick}
                            selectedFacilityID={oarID}
                        />
                    </Popup>
                )}
        </>
    );
};

VectorTileFacilitiesLayer.defaultProps = {
    oarID: null,
};

VectorTileFacilitiesLayer.propTypes = {
    handleMarkerClick: func.isRequired,
    tileURL: string.isRequired,
    tileCacheKey: string.isRequired,
    fetching: bool.isRequired,
    resetButtonClickCount: number.isRequired,
    oarID: string,
    pushRoute: func.isRequired,
};

function mapStateToProps({
    filters,
    facilities: {
        facilities: { fetching },
    },
    ui: {
        facilitiesSidebarTabSearch: { resetButtonClickCount },
    },
    vectorTileLayer: { key },
    embeddedMap: { config },
}) {
    const querystring = createQueryStringFromSearchFilters(filters);
    const tileCacheKey = createTileCacheKeyWithEncodedFilters(filters, key);
    const tileURL = createTileURLWithQueryString(
        querystring,
        tileCacheKey,
        false,
    );

    return {
        tileURL,
        tileCacheKey,
        fetching,
        resetButtonClickCount,
        iconColor: config.color || OARColor,
    };
}

export default connect(mapStateToProps)(VectorTileFacilitiesLayer);
