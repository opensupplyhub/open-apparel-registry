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

import { SelectedMarkerColor } from '../util/constants';
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
        iconUrl: `data:image/svg+xml;utf8,<svg width="32" height="42" viewBox="0 0 32 42" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M19.5393 13.3319L19.5381 13.3307C18.5694 12.3481 17.3722 11.8399 16 11.8399C14.6277 11.8399 13.4309 12.3482 12.4633 13.3313C11.4952 14.3149 11 15.5239 11 16.9039C11 18.2838 11.495 19.4922 12.4633 20.4746C13.4307 21.4588 14.6275 21.9679 16 21.9679C17.3728 21.9679 18.5701 21.4587 19.5387 20.4746C20.5058 19.492 21 18.2835 21 16.9039C21 15.5244 20.5059 14.3156 19.5393 13.3319ZM4.80844 27.8042L4.80822 27.8039C2.22372 23.9245 1 20.434 1 17.3103C1 12.4608 2.52552 8.69462 5.50969 5.89893L5.50984 5.89878C8.54893 3.05045 12.032 1.64795 16 1.64795C19.968 1.64795 23.4511 3.05045 26.4902 5.89878L26.4903 5.89893C29.4745 8.69462 31 12.4608 31 17.3103C31 20.4341 29.7768 23.9247 27.1937 27.8041C24.7177 31.5218 20.9973 35.5748 16 39.9617C11.0028 35.5748 7.28309 31.5218 4.80844 27.8042Z" fill="${fill}" stroke="%230D1128" stroke-width="2"/></svg>`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
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
    handleFacilityClick,
    fetching,
    resetButtonClickCount,
    tileCacheKey,
    oarID,
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

    const selectFacilityOnClick = facilityID => {
        handleFacilityClick(facilityID);
    };

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
    embeddedMap: { config, embed },
}) {
    const querystring = createQueryStringFromSearchFilters(filters, embed);
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
        iconColor:
            config.selectedMarkerColor || config.color || SelectedMarkerColor,
    };
}

export default connect(mapStateToProps)(VectorTileFacilitiesLayer);
