import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';
import GoogleMapReact from 'google-map-react';
import MarkerClusterer from '@google/markerclusterer';
import isEqual from 'lodash/isEqual';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import noop from 'lodash/noop';
import distance from '@turf/distance';

import Button from './Button';
import ShowOnly from './ShowOnly';
import FacilitiesMapPopup from './FacilitiesMapPopup';

import {
    initialCenter,
    initialZoom,
    GOOGLE_CLIENT_SIDE_API_KEY,
} from '../util/constants.facilitiesMap';

import { makeFacilityDetailLink } from '../util/util';

import { facilityCollectionPropType } from '../util/propTypes';

const CLICK_EVENT = 'click';
const CLOSE_EVENT = 'closeclick';
const DOMREADY_EVENT = 'domready';
const disambiguationMarkerPopupID = 'disambiguation-marker';
const disambiguationMarkerPopupContent = 'disambiguation-marker-popup-content';

const facilitiesMapStyles = Object.freeze({
    mapContainerStyles: Object.freeze({
        height: '100%',
        width: '100%',
    }),
    copySearchButtonStyle: Object.freeze({
        position: 'absolute',
        right: '24px',
        top: '20px',
        fontSize: '12px',
    }),
});

class FacilitiesMap extends Component {
    state = {
        disambiguationPopupIsOpen: false,
        facilitiesForDisambiguation: null,
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

        if (isEqual(data, prevProps.data)) {
            return null;
        }

        if (this.googleMapElement.data) {
            this.removeFeatureMarkers();
        }

        return this.createFeatureMarkers();
    }

    handleAPILoaded = ({ map, maps }) => {
        const { data } = this.props;

        this.googleMapElement = map;
        this.mapMethods = maps;

        if (data) {
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
                // these images are in the /public/images dir
                imagePath: '/images/m',
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
            navigateToFacilityDetails,
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
            return navigateToFacilityDetails(feature.properties.oar_id);
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
                    />
                </ShowOnly>
            </Fragment>
        );
    }
}

FacilitiesMap.defaultProps = {
    data: null,
};

FacilitiesMap.propTypes = {
    data: facilityCollectionPropType,
    navigateToFacilityDetails: func.isRequired,
};

function mapStateToProps({
    facilities: {
        facilities: {
            data,
        },
    },
}) {
    return {
        data,
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
