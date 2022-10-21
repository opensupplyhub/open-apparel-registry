import React from 'react';
import Map from './Map';
import { useMapHeight } from '../util/useHeightSubtract';

const MapWithHookedHeight = () => {
    const mapHeight = useMapHeight();
    return <Map height={mapHeight} />;
};

export default MapWithHookedHeight;
