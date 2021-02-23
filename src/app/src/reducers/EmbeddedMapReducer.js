import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    setEmbeddedMapStatus,
} from '../actions/embeddedMap';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    embed: '',
});

export default createReducer({
    [setEmbeddedMapStatus]: (state, isEmbedded) =>
        update(state, { embed: { $set: isEmbedded } }),
    [completeSubmitLogOut]: () => initialState,
}, initialState);
