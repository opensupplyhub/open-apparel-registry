import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilities,
    failFetchFacilities,
    completeFetchFacilities,
    resetFacilities,
    startFetchSingleFacility,
    failFetchSingleFacility,
    completeFetchSingleFacility,
    resetSingleFacility,
} from '../actions/facilities';

const initialState = Object.freeze({
    facilities: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    singleFacility: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

export default createReducer({
    [startFetchFacilities]: state => update(state, {
        facilities: {
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchFacilities]: (state, payload) => update(state, {
        facilities: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchFacilities]: (state, payload) => update(state, {
        facilities: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    }),
    [resetFacilities]: state => update(state, {
        facilities: { $set: initialState.facilities },
    }),
    [startFetchSingleFacility]: state => update(state, {
        singleFacility: {
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchSingleFacility]: (state, payload) => update(state, {
        singleFacility: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchSingleFacility]: (state, payload) => update(state, {
        singleFacility: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    }),
    [resetSingleFacility]: state => update(state, {
        singleFacility: { $set: initialState.singleFacility },
    }),
}, initialState);
