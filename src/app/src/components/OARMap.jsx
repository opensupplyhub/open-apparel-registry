import React, { Fragment, Component } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import noop from 'lodash/noop';
import mapboxgl from 'mapbox-gl';

import Button from './Button';
import OARMapPopup from './OARMapPopup';
import ShowOnly from './ShowOnly';

import { setOARMapViewport } from '../actions/oarMap';

import {
    facilityPropType,
    facilityCollectionPropType,
} from '../util/propTypes';

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

const loadEvent = 'load';
const moveEvent = 'move';
const clickEvent = 'click';
const mouseEnterEvent = 'mouseenter';
const mouseLeaveEvent = 'mouseleave';
const pointerCursor = 'pointer';
const panCursor = '';
const popupCloseEvent = 'close';

const createSourceFromData = data => Object.freeze({
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
    clusterRadius: CLUSTER_RADIUS,
});

const disambiguationMarkerPopupID = 'disambiguation-marker';
const disambiguationMarkerPopupContent = 'disambiguation-marker-popup-content';

class OARMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            facilitiesForDisambiguation: null,
            disambiguationPopupIsOpen: false,
        };
        this.mapContainer = React.createRef();
        this.oarMap = null;
        this.disambiguationPopup = null;
    }

    componentDidMount() {
        const {
            viewport: {
                lat,
                lng,
                zoom,
            },
            data,
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

        this.oarMap.on(loadEvent, () => {
            if (data) {
                this.oarMap.addSource(
                    FACILITIES_SOURCE,
                    createSourceFromData(data),
                );

                oarMapLayers.forEach((layer) => { this.oarMap.addLayer(layer); });
                this.oarMap.on(mouseEnterEvent, oarMapLayerIDEnum.points, this.makePointerCursor);
                this.oarMap.on(mouseLeaveEvent, oarMapLayerIDEnum.points, this.makePanCursor);
            }
        });

        this.disambiguationPopup = new mapboxgl
            .Popup({
                closeOnClick: true,
                closeButton: false,
            })
            .setHTML(`<div id=${disambiguationMarkerPopupID}></div>`);

        this.disambiguationPopup.on(
            popupCloseEvent,
            this.handleDisambiguationPopupClose,
        );
    }

    componentDidUpdate({ fetching: wasFetching }) {
        const {
            fetching,
            error,
            data,
            singleFacilityData,
        } = this.props;

        if (fetching) {
            return null;
        }

        if (error) {
            return null;
        }

        if (!wasFetching && !singleFacilityData) {
            return null;
        }

        if (!data) {
            return null;
        }

        if (this.oarMap.getSource(FACILITIES_SOURCE)) {
            this.oarMap.getSource(FACILITIES_SOURCE).setData(data);
            this.toggleHighlightedPoint();
        } else {
            this.oarMap.addSource(
                FACILITIES_SOURCE,
                createSourceFromData(data),
            );

            oarMapLayers.forEach((layer) => { this.oarMap.addLayer(layer); });
            this.oarMap.on(mouseEnterEvent, oarMapLayerIDEnum.points, this.makePointerCursor);
            this.oarMap.on(mouseLeaveEvent, oarMapLayerIDEnum.points, this.makePanCursor);
            this.toggleHighlightedPoint();
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

    handleDisambiguationPopupClose = () =>
        this.setState(state => Object.assign({}, state, {
            facilitiesForDisambiguation: null,
            dismabiguationPopupIsOpen: false,
        }));

    handleMapClick = ({ point, lngLat }) => {
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

        if (!feature) {
            return null;
        }

        if (rest.length) {
            this.disambiguationPopup.setLngLat(lngLat).addTo(this.oarMap);

            return this.setState(state => Object.assign({}, state, {
                facilitiesForDisambiguation: [feature].concat(rest),
                disambiguationPopupIsOpen: true,
            }));
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

    toggleHighlightedPoint = () => {
        const {
            match: {
                params: {
                    oarID,
                },
            },
        } = this.props;

        if (!this.oarMap) {
            return null;
        }

        return this
            .oarMap
            .setFilter(oarMapLayerIDEnum.highlightedPoint, Object.freeze([
                '==',
                'oar_id',
                (oarID || ''),
            ]));
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
                <ShowOnly when={this.state.disambiguationPopupIsOpen}>
                    <OARMapPopup
                        facilities={this.state.facilitiesForDisambiguation}
                        domNodeID={disambiguationMarkerPopupID}
                        popupContentElementID={disambiguationMarkerPopupContent}
                        selectedFacilityID={this.props.match.params.oarID}
                    />
                </ShowOnly>
            </Fragment>
        );
    }
}

OARMap.defaultProps = {
    data: null,
    error: null,
    match: Object.freeze({
        params: Object.freeze({
            oarID: null,
        }),
    }),
    singleFacilityData: null,
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
    match: shape({
        params: shape({
            oarID: string,
        }),
    }),
    singleFacilityData: facilityPropType,
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
        singleFacility: {
            data: singleFacilityData,
        },
    },
}) {
    return {
        viewport,
        data,
        fetching,
        error,
        singleFacilityData,
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
