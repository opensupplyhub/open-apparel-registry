import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import { OARFont, OARColor } from '../util/constants';

import {
    setEmbeddedMapStatus,
    startFetchEmbedConfig,
    completeFetchEmbedConfig,
    failFetchEmbedConfig,
} from '../actions/embeddedMap';

import { completeSubmitLogOut } from '../actions/auth';

const initialConfig = Object.freeze({
    color: OARColor,
    contributor: null,
    font: OARFont,
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
            }),
        [completeFetchEmbedConfig]: (state, config) =>
            update(state, {
                loading: { $set: false },
                config: { $set: config },
            }),
        [failFetchEmbedConfig]: state =>
            update(state, {
                loading: { $set: true },
                config: { $set: initialConfig },
            }),
        [completeSubmitLogOut]: () => initialState,
    },
    initialState,
);
