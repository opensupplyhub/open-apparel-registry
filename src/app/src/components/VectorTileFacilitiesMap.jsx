import React, { useEffect, useRef, useState } from 'react';
import { array, arrayOf, bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { Map as ReactLeafletMap, ZoomControl } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import L from 'leaflet';
import Control from 'react-leaflet-control';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import noop from 'lodash/noop';
import get from 'lodash/get';
import head from 'lodash/head';
import last from 'lodash/last';
import delay from 'lodash/delay';
import SphericalMercator from '@mapbox/sphericalmercator';

import Button from './Button';
import VectorTileFacilitiesLayer from './VectorTileFacilitiesLayer';
import VectorTileFacilityGridLayer from './VectorTileFacilityGridLayer';

import { COUNTRY_CODES } from '../util/constants';

import { makeFacilityDetailLink } from '../util/util';

import { facilityDetailsPropType } from '../util/propTypes';

import COLOURS from '../util/COLOURS';

import {
    initialCenter,
    initialZoom,
    detailsZoomLevel,
    GOOGLE_CLIENT_SIDE_API_KEY,
} from '../util/constants.facilitiesMap';

const sm = new SphericalMercator();

const mapComponentStyles = Object.freeze({
    mapContainerStyles: Object.freeze({
        height: '100%',
        width: '100%',
    }),
    copySearchButtonStyle: Object.freeze({
        right: '24px',
        top: '20px',
        fontSize: '12px',
    }),
    legendStyle: Object.freeze({
        background: 'white',
        border: `1px solid ${COLOURS.NAVY_BLUE}`,
        padding: '6px',
        margin: '20px',
        height: '22px',
        fontFamily: 'ff-tisa-sans-web-pro, sans-serif',
    }),
    legendLabelStyle: Object.freeze({
        width: '6.5rem',
        padding: '0.08rem',
        textAlign: 'center',
    }),
    legendCellStyle: Object.freeze({
        width: '20px',
        opacity: '0.8',
        background: 'red',
    }),
});

function useUpdateLeafletMapImperatively(
    resetButtonClickCount,
    { oarID, data, error, fetching },
) {
    const mapRef = useRef(null);

    // Set the map view on a facility location if the user has arrived
    // directly from a URL containing a valid OAR ID
    const [
        shouldSetViewOnReceivingData,
        setShouldSetViewOnReceivingData,
    ] = useState(!!oarID);

    useEffect(() => {
        if (shouldSetViewOnReceivingData) {
            if (data) {
                const leafletMap = get(mapRef, 'current.leafletElement', null);

                const facilityLocation = get(
                    data,
                    'geometry.coordinates',
                    null,
                );

                if (leafletMap && facilityLocation) {
                    leafletMap.setView(
                        {
                            lng: head(facilityLocation),
                            lat: last(facilityLocation),
                        },
                        detailsZoomLevel,
                    );
                }

                setShouldSetViewOnReceivingData(false);
            } else if (error) {
                setShouldSetViewOnReceivingData(false);
            }
        }
    }, [
        shouldSetViewOnReceivingData,
        setShouldSetViewOnReceivingData,
        data,
        error,
    ]);

    // Set the map view on the facility location if it is not within the
    // current viewport bbox
    const [appIsGettingFacilityData, setAppIsGettingFacilityData] = useState(fetching);

    useEffect(() => {
        if (shouldSetViewOnReceivingData) {
            noop();
        } else if (fetching && !appIsGettingFacilityData) {
            setAppIsGettingFacilityData(true);
        } else if (!fetching && appIsGettingFacilityData && data) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);
            const facilityLocation = get(data, 'geometry.coordinates', null);

            delay(
                () => {
                    if (leafletMap && facilityLocation) {
                        const facilityLatLng = {
                            lng: head(facilityLocation),
                            lat: last(facilityLocation),
                        };

                        const mapBoundsContainsFacility = leafletMap
                            .getBounds()
                            .contains(facilityLatLng);

                        if (!mapBoundsContainsFacility) {
                            leafletMap.setView(facilityLatLng);
                        }
                    }

                    setAppIsGettingFacilityData(false);
                },
                0,
            );
        }
    }, [
        fetching,
        appIsGettingFacilityData,
        setAppIsGettingFacilityData,
        data,
        shouldSetViewOnReceivingData,
    ]);

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
        }
    }, [
        resetButtonClickCount,
        currentResetButtonClickCount,
        setCurrentResetButtonClickCount,
    ]);

    return mapRef;
}

function VectorTileFacilitiesMap({
    resetButtonClickCount,
    clientInfoFetched,
    countryCode,
    handleMarkerClick,
    match: {
        params: { oarID },
    },
    history: {
        push,
    },
    facilityDetailsData,
    errorFetchingFacilityDetailsData,
    fetchingDetailsData,
    gridColorRamp,
}) {
    const mapRef = useUpdateLeafletMapImperatively(resetButtonClickCount, {
        oarID,
        data: facilityDetailsData,
        fetching: fetchingDetailsData,
        error: errorFetchingFacilityDetailsData,
    });

    if (!clientInfoFetched) {
        return null;
    }

    const handleCellClick = (event) => {
        const { x, y, z, count } = get(event, 'layer.properties', {});
        const leafletMap = get(mapRef, 'current.leafletElement', null);
        if (count && leafletMap) {
            const [w, s, e, n] = sm.bbox(x, y, z);
            leafletMap.fitBounds([[s, w], [n, e]]);
        }
    };

    const legendCell = (background) => {
        const style = Object.assign({}, mapComponentStyles.legendCellStyle, {
            background,
        });
        return (
            <td key={background} style={style}>&nbsp;</td>
        );
    };

    return (
        <ReactLeafletMap
            id="oar-leaflet-map"
            ref={mapRef}
            center={initialCenter}
            zoom={initialZoom}
            renderer={L.canvas()}
            style={mapComponentStyles.mapContainerStyles}
            zoomControl={false}
            maxBounds={[[-90, -180], [90, 180]]}
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
                zIndex={1}
            />
            <Control position="bottomleft">
                <div id="map-legend" style={mapComponentStyles.legendStyle}>
                    <table>
                        <tbody>
                            <tr>
                                <td style={mapComponentStyles.legendLabelStyle}>
                                    FEWER FACILITIES
                                </td>
                                {gridColorRamp.map(colorDef => legendCell(colorDef[1]))}
                                <td style={mapComponentStyles.legendLabelStyle}>
                                    MORE FACILITIES
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Control>
            <Control position="topright">
                <CopyToClipboard
                    text={window.location.href}
                    onCopy={() => toast('Copied search to clipboard')}
                >
                    <Button
                        text="Share This Search"
                        onClick={noop}
                        style={mapComponentStyles.copySearchButtonStyle}
                    />
                </CopyToClipboard>
            </Control>
            <ZoomControl position="bottomright" />
            <VectorTileFacilitiesLayer
                handleMarkerClick={handleMarkerClick}
                oarID={oarID}
                pushRoute={push}
                minZoom={12}
                maxZoom={22}
            />
            <VectorTileFacilityGridLayer
                handleCellClick={handleCellClick}
                minZoom={1}
                maxZoom={11}
            />
        </ReactLeafletMap>
    );
}

VectorTileFacilitiesMap.defaultProps = {
    facilityDetailsData: null,
    errorFetchingFacilityDetailsData: null,
};

VectorTileFacilitiesMap.propTypes = {
    resetButtonClickCount: number.isRequired,
    clientInfoFetched: bool.isRequired,
    countryCode: string.isRequired,
    handleMarkerClick: func.isRequired,
    match: shape({
        params: shape({
            oarID: string,
        }),
    }).isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
    facilityDetailsData: facilityDetailsPropType,
    errorFetchingFacilityDetailsData: arrayOf(string),
    fetchingDetailsData: bool.isRequired,
    gridColorRamp: arrayOf(array).isRequired,
};

function mapStateToProps({
    ui: {
        facilitiesSidebarTabSearch: { resetButtonClickCount },
    },
    clientInfo: { fetched, countryCode },
    facilities: {
        singleFacility: { data, error, fetching },
    },
    vectorTileLayer: {
        gridColorRamp,
    },
}) {
    return {
        resetButtonClickCount,
        clientInfoFetched: fetched,
        countryCode: countryCode || COUNTRY_CODES.default,
        facilityDetailsData: data,
        errorFetchingFacilityDetailsData: error,
        fetchingDetailsData: fetching,
        gridColorRamp,
    };
}

function mapDispatchToProps(_, { history: { push } }) {
    return {
        handleMarkerClick: (e) => {
            const oarID = get(e, 'layer.properties.id', null);

            return oarID ? push(makeFacilityDetailLink(oarID)) : noop();
        },
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VectorTileFacilitiesMap);
