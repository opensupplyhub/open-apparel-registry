import React, { Fragment, Component } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import noop from 'lodash/noop';
import mapboxgl from 'mapbox-gl';

import Button from './Button';

import { setOARMapViewport } from '../actions/oarMap';

import { facilityCollectionPropType } from '../util/propTypes';

import {
    makeFacilityDetailLink,
    getBBoxForArrayOfGeoJSONPoints,
} from '../util/util';

import {
    MAPBOX_TOKEN,
    FACILITIES_SOURCE,
    CLUSTER_MAX_ZOOM,
    CLUSTER_RADIUS,
    oarMapLayers,
    oarMapLayerIDEnum,
} from '../util/constants.oarmap';

mapboxgl.accessToken = MAPBOX_TOKEN;

const OARMapStyles = Object.freeze({
    copySearchButtonStyle: Object.freeze({
        position: 'absolute',
        right: '84px',
        top: '84px',
        fontSize: '12px',
    }),
});

const moveEvent = 'move';
const clickEvent = 'click';
const mouseEnterEvent = 'mouseenter';
const mouseLeaveEvent = 'mouseleave';
const pointerCursor = 'pointer';
const panCursor = '';

const createSourceFromData = data => Object.freeze({
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
    clusterRadius: CLUSTER_RADIUS,
});

class OARMap extends Component {
    constructor(props) {
        super(props);
        this.mapContainer = React.createRef();
        this.oarMap = null;
    }

    componentDidMount() {
        const {
            viewport: {
                lat,
                lng,
                zoom,
            },
        } = this.props;

        this.oarMap = new mapboxgl.Map({
            container: this.mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v9',
            attributionControl: false,
            logoPosition: 'bottom-right',
            zoom,
            center: [
                lng,
                lat,
            ],
        });

        this.oarMap.addControl(new mapboxgl.AttributionControl({
            compact: true,
        }));

        this.oarMap.addControl(
            new mapboxgl.NavigationControl(),
            'top-right',
        );

        this.oarMap.on(moveEvent, this.handleMapMove);
        this.oarMap.on(clickEvent, this.handleMapClick);
    }

    componentDidUpdate({ fetching: wasFetching }) {
        const {
            fetching,
            error,
            data,
        } = this.props;

        if (fetching) {
            return null;
        }

        if (error) {
            return null;
        }

        if (!wasFetching) {
            return null;
        }

        if (!data) {
            return null;
        }

        if (this.oarMap.getSource(FACILITIES_SOURCE)) {
            this.oarMap.getSource(FACILITIES_SOURCE).setData(data);
        } else {
            this.oarMap.addSource(
                FACILITIES_SOURCE,
                createSourceFromData(data),
            );

            oarMapLayers.forEach((layer) => { this.oarMap.addLayer(layer); });
            this.oarMap.on(mouseEnterEvent, oarMapLayerIDEnum.points, this.makePointerCursor);
            this.oarMap.on(mouseLeaveEvent, oarMapLayerIDEnum.points, this.makePanCursor);
        }

        return null;
    }

    componentWillUnmount() {
        this.oarMap.off(moveEvent, this.handleMapMove);
        this.oarMap.off(clickEvent, this.handleMapClick);
        this.oarMap.off(mouseEnterEvent, oarMapLayerIDEnum.points, this.makePointerCursor);
        this.oarMap.off(mouseLeaveEvent, oarMapLayerIDEnum.points, this.makePanCursor);
    }

    handleMapMove = () => {
        const { lng, lat } = this.oarMap.getCenter();
        const zoom = this.oarMap.getZoom();

        const updatedViewport = Object.freeze({
            lat,
            lng,
            zoom,
        });

        return this.props.updateViewport(updatedViewport);
    };

    handleMapClick = ({ point }) => {
        if (!this.oarMap.getLayer(oarMapLayerIDEnum.points)) {
            return null;
        }

        const [
            feature,
            ...rest
        ] = this
            .oarMap
            .queryRenderedFeatures(point, {
                layers: [
                    oarMapLayerIDEnum.points,
                ],
            });

        if (!feature || rest.length) {
            return null;
        }

        if (feature.properties.point_count && feature.properties.point_count > 1) {
            // If the click's on a cluster, fly to the location at a zoom level
            // at which points uncluster
            const {
                properties: {
                    cluster_id: clusterId,
                },
            } = feature;

            const facilitiesDataSource = this.oarMap.getSource(FACILITIES_SOURCE);

            facilitiesDataSource.getClusterLeaves(
                clusterId,
                feature.properties.point_count,
                0,
                (err, geojson) => {
                    if (!err) {
                        this.oarMap.fitBounds(
                            getBBoxForArrayOfGeoJSONPoints(geojson),
                            { padding: 50 },
                        );
                    }

                    return null;
                },
            );

            return null;
        }

        return feature.properties.oar_id
            ? this.props.navigateToFacilityDetails(feature.properties.oar_id)
            : null;
    };

    makePointerCursor = () => {
        this.oarMap.getCanvas().style.cursor = pointerCursor;
    };

    makePanCursor = () => {
        this.oarMap.getCanvas().style.cursor = panCursor;
    };

    render() {
        return (
            <Fragment>
                <div
                    ref={this.mapContainer}
                    id="map"
                />
                <CopyToClipboard
                    text={window.location.href}
                    onCopy={() => toast('Copied search to clipboard')}
                >
                    <Button
                        text="Share This Search"
                        onClick={noop}
                        style={OARMapStyles.copySearchButtonStyle}
                    />
                </CopyToClipboard>
            </Fragment>
        );
    }
}

OARMap.defaultProps = {
    data: null,
    error: null,
};

OARMap.propTypes = {
    updateViewport: func.isRequired,
    navigateToFacilityDetails: func.isRequired,
    viewport: shape({
        lat: number.isRequired,
        lng: number.isRequired,
        zoom: number.isRequired,
    }).isRequired,
    data: facilityCollectionPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
};

function mapStateToProps({
    oarMap: {
        viewport,
    },
    facilities: {
        facilities: {
            data,
            fetching,
            error,
        },
    },
}) {
    return {
        viewport,
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch, {
    history: {
        push,
    },
}) {
    return {
        updateViewport: v => dispatch(setOARMapViewport(v)),
        navigateToFacilityDetails: id => push(makeFacilityDetailLink(id)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OARMap);
