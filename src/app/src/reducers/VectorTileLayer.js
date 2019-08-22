import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import get from 'lodash/get';

import {
    startFetchCurrentTileCacheKey,
    failFetchCurrentTileCacheKey,
    completeFetchCurrentTileCacheKey,
} from '../actions/vectorTileLayer';

const initialState = Object.freeze({
    key: get(window, 'ENVIRONMENT.TILE_CACHE_KEY', null),
    fetching: false,
    error: null,
});

export default createReducer({
    [startFetchCurrentTileCacheKey]: state => update(state, {
        fetching: { $set: true },
        error: { $set: false },
    }),
    [failFetchCurrentTileCacheKey]: (state, error) => update(state, {
        fetching: { $set: false },
        error: { $set: error },
    }),
    [completeFetchCurrentTileCacheKey]: (state, key) => update(state, {
        key: { $set: key },
        fetching: { $set: false },
        error: { $set: null },
    }),
}, initialState);
