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

const esriStyles = new Proxy(
    {},
    {
        get(_, prop) {
            if (prop !== 'Urban area') {
                return [];
            }

            return {
                fill: true,
                weight: 1,
                fillColor: '#800000',
                color: '#800000',
                fillOpacity: 0.2,
                opacity: 0.4,
            };
        },
    },
);

const VectorTileFacilitiesLayer = ({ tileURL, handleClick }) => (
    <VectorGrid
        url={tileURL}
        type="protobuf"
        attribution="© ESRI"
        rendererFactory={L.canvas.tile}
        vectorTileLayerStyles={esriStyles}
        subdomains="abcd"
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
    'https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/{z}/{y}/{x}.pbf'.concat(
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
