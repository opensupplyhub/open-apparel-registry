import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    updateFileUploadName,
    updateFileUploadDescription,
    updateFileUploadFileName,
    startUploadFile,
    failUploadFile,
    completeUploadFile,
    resetUploadState,
} from '../actions/upload';

const initialState = Object.freeze({
    form: Object.freeze({
        name: '',
        description: '',
        filename: '',
    }),
    fetching: false,
    error: null,
});

export default createReducer({
    [updateFileUploadName]: (state, payload) => update(state, {
        form: {
            name: { $set: payload },
        },
        error: { $set: null },
    }),
    [updateFileUploadDescription]: (state, payload) => update(state, {
        form: {
            description: { $set: payload },
        },
        error: { $set: null },
    }),
    [updateFileUploadFileName]: (state, payload) => update(state, {
        form: {
            filename: { $set: payload },
        },
        error: { $set: null },
    }),
    [startUploadFile]: state => update(state, {
        fetching: { $set: true },
        error: { $set: null },
    }),
    [failUploadFile]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: payload },
    }),
    [completeUploadFile]: () => initialState,
    [resetUploadState]: () => initialState,
}, initialState);
