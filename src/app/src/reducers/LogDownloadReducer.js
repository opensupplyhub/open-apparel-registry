import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startLogDownload,
    failLogDownload,
    completeLogDownload,
} from '../actions/logDownload';

const initialState = Object.freeze({
    fetching: false,
    error: null,
});

export default createReducer({
    [startLogDownload]: state => update(state, {
        fetching: { $set: true },
        error: { $set: initialState.error },
    }),
    [failLogDownload]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: payload },
    }),
    [completeLogDownload]: state => update(state, {
        fetching: { $set: false },
        error: { $set: initialState.error },
    }),
}, initialState);
