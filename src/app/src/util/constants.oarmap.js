import env from './env';

export const MAPBOX_TOKEN = env('REACT_APP_MAPBOX_TOKEN');

export const CIRCLE_COLOR = '#3d2f8c';
export const CIRCLE_TEXT_COLOR = '#fff';
export const CIRCLE_COLOR_SHADOW = 'rgba(61, 50, 138, 0.5)';

export const FACILITIES_SOURCE = 'FACILITIES_SOURCE';

export const initialViewport = Object.freeze({
    lat: 34,
    lng: 5,
    zoom: 1.5,
});

export const CLUSTER_MAX_ZOOM = 100;
export const CLUSTER_RADIUS = 25;

export const oarMapLayerIDEnum = Object.freeze({
    points: 'points',
    pointsShadow: 'pointsShadow',
    clusterCount: 'clusterCount',
    unclusteredPoint: 'unclusteredPoint',
    highlightedPoint: 'highlightedPoint',
});

export const oarMapLayers = Object.freeze([
    Object.freeze({
        id: oarMapLayerIDEnum.pointsShadow,
        source: FACILITIES_SOURCE,
        type: 'circle',
        paint: Object.freeze({
            'circle-color': CIRCLE_COLOR_SHADOW,
            'circle-radius': Object.freeze([
                'step',
                Object.freeze([
                    'get',
                    'point_count',
                ]),
                25,
                100,
                30,
                660,
                40,
            ]),
        }),
    }),
    Object.freeze({
        id: oarMapLayerIDEnum.points,
        source: FACILITIES_SOURCE,
        type: 'circle',
        paint: Object.freeze({
            'circle-color': CIRCLE_COLOR,
            'circle-radius': Object.freeze([
                'step',
                Object.freeze([
                    'get',
                    'point_count',
                ]),
                15,
                90,
                20,
                650,
                30,
            ]),
        }),
    }),
    Object.freeze({
        id: oarMapLayerIDEnum.clusterCount,
        source: FACILITIES_SOURCE,
        type: 'symbol',
        filter: Object.freeze([
            'has',
            'point_count',
        ]),
        layout: Object.freeze({
            'text-field': '{point_count_abbreviated}',
            'text-font': Object.freeze([
                'DIN Offc Pro Medium',
                'Arial Unicode MS Bold',
            ]),
            'text-size': 12,
        }),
        paint: Object.freeze({
            'text-color': CIRCLE_TEXT_COLOR,
        }),
    }),
    Object.freeze({
        id: oarMapLayerIDEnum.unclusteredPoint,
        source: FACILITIES_SOURCE,
        type: 'circle',
        filter: Object.freeze([
            '!has',
            'point_count',
        ]),
        paint: Object.freeze({
            'circle-color': CIRCLE_COLOR,
            'circle-radius': 8,
        }),
    }),
    Object.freeze({
        id: oarMapLayerIDEnum.highlightedPoint,
        source: FACILITIES_SOURCE,
        type: 'circle',
        paint: Object.freeze({
            'circle-color': CIRCLE_TEXT_COLOR,
            'circle-radius': 8,
            'circle-stroke-width': 2.5,
            'circle-stroke-color': CIRCLE_COLOR,
        }),
        filter: Object.freeze([
            '==',
            'name',
            '',
        ]),
    }),
]);
