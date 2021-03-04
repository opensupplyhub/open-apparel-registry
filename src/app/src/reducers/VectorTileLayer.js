import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import get from 'lodash/get';

import {
    startFetchCurrentTileCacheKey,
    failFetchCurrentTileCacheKey,
    completeFetchCurrentTileCacheKey,
    setFacilityGridRamp,
} from '../actions/vectorTileLayer';

import { GRID_COLOR_RAMP } from '../util/constants';

const initialState = Object.freeze({
    key: get(window, 'ENVIRONMENT.TILE_CACHE_KEY', null),
    fetching: false,
    error: null,
    gridColorRamp: GRID_COLOR_RAMP,
});

export default createReducer(
    {
        [startFetchCurrentTileCacheKey]: state =>
            update(state, {
                fetching: { $set: true },
                error: { $set: false },
            }),
        [failFetchCurrentTileCacheKey]: (state, error) =>
            update(state, {
                fetching: { $set: false },
                error: { $set: error },
            }),
        [completeFetchCurrentTileCacheKey]: (state, key) =>
            update(state, {
                key: { $set: key },
                fetching: { $set: false },
                error: { $set: null },
            }),
        [setFacilityGridRamp]: (state, payload) =>
            update(state, {
                gridColorRamp: { $set: payload },
            }),
    },
    initialState,
);
