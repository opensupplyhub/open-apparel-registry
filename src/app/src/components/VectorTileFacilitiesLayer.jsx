import React, { useEffect, useRef, useState } from 'react';
import { bool, func, number, string } from 'prop-types';
import { connect } from 'react-redux';
import VectorGridDefault from 'react-leaflet-vectorgrid';
import { withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import { createQueryStringFromSearchFilters } from '../util/util';

const VectorGrid = withLeaflet(VectorGridDefault);

const createMarkerIcon = iconUrl => L.icon({
    iconUrl,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
});

const selectedMarkerIcon = createMarkerIcon('/images/selectedmarker.png');
const unselectedMarkerIcon = createMarkerIcon('/images/marker.png');

function useUpdateTileURL(tileURL, performingNewSearch, resetButtonClickCount) {
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
    ]);

    return vectorTileURLWithQueryParams;
}

const useUpdateTileLayerWithMarkerForSelectedOARID = (oarID) => {
    const tileLayerRef = useRef(null);

    const [currentSelectedMarkerID, setCurrentSelectedMarkerID] = useState(oarID);

    useEffect(() => {
        if (tileLayerRef && (oarID !== currentSelectedMarkerID)) {
            const tileLayer = get(
                tileLayerRef,
                'current.leafletElement',
            );

            tileLayer.setFeatureStyle(currentSelectedMarkerID, {
                icon: unselectedMarkerIcon,
            });

            tileLayer.setFeatureStyle(oarID, {
                icon: selectedMarkerIcon,
            });

            setCurrentSelectedMarkerID(oarID);
        }
    }, [oarID, currentSelectedMarkerID, setCurrentSelectedMarkerID, tileLayerRef]);

    return tileLayerRef;
};

const VectorTileFacilitiesLayer = ({
    tileURL,
    handleMarkerClick,
    fetching,
    resetButtonClickCount,
    tileCacheKey,
    getNewCacheKey,
    oarID,
}) => {
    const vectorTileURL = useUpdateTileURL(
        tileURL,
        fetching,
        resetButtonClickCount,
        getNewCacheKey,
    );

    const vectorTileLayerRef = useUpdateTileLayerWithMarkerForSelectedOARID(oarID);

    if (!tileCacheKey) {
        // We throw an error here if the tile cache key is missing.
        // This crashes the map, intentionally, but an ErrorBoundary
        // handles the crash so that the application continues to run.
        throw new Error('Missing tile cache key');
    }

    return (
        <VectorGrid
            ref={vectorTileLayerRef}
            key={vectorTileURL}
            url={vectorTileURL}
            type="protobuf"
            rendererFactory={L.canvas.tile}
            vectorTileLayerStyles={{
                facilities(properties) {
                    const facilityID = get(properties, 'id', null);

                    return {
                        icon: (oarID && facilityID === oarID)
                            ? selectedMarkerIcon
                            : unselectedMarkerIcon,
                    };
                },
            }}
            subdomains=""
            zIndex={100}
            interactive
            onClick={handleMarkerClick}
            getFeatureId={f => get(f, 'properties.id', null)}
        />
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

const createURLWithQueryString = (qs, key) =>
    `/tile/facilities/${key}/{z}/{x}/{y}.pbf`.concat(isEmpty(qs) ? '' : `?${qs}`);

function mapStateToProps({
    filters,
    facilities: {
        facilities: { fetching },
    },
    ui: {
        facilitiesSidebarTabSearch: { resetButtonClickCount },
    },
    vectorTileLayer: {
        key,
    },
}) {
    const tileURL = createURLWithQueryString(
        createQueryStringFromSearchFilters(filters),
        key,
    );

    return {
        tileURL,
        tileCacheKey: key,
        fetching,
        resetButtonClickCount,
    };
}

export default connect(
    mapStateToProps,
)(VectorTileFacilitiesLayer);
