import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';
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

    componentDidUpdate(prevProps) {
        const {
            data,
            match: {
                params: {
                    oarID,
                },
            },
            facilityDetailsData,
        } = this.props;

        if (!this.googleMapElement) {
            return null;
        }

        if (!data && this.googleMapElement.data) {
            return this.removeFeatureMarkers();
        }

        if (!oarID && prevProps.match.params.oarID) {
            this.googleMapElement.data.revertStyle();
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
            if (facilityDetailsData) {
                this.googleMapElement.setCenter({
                    lat: last(facilityDetailsData.geometry.coordinates),
                    lng: head(facilityDetailsData.geometry.coordinates),
                });

                this.googleMapElement.setZoom(detailsZoomLevel);
            }

            return this.createFeatureMarkers();
        }

        return null;
    };

    createMapOptions = () => ({
        fullscreenControl: false,
    });

    createFeatureMarkers = () => {
        const { data } = this.props;

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
            } = feature;

            const marker = new this.mapMethods.Marker({
                position: new this.mapMethods.LatLng(
                    lat,
                    lng,
                ),
                icon: {
                    anchor: new this.mapMethods.Point(lat, lng),
                    url: '/images/marker.png',
                    scaledSize: new this.mapMethods.Size(30, 40),
                },
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

    handleMarkerClick = (marker, feature) => {
        const {
            data,
        } = this.props;

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
}) {
    return {
        data,
        facilityDetailsData,
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
