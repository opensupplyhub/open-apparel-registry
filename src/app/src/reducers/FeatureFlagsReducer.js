import { createReducer } from 'redux-act';

import {
    startFetchFeatureFlags,
    failFetchFeatureFlags,
    completeFetchFeatureFlags,
    clearFeatureFlags,
} from '../actions/featureFlags';

const initialState = Object.freeze({});

export default createReducer({
    [startFetchFeatureFlags]: () => initialState,
    [failFetchFeatureFlags]: () => initialState,
    [clearFeatureFlags]: () => initialState,
    [completeFetchFeatureFlags]: (_, payload) => Object.freeze(payload),
}, initialState);
