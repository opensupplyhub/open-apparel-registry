import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilities,
    failFetchFacilities,
    completeFetchFacilities,
    resetFacilities,
} from '../actions/facilities';

const initialState = Object.freeze({
    data: Object.freeze([]),
    fetching: false,
    error: null,
});

export default createReducer({
    [startFetchFacilities]: state => update(state, {
        fetching: { $set: true },
        error: { $set: null },
    }),
    [failFetchFacilities]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: payload },
    }),
    [completeFetchFacilities]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: null },
        data: { $set: payload },
    }),
    [resetFacilities]: () => initialState,
}, initialState);
