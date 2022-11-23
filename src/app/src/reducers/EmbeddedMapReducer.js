import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import { OARFont, OARColor, SelectedMarkerColor } from '../util/constants';

import {
    setEmbeddedMapStatus,
    startFetchEmbedConfig,
    completeFetchEmbedConfig,
    failFetchEmbedConfig,
} from '../actions/embeddedMap';

import { completeSubmitLogOut } from '../actions/auth';

const initialConfig = Object.freeze({
    color: OARColor,
    selectedMarkerColor: SelectedMarkerColor,
    hideSectorData: false,
    contributor: null,
    font: OARFont,
    extended_fields: [],
});

const initialState = Object.freeze({
    embed: '',
    config: initialConfig,
    loading: false,
});

export default createReducer(
    {
        [setEmbeddedMapStatus]: (state, isEmbedded) =>
            update(state, { embed: { $set: isEmbedded } }),
        [startFetchEmbedConfig]: state =>
            update(state, {
                loading: { $set: true },
                config: { $set: initialConfig },
                error: { $set: initialState.error },
            }),
        [completeFetchEmbedConfig]: (state, config) =>
            update(state, {
                loading: { $set: false },
                config: { $set: config },
                error: { $set: initialState.error },
            }),
        [failFetchEmbedConfig]: (state, error) =>
            update(state, {
                loading: { $set: false },
                config: { $set: initialConfig },
                error: { $set: error },
            }),
        [completeSubmitLogOut]: () => initialState,
    },
    initialState,
);
