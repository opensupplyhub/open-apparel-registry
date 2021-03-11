import React, { useEffect, useRef, useState } from 'react';
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

import FacilitiesMapPopup from './FacilitiesMapPopup';

import {
    createQueryStringFromSearchFilters,
    createTileURLWithQueryString,
    createTileCacheKeyWithEncodedFilters,
} from '../util/util';

const VectorGrid = withLeaflet(VectorGridDefault);

const createMarkerIcon = iconUrl =>
    L.icon({
        iconUrl,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
    });

const selectedMarkerIcon = createMarkerIcon('/images/selectedmarker.png');
const unselectedMarkerIcon = createMarkerIcon('/images/marker.png');

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
}) => {
    const [multipleFacilitiesAtPoint, setMultipleFacilitiesAtPoint] = useState(
        null,
    );

    const [
        multipleFacilitiesAtPointPosition,
        setMultipleFacilitiesAtPointPosition,
    ] = useState(null);

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
    };
}

export default connect(mapStateToProps)(VectorTileFacilitiesLayer);
