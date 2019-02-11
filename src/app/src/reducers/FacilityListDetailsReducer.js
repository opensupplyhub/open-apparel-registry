import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilityListItems,
    failFetchFacilityListItems,
    completeFetchFacilityListItems,
    resetFacilityListItems,
} from '../actions/facilityListDetails';

const initialState = Object.freeze({
    data: null,
    fetching: false,
    error: null,
});

export default createReducer({
    [startFetchFacilityListItems]: state => update(state, {
        fetching: { $set: true },
        error: { $set: null },
    }),
    [failFetchFacilityListItems]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: payload },
    }),
    [completeFetchFacilityListItems]: (state, payload) => update(state, {
        data: { $set: payload },
        fetching: { $set: false },
        error: { $set: null },
    }),
    [resetFacilityListItems]: () => initialState,
}, initialState);
