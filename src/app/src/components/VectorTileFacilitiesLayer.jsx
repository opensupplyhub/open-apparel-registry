import React, { useEffect, useState } from 'react';
import { bool, func, number, string } from 'prop-types';
import { connect } from 'react-redux';
import VectorGridDefault from 'react-leaflet-vectorgrid';
import { withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import isEmpty from 'lodash/isEmpty';

import { createQueryStringFromSearchFilters } from '../util/util';

const VectorGrid = withLeaflet(VectorGridDefault);

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

const VectorTileFacilitiesLayer = ({
    tileURL,
    handleClick,
    fetching,
    resetButtonClickCount,
    tileCacheKey,
    getNewCacheKey,
}) => {
    const vectorTileURL = useUpdateTileURL(
        tileURL,
        fetching,
        resetButtonClickCount,
        getNewCacheKey,
    );

    if (!tileCacheKey) {
        // We throw an error here if the tile cache key is missing.
        // This crashes the map, intentionally, but an ErrorBoundary
        // handles the crash so that the application continues to run.
        throw new Error('Missing tile cache key');
    }

    return (
        <VectorGrid
            key={vectorTileURL}
            url={vectorTileURL}
            type="protobuf"
            rendererFactory={L.canvas.tile}
            vectorTileLayerStyles={{
                facilities: {
                    icon: L.icon({
                        iconUrl: '/images/marker.png',
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                    }),
                },
            }}
            subdomains=""
            zIndex={100}
            interactive
            onClick={handleClick}
        />
    );
};

VectorTileFacilitiesLayer.propTypes = {
    handleClick: func.isRequired,
    tileURL: string.isRequired,
    tileCacheKey: string.isRequired,
    fetching: bool.isRequired,
    resetButtonClickCount: number.isRequired,
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

function mapDispatchToProps() {
    return {
        handleClick: ({ layer }) => window.console.log(layer),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VectorTileFacilitiesLayer);
