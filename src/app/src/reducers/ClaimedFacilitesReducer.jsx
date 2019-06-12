import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchClaimedFacilities,
    failFetchClaimedFacilities,
    completeFetchClaimedFacilities,
    clearClaimedFacilities,
} from '../actions/claimedFacilities';

const initialState = Object.freeze({
    data: null,
    fetching: false,
    error: null,
});

export default createReducer({
    [startFetchClaimedFacilities]: state => update(state, {
        data: { $set: initialState.data },
        fetching: { $set: true },
        error: { $set: initialState.error },
    }),
    [failFetchClaimedFacilities]: (state, error) => update(state, {
        data: { $set: initialState.data },
        fetching: { $set: false },
        error: { $set: error },
    }),
    [completeFetchClaimedFacilities]: (state, data) => update(state, {
        data: { $set: data },
        fetching: { $set: initialState.fetching },
        error: { $set: initialState.error },
    }),
    [clearClaimedFacilities]: state => update(state, {
        data: { $set: initialState.data },
    }),
}, initialState);
