import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    setOARMapViewport,
    resetOARMapViewport,
} from '../actions/oarMap';

const initialState = Object.freeze({
    viewport: Object.freeze({
        lat: 34,
        lng: 5,
        zoom: 1.5,
    }),
});

export default createReducer({
    [setOARMapViewport]: (state, payload) => update(state, {
        viewport: { $set: payload },
    }),
    [resetOARMapViewport]: () => initialState,
}, initialState);
