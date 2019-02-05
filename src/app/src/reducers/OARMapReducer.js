import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    setOARMapViewport,
    resetOARMapViewport,
} from '../actions/oarMap';

import { initialViewport } from '../util/constants.oarmap';

const initialState = Object.freeze({
    viewport: initialViewport,
});

export default createReducer({
    [setOARMapViewport]: (state, payload) => update(state, {
        viewport: { $set: payload },
    }),
    [resetOARMapViewport]: () => initialState,
}, initialState);
