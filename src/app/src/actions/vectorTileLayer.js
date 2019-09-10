import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import { logErrorAndDispatchFailure } from '../util/util';

export const startFetchCurrentTileCacheKey = createAction(
    'START_FETCH_CURRENT_TILE_CACHE_KEY',
);
export const failFetchCurrentTileCacheKey = createAction(
    'FAIL_FETCH_CURRENT_TILE_CACHE_KEY',
);
export const completeFetchCurrentTileCacheKey = createAction(
    'COMPLETE_FETCH_CURRENT_TILE_CACHE_KEY',
);

export function fetchCurrentTileCacheKey() {
    return (dispatch) => {
        dispatch(startFetchCurrentTileCacheKey());

        return apiRequest
            .get('/api/current_tile_cache_key')
            .then(({ data }) => dispatch(completeFetchCurrentTileCacheKey(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching the current tile cache key',
                failFetchCurrentTileCacheKey,
            )));
    };
}

export const setFacilityGridRamp = createAction('SET_FACILITY_GRID_RAMP');
