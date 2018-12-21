import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import mapboxgl from 'mapbox-gl';
import _ from 'lodash';
import * as turf from '@turf/turf';
import supercluster from 'supercluster';
import Grid from '@material-ui/core/Grid';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import ControlPanel from './ControlPanel';
import * as mapActions from '../actions/map';
import Button from '../components/Button';
import MapLayers from '../components/MapLayers';
import LandingAlert from '../components/LandingAlert';
import '../styles/css/Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const CIRCLE_COLOR = process.env.REACT_APP_MAP_COLOR;
const CIRCLE_COLOR_LIGHT = process.env.REACT_APP_MAP_COLOR_LIGHT;
const MAP_COLOR_TRANSPARENT = process.env.REACT_APP_MAP_COLOR_TRANSPARENT;
const MAP_COLOR_LIGHT_TRANSPARENT =
    process.env.REACT_APP_MAP_COLOR_LIGHT_TRANSPARENT;

const clusterMaxZoom = 100;
const clusterRadius = 50;

const mapStateToProps = ({ map, user }) => ({ map, user });

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(mapActions, dispatch),
});

class Map extends Component {
    state = {
        searchButton: {},
        openLayerDialog: false,
        mapStyle: 'light',
        circleColor: CIRCLE_COLOR,
        circleColorShadow: MAP_COLOR_TRANSPARENT,
        circleTextColor: '#fff',
        alertOpen: true,
    };

    componentDidMount() {
        if (this.props.match.params.name || this.props.match.params.country) {
            this.props.actions.resetMap();
        }

        // Init maps
        const { lng, lat, zoom } = this.props.map.viewport;
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [lng, lat],
            zoom,
            attributionControl: false,
            logoPosition: 'bottom-right',
        }).addControl(
            new mapboxgl.AttributionControl({
                compact: true,
            })
        );

        this.cluster = supercluster({
            radius: clusterRadius,
            maxZoom: clusterMaxZoom,
        });

        // Add nav control buttons to the map
        this.initControls();

        // Attach events to map.on
        this.onMapLoad();
    }

    onMapLoad = () => {
        // When move map, update viewport
        this.map.on('move', this.onMapMove);
        this.map.on('load', this.onLoadMap);

        // When a click event occurs on a feature in the points layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        this.map.on('click', 'points', this.onMapPointClick);

        // Change the cursor to a pointer when the mouse is over the points layer.
        this.map.on(
            'mouseenter',
            'points',
            () => (this.map.getCanvas().style.cursor = 'pointer')
        );

        // Change it back to a pointer when it leaves.
        this.map.on(
            'mouseleave',
            'points',
            () => (this.map.getCanvas().style.cursor = '')
        );
    };

    onMapMove = () => {
        const { lng, lat } = this.map.getCenter();
        this.props.actions.setViewport(
            lat.toFixed(4),
            lng.toFixed(4),
            this.map.getZoom().toFixed(2)
        );
    };

    onMapPointClick = e => {
        const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['points'],
        });

        if (!features.length && features[0] <= 0) {
            this.map.getCanvas().style.cursor = '';
            this.popup.remove();
            return;
        }

        // If this is not a cluster, select this point
        if (!features[0].properties.cluster) {
            this.props.actions.selectFactory(features[0].properties.uniqueId);
            // Highlight the selected point
            // Update the filter in the highlighted-point layer to only show the matching state, thus making a hover effect.
            this.map.setFilter('highlighted-point', [
                '==',
                'uniqueId',
                features[0].properties.uniqueId,
            ]);

            // Fly to the selected point, center the map around the selected point
            // this.flyto(features[0])
            return;
        }

        // LOOKUP THE clicked CLUSTER FEATURES UNDERLYING DATA POINTS
        this.cluster_id = features[0].properties.cluster_id;
        this.all_features = this.cluster.getLeaves(
            this.cluster_id,
            Math.floor(this.map.getZoom()),
            Infinity
        );

        // DISPLAY THE HOVERED FEATURES IN THE POPUP
        let featuresToDisplay = '';
        this.all_features.forEach(f => {
            featuresToDisplay += `<div class="popup-item display-flex notranslate" id="${
                f.properties.uniqueId
            }"><div class="display-flex"><div class="circle circle-size-12" id="${
                f.properties.uniqueId
            }"></div></div><span class="popup-text" id="${
                f.properties.uniqueId
            }">${f.properties.name}</span></div>`;
        });
        // Populate the popup and set its coordinates
        // based on the feature found.
        this.popup
            .setLngLat(features[0].geometry.coordinates)
            .setHTML(
                `<div class='popup-container notranslate'> ${featuresToDisplay} </div>`
            )
            .addTo(this.map);

        // Attach onclick event to popup items
        _.values(document.getElementsByClassName('popup-item')).forEach(
            point => {
                point.onclick = p => {
                    this.props.actions.selectFactory(p.target.id);
                    // Close popup
                    this.popup.remove();

                    // Fit bounds to the selected point
                    const selectedGeo = this.props.map.factoryGeojson.find(
                        f => f.properties.uniqueId === p.target.id
                    );
                    // Fly to the selected point, center the map around the selected point
                    // this.flyto(selectedGeo)
                    const twoNearestP = this.findNearestPoint(
                        selectedGeo,
                        this.all_features
                    );
                    if (twoNearestP) {
                        this.fitToBounds(twoNearestP, 100);
                    }

                    // Highlight the selected point
                    // Update the filter in the highlighted-point layer to only show the matching state, thus making a hover effect.
                    this.map.setFilter('highlighted-point', [
                        '==',
                        'uniqueId',
                        p.target.id,
                    ]);
                };
            }
        );
    };

    onLoadMap = () => {
        // Use SUPERCLUSTER to cluster the geojson data alongside the mapbox gl source
        this.cluster.load(this.props.map.factoryGeojson);
        this.addSource();

        this.addMapLayers();

        // If REACT_APP_MAP_THEME is true, enable multiple map themes
        if (process.env.REACT_APP_MAP_THEME) {
            this.map.on('style.load', () => {
                this.addSource();

                // Always add the same layers after a style change
                this.addMapLayers();
            });
        }

        // Create a popup, but don't add it to the map yet.
        this.popup = new mapboxgl.Popup({});
    };

    onClearSelectedFac = () => {
        this.props.actions.selectFactory(null);
        this.fitToBounds(this.props.map.factoryGeojson, 100);
    };

    onUpdate = val => {
        if (!val || val.length <= 0) {
            // Reset map
            if (this.map.getSource('point')) {
                const newSourceData = {
                    type: 'FeatureCollection',
                    features: [],
                };
                this.map.getSource('point').setData(newSourceData);
            }
            this.cluster.load([]);
            this.map.flyTo({
                center: [0, 0],
                zoom: 1.5,
                speed: 1,
                curve: 1,
                bearing: 0,
            });
        } else {
            const geojson = val.map(
                ({ name, address, source, uniqueId, longitude, latitude }) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    properties: { name, address, source, uniqueId },
                })
            );

            this.fitToBounds(geojson, 100);

            // Update map's geojson data
            const newSourceData = {
                type: 'FeatureCollection',
                features: geojson,
            };
            const source = this.map.getSource('point');
            if (source) {
                source.setData(newSourceData);
            }

            // Update cluster's geojson data
            this.cluster.load(geojson);
            this.props.actions.setFactories(val);
            this.props.actions.setFactoryGeo(geojson);
        }
    };

    onSelectFactory = id => this.props.actions.selectFactory(id);

    onChangeStyle = styleName => {
        const classicStyle = ['light', 'dark', 'streets', 'satellite'];
        const darkStyles = ['dark', 'satellite'];
        let circleTextColor = '#fff';
        let circleColor = CIRCLE_COLOR;
        let circleColorShadow = MAP_COLOR_TRANSPARENT;
        if (_.includes(darkStyles, styleName)) {
            circleColor = CIRCLE_COLOR_LIGHT;
            circleColorShadow = MAP_COLOR_LIGHT_TRANSPARENT;
            circleTextColor = '#000';
            this.setState({
                mapStyle: styleName,
                circleColor,
                circleColorShadow,
                circleTextColor,
            });
        } else {
            this.setState({
                mapStyle: styleName,
                circleColor,
                circleColorShadow,
                circleTextColor,
            });
        }

        const styleUrl = _.includes(classicStyle, styleName)
            ? `${styleName}-v9`
            : styleName;
        this.map.setStyle(`mapbox://styles/mapbox/${styleUrl}`);
    };

    getClipboardText = () =>
        `${window.location.host}/${this.objToQueryString(
            Object.assign(
                {},
                this.state.searchButton,
                this.props.map.selectedFactory
                    ? { factory: this.props.map.selectedFactory }
                    : {}
            )
        )}`;

    updateSearchButton = (name, country, contributor = null) =>
        this.setState({ searchButton: { name, country, contributor } });

    addSource = () => {
        this.map.addSource('point', {
            type: 'geojson',
            buffer: 1,
            maxzoom: 25,
            cluster: true,
            clusterMaxZoom, // Max zoom to cluster points on
            clusterRadius, // Radius of each cluster when clustering points (defaults to 50)
            data: {
                type: 'FeatureCollection',
                features: this.props.map.factoryGeojson,
            },
        });
    };

    // Fit to bounds for new data
    fitToBounds = (geojson, padding) => {
        const bounds = new mapboxgl.LngLatBounds();
        geojson.forEach(feature => bounds.extend(feature.geometry.coordinates));
        this.map.fitBounds(bounds, { padding, maxZoom: clusterMaxZoom });
    };

    flyto = selectedGeo => {
        this.map.flyTo({
            // These options control the ending camera position: centered at
            // the target, at max zoom level, and north up.
            center: selectedGeo.geometry.coordinates,
            // zoom: this.clusterMaxZoom,
            bearing: 0,

            // These options control the flight curve, making it move
            // slowly and zoom out almost completely before starting
            // to pan.
            speed: 1, // make the flying slow
            curve: 1, // change the speed at which it zooms out

            // This can be any easing function: it takes a number between
            // 0 and 1 and returns another number between 0 and 1.
            easing: t => t,
        });
    };

    findNearestPoint = (targetFeature, allFeatures) => {
        if (
            !targetFeature ||
            !targetFeature.geometry ||
            !targetFeature.geometry.coordinates
        ) {
            return;
        }
        const targetPoint = turf.point(targetFeature.geometry.coordinates);
        const uniqueFeatues = allFeatures.filter(
            a =>
                a.geometry.coordinates[0] !==
                    targetFeature.geometry.coordinates[0] &&
                a.geometry.coordinates[1] !==
                    targetFeature.geometry.coordinates[1]
        );

        const allPoints = uniqueFeatues.map(f =>
            turf.point(f.geometry.coordinates)
        );
        const points = turf.featureCollection(allPoints);
        const nearest = turf.nearestPoint(targetPoint, points);
        if (!nearest) {
            return;
        }
        const nearestFeature = uniqueFeatues[nearest.properties.featureIndex];
        return [targetFeature, nearestFeature];
    };

    addMapLayers = () => {
        [
            {
                id: 'points-shadow',
                source: 'point',
                type: 'circle',
                paint: {
                    'circle-color': this.state.circleColorShadow,
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        25,
                        100,
                        30,
                        660,
                        40,
                    ],
                },
            },
            {
                id: 'points',
                source: 'point',
                type: 'circle',
                paint: {
                    'circle-color': this.state.circleColor,
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        15,
                        90,
                        20,
                        650,
                        30,
                    ],
                },
            },
            {
                id: 'cluster-count',
                type: 'symbol',
                source: 'point',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': [
                        'DIN Offc Pro Medium',
                        'Arial Unicode MS Bold',
                    ],
                    'text-size': 12,
                },
                paint: {
                    'text-color': this.state.circleTextColor,
                },
            },
            {
                id: 'unclustered-point',
                type: 'circle',
                source: 'point',
                filter: ['!has', 'point_count'],
                paint: {
                    'circle-color': this.state.circleColor,
                    'circle-radius': 8,
                },
            },
            {
                id: 'highlighted-point',
                type: 'circle',
                source: 'point',
                paint: {
                    'circle-color': this.state.circleTextColor,
                    'circle-radius': 8,
                    'circle-stroke-width': 2.5,
                    'circle-stroke-color': this.state.circleColor,
                },
                filter: ['==', 'name', ''],
            },
        ].forEach(layer => this.map.addLayer(layer));
    };

    copySearchToClipboard = () => toast('Copied Search to Clipboard');

    // Converts an query string to a valid object. Ex: "?foo=bar" => { foo: "bar" }
    queryStringToObj = query => {
        if (!query) {
            return {};
        }

        const jsonObj = decodeURI(
            query
                .substring(1)
                .replace(/&/g, '","')
                .replace(/=/g, '":"')
        );

        return JSON.parse(`{"${jsonObj}"}`);
    };

    // Converts an object to a valid url query string. Ex: { foo: "bar" } => "?foo=bar"
    objToQueryString = obj => {
        if (!Object.keys(obj).length) {
            return '';
        }

        const str = Object.keys(obj).reduce(
            (acc, k) =>
                acc + (obj[k] && obj[k].length > 0 ? `${k}=${obj[k]}&` : ''),
            '?'
        );
        return str.substr(0, str.length - 1);
    };

    initControls = () => {
        const nav = new mapboxgl.NavigationControl();
        this.map.addControl(nav, 'top-right');

        // If REACT_APP_MAP_THEME is true, enable multiple map themes
        if (process.env.REACT_APP_MAP_THEME) {
            // Forked these following code from bumblebee to have two customized buttons for nav control
            const selectors = {
                layer:
                    '<button class="mapboxgl-ctrl-icon mapboxgl-ctrl-layers notranslate" id="mapboxgl-ctrl-layers" type="button"><i class="material-icons">layers</i></button>',
                extent:
                    '<button class="mapboxgl-ctrl-icon mapboxgl-ctrl-extent notranslate" id="mapboxgl-ctrl-extent" type="button"><i class="material-icons">zoom_out_map</i></button>',
                container: '.mapboxgl-ctrl-group.mapboxgl-ctrl',
            };

            const container = document.querySelector(
                '.mapboxgl-ctrl-group.mapboxgl-ctrl'
            );

            container.insertAdjacentHTML('afterbegin', selectors.layer);
            container.insertAdjacentHTML('afterbegin', selectors.extent);

            document.getElementById('mapboxgl-ctrl-layers').onclick = () =>
                this.toggleLayerDialog(true);

            document.getElementById('mapboxgl-ctrl-extent').onclick = () =>
                this.map.flyTo({
                    center: [0, 0],
                    zoom: 1.5,
                    speed: 1,
                    curve: 1,
                    bearing: 0,
                });
        }
    };

    toggleLayerDialog = status => this.setState({ openLayerDialog: status });

    render() {
        const {
            map: { selectedFactory, factories },
            location: { search },
            actions: { selectFactory },
            user,
        } = this.props;
        const { openLayerDialog, mapStyle } = this.state;

        return (
            <div>
                <LandingAlert />
                <Grid container>
                    <Grid item xs={12} sm={3} id='panel-container'>
                        <ControlPanel
                            onUpdate={this.onUpdate}
                            onSelectFactory={this.onSelectFactory}
                            selectedFactory={selectedFactory}
                            onClearSelectedFac={this.onClearSelectedFac}
                            factories={factories}
                            sharedSearch={this.queryStringToObj(search)}
                            updateSearchButton={this.updateSearchButton}
                            setSpecificFactory={selectFactory}
                            user={user}
                        />
                    </Grid>
                    <Grid item xs={12} sm={9} style={{ position: 'relative' }}>
                        <div
                            ref={el => {
                                this.mapContainer = el;
                            }}
                            id='map'
                        />
                        <CopyToClipboard text={this.getClipboardText()}>
                            <Button
                                text='Share This Search'
                                onClick={this.copySearchToClipboard}
                                style={{
                                    position: 'absolute',
                                    right: '84px',
                                    top: '84px',
                                    fontSize: '12px',
                                }}
                            />
                        </CopyToClipboard>
                        <MapLayers
                            mapStyle={mapStyle}
                            open={openLayerDialog}
                            close={this.toggleLayerDialog}
                            onClickStyle={this.onChangeStyle}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

Map.propTypes = {
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    map: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    user: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Map.defaultProps = {
    user: { loaded: false },
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Map);
