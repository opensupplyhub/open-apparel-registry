import { useRef, useEffect, useState } from 'react';
import get from 'lodash/get';
import head from 'lodash/head';
import last from 'lodash/last';
import delay from 'lodash/delay';

import {
    detailsZoomLevel,
    initialZoom,
    initialCenter,
    maxVectorTileFacilitiesGridZoom,
} from './constants.facilitiesMap';

export default function useUpdateLeafletMapImperatively(
    resetButtonClickCount,
    {
        oarID,
        data,
        shouldPanMapToFacilityDetails,
        isVectorTileMap = false,
    } = {},
) {
    const mapRef = useRef(null);

    // Reset the map state when the reset button is clicked.
    const [
        currentResetButtonClickCount,
        setCurrentResetButtonClickCount,
    ] = useState(resetButtonClickCount);

    useEffect(() => {
        if (resetButtonClickCount !== currentResetButtonClickCount) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);

            if (leafletMap) {
                leafletMap.setView(
                    initialCenter,
                    initialZoom,
                );
            }

            setCurrentResetButtonClickCount(resetButtonClickCount);
        }
    }, [
        resetButtonClickCount,
        currentResetButtonClickCount,
        setCurrentResetButtonClickCount,
    ]);

    // Set the map view centered on the facility marker, zoomed to level 15
    // if the user has arrived at the page with a URL including an OAR ID.
    const [
        shouldSetViewOnReceivingData,
        setShouldSetViewOnReceivingData,
    ] = useState(!!oarID);

    useEffect(() => {
        if (data && shouldSetViewOnReceivingData) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);
            const facilityLocation = get(
                data,
                'geometry.coordinates',
                null,
            );

            delay(() => {
                if (leafletMap && facilityLocation) {
                    const facilityLatLng = {
                        lng: head(facilityLocation),
                        lat: last(facilityLocation),
                    };

                    leafletMap.setView(
                        facilityLatLng,
                        detailsZoomLevel,
                    );
                }
            }, 0);

            setShouldSetViewOnReceivingData(false);
        }
    }, [
        data,
        shouldSetViewOnReceivingData,
        setShouldSetViewOnReceivingData,
    ]);

    // Set the map view to center on the facility at zoom level 15 if
    // the user has clicked on a facility list item in the sidebar for a
    // facility that is currently off-screen or when the vector tile map
    // is zoomed out a level low enough to show the grid layer.
    const [
        panMapOnGettingFacilityData,
        setPanMapOnGettingFacilityData,
    ] = useState(shouldPanMapToFacilityDetails);

    useEffect(() => {
        if (shouldPanMapToFacilityDetails && !panMapOnGettingFacilityData) {
            setPanMapOnGettingFacilityData(true);
        } else if (data && panMapOnGettingFacilityData) {
            const leafletMap = get(mapRef, 'current.leafletElement', null);

            const facilityLocation = get(
                data,
                'geometry.coordinates',
                null,
            );

            if (leafletMap && facilityLocation) {
                const facilityLatLng = {
                    lng: head(facilityLocation),
                    lat: last(facilityLocation),
                };

                const mapBoundsContainsFacility = leafletMap
                    .getBounds()
                    .contains(facilityLatLng);

                const currentMapZoomLevel = leafletMap.getZoom();

                const shouldSetMapView = (isVectorTileMap
                    && (currentMapZoomLevel < maxVectorTileFacilitiesGridZoom + 1))
                    || !mapBoundsContainsFacility;

                if (shouldSetMapView) {
                    leafletMap.setView(
                        facilityLatLng,
                        detailsZoomLevel,
                    );
                }
            }

            setPanMapOnGettingFacilityData(false);
        }
    }, [
        data,
        shouldPanMapToFacilityDetails,
        panMapOnGettingFacilityData,
        setPanMapOnGettingFacilityData,
        isVectorTileMap,
    ]);

    return mapRef;
}
