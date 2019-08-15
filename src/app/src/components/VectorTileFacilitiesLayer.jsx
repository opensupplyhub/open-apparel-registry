import React from 'react';
import { func, string } from 'prop-types';
import { connect } from 'react-redux';
import VectorGridDefault from 'react-leaflet-vectorgrid';
import { withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import isEmpty from 'lodash/isEmpty';
import flow from 'lodash/flow';

import { createQueryStringFromSearchFilters } from '../util/util';

const VectorGrid = withLeaflet(VectorGridDefault);

const VectorTileFacilitiesLayer = ({ tileURL, handleClick }) => (
    <VectorGrid
        url={tileURL}
        type="protobuf"
        rendererFactory={L.svg.tile}
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

VectorTileFacilitiesLayer.propTypes = {
    handleClick: func.isRequired,
    tileURL: string.isRequired,
};

const createURLWithQueryString = qs =>
    '/tile/facilities/{z}/{x}/{y}.pbf'.concat(
        isEmpty(qs) ? '' : `?${qs}`,
    );

function mapStateToProps({ filters }) {
    const tileURL = flow(
        createQueryStringFromSearchFilters,
        createURLWithQueryString,
    )(filters);

    window.console.log(tileURL);

    return {
        tileURL,
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
