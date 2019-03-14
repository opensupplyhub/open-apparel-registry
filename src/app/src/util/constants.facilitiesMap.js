import env from './env';

export const GOOGLE_CLIENT_SIDE_API_KEY = env('REACT_APP_GOOGLE_CLIENT_SIDE_API_KEY');

export const initialCenter = Object.freeze({
    lat: 34,
    lng: 5,
});

export const initialZoom = 1;

export const detailsZoomLevel = 18;

export const clusterMarkerStyles = Object.freeze([
    Object.freeze({
        image: 'm1',
        size: 53,
    }),
    Object.freeze({
        image: 'm2',
        size: 55,
    }),
    Object.freeze({
        image: 'm3',
        size: 65,
    }),
    Object.freeze({
        image: 'm4',
        size: 78,
    }),
    Object.freeze({
        image: 'm5',
        size: 90,
    }),
]);
