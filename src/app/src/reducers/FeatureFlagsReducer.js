import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFeatureFlags,
    failFetchFeatureFlags,
    completeFetchFeatureFlags,
    clearFeatureFlags,
} from '../actions/featureFlags';

const initialState = Object.freeze({
    fetching: false,
    flags: Object.freeze({}),
});

export default createReducer({
    [startFetchFeatureFlags]: state => update(state, {
        fetching: { $set: true },
    }),
    [failFetchFeatureFlags]: state => update(state, {
        fetching: { $set: false },
    }),
    [clearFeatureFlags]: () => initialState,
    [completeFetchFeatureFlags]: (state, data) => Object.freeze(update(state, {
        fetching: { $set: false },
        flags: { $set: data },
    })),
}, initialState);
