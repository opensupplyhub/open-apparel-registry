import React, { useEffect, useState } from 'react';
import { bool, func, number, string } from 'prop-types';
import { connect } from 'react-redux';
import VectorGridDefault from 'react-leaflet-vectorgrid';
import { withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import isEmpty from 'lodash/isEmpty';
import flow from 'lodash/flow';

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
}) => {
    const vectorTileURL = useUpdateTileURL(
        tileURL,
        fetching,
        resetButtonClickCount,
    );

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
                        iconAnchor: [30, 40],
                        popupAnchor: null,
                        shadowUrl: null,
                        shadowSize: null,
                        shadowAnchor: null,
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
    fetching: bool.isRequired,
    resetButtonClickCount: number.isRequired,
};

const createURLWithQueryString = qs =>
    '/tile/facilities/{z}/{x}/{y}.pbf'.concat(isEmpty(qs) ? '' : `?${qs}`);

function mapStateToProps({
    filters,
    facilities: {
        facilities: { fetching },
    },
    ui: {
        facilitiesSidebarTabSearch: { resetButtonClickCount },
    },
}) {
    const tileURL = flow(
        createQueryStringFromSearchFilters,
        createURLWithQueryString,
    )(filters);

    return {
        tileURL,
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
