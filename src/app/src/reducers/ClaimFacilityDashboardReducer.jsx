import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilityClaims,
    failFetchFacilityClaims,
    completeFetchFacilityClaims,
    clearFacilityClaims,
} from '../actions/claimFacilityDashboard';

const initialState = Object.freeze({
    list: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
    detail: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

export default createReducer({
    [startFetchFacilityClaims]: state => update(state, {
        list: {
            fetching: { $set: true },
            error: { $set: initialState.list.error },
        },
    }),
    [failFetchFacilityClaims]: (state, error) => update(state, {
        list: {
            fetching: { $set: initialState.list.fetching },
            error: { $set: error },
        },
    }),
    [completeFetchFacilityClaims]: (state, data) => update(state, {
        list: {
            fetching: { $set: initialState.list.fetching },
            error: { $set: initialState.list.error },
            data: { $set: data },
        },
    }),
    [clearFacilityClaims]: state => update(state, {
        list: { $set: initialState.list },
    }),
}, initialState);
