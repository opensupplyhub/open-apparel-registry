import React, { useEffect, useRef, useState } from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import {
    Map as ReactLeafletMap,
    ZoomControl,
    Marker,
    Popup,
} from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import get from 'lodash/get';
import head from 'lodash/head';
import last from 'lodash/last';
import distance from '@turf/distance';

import '../../node_modules/leaflet/dist/leaflet.css';
import '../../node_modules/react-leaflet-markercluster/dist/styles.min.css';
import '../styles/css/leafletMap.css';

import FacilitiesMapPopup from './FacilitiesMapPopup';

import { COUNTRY_CODES } from '../util/constants';

import {
    facilityCollectionPropType,
    facilityPropType,
} from '../util/propTypes';

import {
    initialCenter,
    initialZoom,
    minimumZoom,
    detailsZoomLevel,
    GOOGLE_CLIENT_SIDE_API_KEY,
} from '../util/constants.facilitiesMap';

import { makeFacilityDetailLink, getIsMobile } from '../util/util';

const selectedMarkerURL = '/images/selectedmarker.png';
const unselectedMarkerURL = '/images/marker.png';

const mapComponentStyles = Object.freeze({
    mapContainerStyles: Object.freeze({
        height: '100%',
        width: '100%',
    }),
});

const createIcon = iconUrl =>
    L.icon({
        iconUrl,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: null,
        shadowUrl: null,
        shadowSize: null,
        shadowAnchor: null,
    });

const unselectedMarkerIcon = createIcon(unselectedMarkerURL);
const selectedMarkerIcon = createIcon(selectedMarkerURL);

function FacilitiesMap({
    fetching,
    data,
    navigateToFacilityDetails,
    facilityDetailsData,
    resetButtonClickCount,
    clientInfoFetched,
    countryCode,
    match: {
        params: { osID },
    },
    isEmbedded,
    isMobile,
    disableZoom,
}) {
    const mapRef = useRef(null);

    // Set the viewport to center on the facility if the user has arrived
    // directly on the facility details screen.
    const [isInitialPageLoad, setIsInitialPageLoad] = useState(true);
    const [
        centerOnFacilityDataWhenLoaded,
        setCenterOnFacilityDataWhenLoaded,
    ] = useState(false);

    useEffect(() => {
        if (isInitialPageLoad) {
            if (osID) {
                setCenterOnFacilityDataWhenLoaded(true);
            }
            setIsInitialPageLoad(false);
        }
    }, [
        isInitialPageLoad,
        setIsInitialPageLoad,
        setCenterOnFacilityDataWhenLoaded,
        osID,
    ]);

    useEffect(() => {
        if (centerOnFacilityDataWhenLoaded && facilityDetailsData) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);

            if (leafletMap) {
                leafletMap.setView(
                    {
                        lng: get(
                            facilityDetailsData,
                            'geometry.coordinates[0]',
                            null,
                        ),
                        lat: get(
                            facilityDetailsData,
                            'geometry.coordinates[1]',
                            null,
                        ),
                    },
                    detailsZoomLevel,
                );

                setCenterOnFacilityDataWhenLoaded(false);
            }
        }
    }, [
        facilityDetailsData,
        centerOnFacilityDataWhenLoaded,
        setCenterOnFacilityDataWhenLoaded,
    ]);

    // Center the viewport on the facility if the selected facility is currently off-screen
    const [loadedFacilityOSID, setLoadedFacilityOSID] = useState(null);

    useEffect(() => {
        if (
            !isInitialPageLoad &&
            !centerOnFacilityDataWhenLoaded &&
            facilityDetailsData
        ) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);
            const facilityOSID = get(facilityDetailsData, 'id', null);

            if (facilityOSID && facilityOSID !== loadedFacilityOSID) {
                setLoadedFacilityOSID(facilityOSID);

                if (leafletMap) {
                    const facilityLocation = get(
                        facilityDetailsData,
                        'geometry.coordinates',
                        null,
                    );

                    if (facilityLocation) {
                        const facilityLatLng = {
                            lat: last(facilityLocation),
                            lng: head(facilityLocation),
                        };

                        // Check whether the viewport's map bounds contains the facility point
                        const mapBoundsContainsFacility = leafletMap
                            .getBounds()
                            .contains(facilityLatLng);

                        if (!mapBoundsContainsFacility) {
                            leafletMap.setView(facilityLatLng);
                        }
                    }
                }
            }
        }
    }, [
        facilityDetailsData,
        centerOnFacilityDataWhenLoaded,
        isInitialPageLoad,
        loadedFacilityOSID,
        setLoadedFacilityOSID,
    ]);

    // Show the disambiguation popup menu when appropriate
    const [facilitiesToDisambiguate, setFacilitiesToDisambiguate] = useState(
        null,
    );

    const handleMultipleFacilitiesClusterMarkerClick = coordinates =>
        setFacilitiesToDisambiguate(
            data.features.reduce((acc, nextFeature) => {
                // If the distance between points is less than the size of an
                // individual person it is likely a precision error, not a
                // distinct geocoded point.
                // https://en.wikipedia.org/wiki/Decimal_degrees#Precision
                const pointsIntersect =
                    distance(nextFeature, coordinates) < 0.000001;
                return pointsIntersect ? acc.concat(nextFeature) : acc;
            }, []),
        );

    // Reset the map state when the reset button is clicked
    const [
        currentResetButtonClickCount,
        setCurrentResetButtonClickCount,
    ] = useState(resetButtonClickCount);

    useEffect(() => {
        if (resetButtonClickCount !== currentResetButtonClickCount) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);

            if (leafletMap) {
                leafletMap.setView(initialCenter, initialZoom);
            }

            setCurrentResetButtonClickCount(resetButtonClickCount);
            setFacilitiesToDisambiguate(null);
        }
    }, [
        resetButtonClickCount,
        currentResetButtonClickCount,
        setCurrentResetButtonClickCount,
        setFacilitiesToDisambiguate,
    ]);

    useEffect(() => {
        // Close multiple facilities popup on fresh searches
        if (fetching) {
            setFacilitiesToDisambiguate(null);
        }
    }, [fetching]);

    if (!clientInfoFetched) {
        return null;
    }

    return (
        <ReactLeafletMap
            id="oar-leaflet-map"
            ref={mapRef}
            center={initialCenter}
            zoom={initialZoom}
            minZoom={minimumZoom}
            scrollWheelZoom={!isEmbedded && !isMobile && !disableZoom}
            renderer={L.canvas()}
            style={mapComponentStyles.mapContainerStyles}
            zoomControl={false}
            maxBounds={[
                [-90, -180],
                [90, 180],
            ]}
            worldCopyJump
        >
            <ReactLeafletGoogleLayer
                googleMapsLoaderConf={{
                    KEY: GOOGLE_CLIENT_SIDE_API_KEY,
                    REGION: countryCode,
                    VERSION: 3.37,
                }}
                type="roadmap"
                continuousWorld
                minZoom={1}
            />
            <ZoomControl position="bottomright" />
            <MarkerClusterGroup
                showCoverageOnHover={false}
                removeOutsideVisibleBounds
                spiderfyOnMaxZoom={false}
                iconCreateFunction={cluster => {
                    const clusterCount = cluster.getChildCount();
                    const [iconClassName, iconSize] = (() => {
                        if (clusterCount < 10) {
                            return ['cluster-icon-one', [53, 53]];
                        }

                        if (clusterCount < 25) {
                            return ['cluster-icon-two', [55, 55]];
                        }

                        if (clusterCount < 50) {
                            return ['cluster-icon-three', [65, 65]];
                        }

                        if (clusterCount < 100) {
                            return ['cluster-icon-four', [78, 78]];
                        }

                        return ['cluster-icon-five', [90, 90]];
                    })();

                    return L.divIcon({
                        className: `cluster-icon ${iconClassName}`,
                        iconSize,
                        html: `<span style="margin:-0.1rem; display: block">${clusterCount}</span>`,
                    });
                }}
                onClusterClick={({
                    latlng: { lat, lng },
                    target: { _zoom: zoom, _maxZoom: maxZoom },
                }) => {
                    if (zoom === maxZoom) {
                        handleMultipleFacilitiesClusterMarkerClick([lng, lat]);
                    }
                }}
            >
                {data &&
                    data.features.map(f => (
                        <Marker
                            key={f.id}
                            position={[
                                get(f, 'geometry.coordinates[1]', null),
                                get(f, 'geometry.coordinates[0]', null),
                            ]}
                            icon={
                                f.id === osID
                                    ? selectedMarkerIcon
                                    : unselectedMarkerIcon
                            }
                            onClick={() => navigateToFacilityDetails(f.id)}
                        />
                    ))}
            </MarkerClusterGroup>
            {facilitiesToDisambiguate && (
                <Popup
                    position={[
                        get(
                            facilitiesToDisambiguate,
                            '[0].geometry.coordinates[1]',
                            null,
                        ),
                        get(
                            facilitiesToDisambiguate,
                            '[0].geometry.coordinates[0]',
                            null,
                        ),
                    ]}
                    onClose={() => setFacilitiesToDisambiguate(null)}
                >
                    <FacilitiesMapPopup
                        facilities={facilitiesToDisambiguate}
                        selectedFacilityID={osID}
                        selectFacilityOnClick={navigateToFacilityDetails}
                        closePopup={() => setFacilitiesToDisambiguate(null)}
                    />
                </Popup>
            )}
        </ReactLeafletMap>
    );
}

FacilitiesMap.defaultProps = {
    data: null,
    facilityDetailsData: null,
};

FacilitiesMap.propTypes = {
    fetching: bool.isRequired,
    data: facilityCollectionPropType,
    navigateToFacilityDetails: func.isRequired,
    facilityDetailsData: facilityPropType,
    resetButtonClickCount: number.isRequired,
    clientInfoFetched: bool.isRequired,
    countryCode: string.isRequired,
    match: shape({
        params: shape({
            osID: string,
        }),
    }).isRequired,
};

function mapStateToProps({
    facilities: {
        facilities: { fetching, data },
        singleFacility: { data: facilityDetailsData },
    },
    ui: {
        facilitiesSidebarTabSearch: { resetButtonClickCount },
        window: { innerWidth: windowInnerWidth },
    },
    clientInfo: { fetched, countryCode },
    embeddedMap: { embed: isEmbedded },
}) {
    return {
        fetching,
        data,
        facilityDetailsData,
        resetButtonClickCount,
        clientInfoFetched: fetched,
        countryCode: countryCode || COUNTRY_CODES.default,
        isEmbedded,
        isMobile: getIsMobile(windowInnerWidth),
    };
}

function mapDispatchToProps(_, { history: { push } }) {
    return {
        navigateToFacilityDetails: id => push(makeFacilityDetailLink(id)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilitiesMap);
