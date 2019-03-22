import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilityCount,
    failFetchFacilityCount,
    completeFetchFacilityCount,
    clearFacilityCount,
} from '../actions/facilityCount';

const initialState = Object.freeze({
    data: null,
    fetching: false,
    error: null,
});

export default createReducer({
    [startFetchFacilityCount]: state => update(state, {
        fetching: {
            $set: true,
        },
        error: {
            $set: null,
        },
    }),
    [failFetchFacilityCount]: (state, payload) => update(state, {
        fetching: {
            $set: false,
        },
        error: {
            $set: payload,
        },
    }),
    [completeFetchFacilityCount]: (state, count) => update(state, {
        fetching: {
            $set: false,
        },
        error: {
            $set: null,
        },
        data: {
            $set: count,
        },
    }),
    [clearFacilityCount]: () => initialState,
}, initialState);
