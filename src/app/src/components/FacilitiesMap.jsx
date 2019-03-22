import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { func, number } from 'prop-types';
import GoogleMapReact from 'google-map-react';
import MarkerClusterer from '@google/markerclusterer';
import isEqual from 'lodash/isEqual';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import noop from 'lodash/noop';
import last from 'lodash/last';
import head from 'lodash/head';
import distance from '@turf/distance';

import Button from './Button';
import ShowOnly from './ShowOnly';
import FacilitiesMapPopup from './FacilitiesMapPopup';

import {
    initialCenter,
    initialZoom,
    detailsZoomLevel,
    GOOGLE_CLIENT_SIDE_API_KEY,
    clusterMarkerStyles,
} from '../util/constants.facilitiesMap';

import { makeFacilityDetailLink } from '../util/util';

import {
    facilityPropType,
    facilityCollectionPropType,
} from '../util/propTypes';

import COLOURS from '../util/COLOURS';

const CLICK_EVENT = 'click';
const CLOSE_EVENT = 'closeclick';
const DOMREADY_EVENT = 'domready';
const disambiguationMarkerPopupID = 'disambiguation-marker';
const disambiguationMarkerPopupContent = 'disambiguation-marker-popup-content';

const selectedMarkerURL = '/images/selectedmarker.png';
const unselectedMarkerURL = '/images/marker.png';

const facilitiesMapStyles = Object.freeze({
    mapContainerStyles: Object.freeze({
        height: '99.75%',
        width: '100%',
    }),
    copySearchButtonStyle: Object.freeze({
        position: 'absolute',
        right: '24px',
        top: '20px',
        fontSize: '12px',
    }),
});

const clusterMarkerStyleOptions = clusterMarkerStyles
    .map(({ image, size }) => ({
        textColor: COLOURS.WHITE,
        // these images are in `/public/images`
        url: `/images/${image}.png`,
        height: size,
        width: size,
    }));

class FacilitiesMap extends Component {
    state = {
        disambiguationPopupIsOpen: false,
        facilitiesForDisambiguation: null,
        markerWasClicked: false,
    };

    googleMapElement = null;

    markersLayer = null;

    markerClusters = null;

    mapMethods = null;

    popupElement = null;

    selectedMarker = null;

    detailsSelectedMarker = null;

    otherMarkersAtDetailMarkerPoint = null;

    componentDidUpdate(prevProps) {
        const {
            data,
            match: {
                params: {
                    oarID,
                },
            },
            facilityDetailsData,
            resetButtonClickCount,
        } = this.props;

        if (!this.googleMapElement) {
            return null;
        }

        if (resetButtonClickCount > prevProps.resetButtonClickCount) {
            this.resetMapZoom();
        }

        if (!data && prevProps.data) {
            this.removeFeatureMarkers();
        }

        if (!oarID && prevProps.match.params.oarID) {
            this.googleMapElement.data.revertStyle();
        }

        if (!oarID) {
            this.resetSelectedMarker();
        }

        if (oarID && (oarID !== prevProps.oarID)) {
            this.resetSelectedMarker();
            this.displaySelectedMarker();
        }

        if (facilityDetailsData && !isEqual(facilityDetailsData, prevProps.facilityDetailsData)) {
            if (!this.state.markerWasClicked) {
                this.googleMapElement.setCenter({
                    lat: last(facilityDetailsData.geometry.coordinates),
                    lng: head(facilityDetailsData.geometry.coordinates),
                });

                this.googleMapElement.setZoom(detailsZoomLevel);
            }

            this.resetMarkerClickedState();
            this.displaySelectedMarker();
        }

        if (isEqual(data, prevProps.data)) {
            return null;
        }

        if (this.googleMapElement.data) {
            this.removeFeatureMarkers();
        }

        return this.createFeatureMarkers();
    }

    resetMarkerClickedState = () => this.setState(state => Object.assign({}, state, {
        markerWasClicked: false,
    }));

    handleAPILoaded = ({ map, maps }) => {
        const {
            data,
            facilityDetailsData,
        } = this.props;

        this.googleMapElement = map;
        this.mapMethods = maps;

        if (data) {
            this.createFeatureMarkers();
        }

        if (facilityDetailsData) {
            this.googleMapElement.setCenter({
                lat: last(facilityDetailsData.geometry.coordinates),
                lng: head(facilityDetailsData.geometry.coordinates),
            });

            this.googleMapElement.setZoom(detailsZoomLevel);

            this.displaySelectedMarker();

            return null;
        }

        return null;
    };

    createMapOptions = () => Object.freeze({
        fullscreenControl: false,
        restriction: Object.freeze({
            strictBounds: true,
            latLngBounds: Object.freeze({
                north: 85,
                south: -85,
                west: -180,
                east: 180,
            }),
        }),
    });

    resetMapZoom = () => {
        if (!this.googleMapElement) {
            return null;
        }

        this.googleMapElement.setCenter(initialCenter);
        this.googleMapElement.setZoom(initialZoom);

        return null;
    };

    createFeatureMarkers = () => {
        const {
            data,
            match: {
                params: {
                    oarID,
                },
            },
        } = this.props;

        if (!data) {
            return null;
        }


        if (!data || !data.features || !data.features.length) {
            return null;
        }

        this.markersLayer = data.features.map((feature) => {
            const {
                geometry: {
                    coordinates: [lng, lat],
                },
                properties: {
                    oar_id: id,
                },
            } = feature;

            const iconURL = oarID && (oarID === id)
                ? selectedMarkerURL
                : unselectedMarkerURL;

            const marker = new this.mapMethods.Marker({
                position: new this.mapMethods.LatLng(
                    lat,
                    lng,
                ),
                icon: {
                    url: iconURL,
                    scaledSize: new this.mapMethods.Size(30, 40),
                },
                oarID: id,
                feature,
            });

            marker.addListener(
                CLICK_EVENT,
                () => this.handleMarkerClick(marker, feature),
            );

            return marker;
        });

        this.markerClusters = new MarkerClusterer(
            this.googleMapElement,
            this.markersLayer,
            {
                gridSize: 50,
                maxZoom: 20,
                styles: clusterMarkerStyleOptions,
            },
        );

        return null;
    };

    removeFeatureMarkers = () => {
        if (!this.googleMapElement
            || !this.markersLayer
            || !this.markersLayer.length
            || !this.markerClusters) {
            return null;
        }

        this.markersLayer.forEach((marker) => {
            this.markerClusters.removeMarker(marker);
        });

        this.markersLayer = null;
        this.markerClusters = null;

        return null;
    };

    displaySelectedMarker = () => {
        const {
            data,
            match: {
                params: {
                    oarID,
                },
            },
            facilityDetailsData,
        } = this.props;

        if (facilityDetailsData && (!this.markersLayer || !data)) {
            const marker = new this.mapMethods.Marker({
                position: new this.mapMethods.LatLng(
                    last(facilityDetailsData.geometry.coordiantes),
                    head(facilityDetailsData.geometry.coordinates),
                ),
                icon: {
                    url: selectedMarkerURL,
                    scaledSize: new this.mapMethods.Size(30, 40),
                    zIndex: 1000,
                },
                oarID: facilityDetailsData.properties.id,
                feature: facilityDetailsData,
                map: this.googleMapElement,
            });

            this.detailsSelectedMarker = marker;
        }

        if (this.markersLayer && data) {
            const markerForOARID = this.markersLayer
                .find(marker => marker.get('oarID') === oarID);

            if (markerForOARID) {
                markerForOARID.setIcon({
                    url: selectedMarkerURL,
                    scaledSize: new this.mapMethods.Size(30, 40),
                });

                this.selectedMarker = markerForOARID;

                const featureFromSelectedMarker = this.selectedMarker.get('feature');

                const otherMarkersAtPoint = data
                    .features
                    .reduce((acc, nextFeature) => {
                        if (markerForOARID === nextFeature.properties.oar_id) {
                            return acc;
                        }

                        const pointsIntersect = !distance(nextFeature, featureFromSelectedMarker);

                        if (!pointsIntersect) {
                            return acc;
                        }

                        const otherMarkerAtPoint = this.markersLayer
                            .find(marker => marker.get('oarID') === nextFeature.properties.oar_id);

                        otherMarkerAtPoint.setIcon({
                            url: selectedMarkerURL,
                            scaledSize: new this.mapMethods.Size(30, 40),
                        });

                        return acc.concat(otherMarkerAtPoint);
                    }, []);

                if (otherMarkersAtPoint.length) {
                    this.otherMarkersAtDetailMarkerPoint = otherMarkersAtPoint;
                }
            }

            return null;
        }

        return null;
    };

    resetSelectedMarker = () => {
        if (this.selectedMarker) {
            this.selectedMarker.setIcon({
                url: unselectedMarkerURL,
                scaledSize: new this.mapMethods.Size(30, 40),
            });

            if (this.otherMarkersAtDetailMarkerPoint) {
                this.otherMarkersAtDetailMarkerPoint.forEach((marker) => {
                    marker.setIcon({
                        url: unselectedMarkerURL,
                        scaledSize: new this.mapMethods.Size(30, 40),
                    });
                });

                this.otherMarkersAtDetailMarkerPoint = null;
            }

            this.selectedMarker = null;
        }

        if (this.detailsSelectedMarker) {
            this.detailsSelectedMarker.setMap(null);
            this.detailsSelectedMarker = null;
        }
    };

    handleMarkerClick = (marker, feature) => {
        const {
            data,
        } = this.props;

        this.resetSelectedMarker();

        const facilitiesAtPoint = data
            .features
            .reduce((acc, nextFeature) => {
                const pointsIntersect = !distance(nextFeature, feature);

                return pointsIntersect
                    ? acc.concat(nextFeature)
                    : acc;
            }, []);

        if (facilitiesAtPoint.length === 1) {
            return this.selectFacilityOnClick(feature.properties.oar_id);
        }

        this.popupElement = new this.mapMethods.InfoWindow({
            content: `<div id=${disambiguationMarkerPopupID}></div>`,
            zIndex: -1,
        });

        this.popupElement.open(
            this.googleMapElement,
            marker,
        );

        this.popupElement.addListener(CLOSE_EVENT, this.handleDisambiguationPopupClose);

        this.popupElement.addListener(
            DOMREADY_EVENT,
            () => this.setState(state => Object.assign({}, state, {
                facilitiesForDisambiguation: facilitiesAtPoint,
                disambiguationPopupIsOpen: true,
            })),
        );

        return null;
    };

    selectFacilityOnClick = oarID => this.setState(
        state => Object.assign({}, state, {
            markerWasClicked: true,
        }),
        () => this.props.navigateToFacilityDetails(oarID),
    );

    handleDisambiguationPopupClose = () =>
        this.setState(state => Object.assign({}, state, {
            facilitiesForDisambiguation: null,
            dismabiguationPopupIsOpen: false,
        }));

    render() {
        return (
            <Fragment>
                <div style={facilitiesMapStyles.mapContainerStyles}>
                    <GoogleMapReact
                        defaultCenter={initialCenter}
                        defaultZoom={initialZoom}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={this.handleAPILoaded}
                        bootstrapURLKeys={{
                            region: 'IE',
                            key: GOOGLE_CLIENT_SIDE_API_KEY,
                        }}
                        options={this.createMapOptions}
                    />
                </div>
                <CopyToClipboard
                    text={window.location.href}
                    onCopy={() => toast('Copied search to clipboard')}
                >
                    <Button
                        text="Share This Search"
                        onClick={noop}
                        style={facilitiesMapStyles.copySearchButtonStyle}
                    />
                </CopyToClipboard>
                <ShowOnly when={this.state.disambiguationPopupIsOpen}>
                    <FacilitiesMapPopup
                        facilities={this.state.facilitiesForDisambiguation}
                        domNodeID={disambiguationMarkerPopupID}
                        popupContentElementID={disambiguationMarkerPopupContent}
                        selectedFacilityID={this.props.match.params.oarID}
                        selectFacilityOnClick={this.selectFacilityOnClick}
                    />
                </ShowOnly>
            </Fragment>
        );
    }
}

FacilitiesMap.defaultProps = {
    data: null,
    facilityDetailsData: null,
};

FacilitiesMap.propTypes = {
    data: facilityCollectionPropType,
    navigateToFacilityDetails: func.isRequired,
    facilityDetailsData: facilityPropType,
    resetButtonClickCount: number.isRequired,
};

function mapStateToProps({
    facilities: {
        facilities: {
            data,
        },
        singleFacility: {
            data: facilityDetailsData,
        },
    },
    ui: {
        facilitiesSidebarTabSearch: {
            resetButtonClickCount,
        },
    },
}) {
    return {
        data,
        facilityDetailsData,
        resetButtonClickCount,
    };
}

function mapDispatchToProps(_, {
    history: {
        push,
    },
}) {
    return {
        navigateToFacilityDetails: id => push(makeFacilityDetailLink(id)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilitiesMap);
