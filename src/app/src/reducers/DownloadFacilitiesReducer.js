import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startDownloadFacilities,
    failDownloadFacilities,
    completeDownloadFacilities,
} from '../actions/downloadFacilities';

const initialState = Object.freeze({
    fetching: false,
    error: null,
});

export default createReducer(
    {
        [startDownloadFacilities]: state =>
            update(state, {
                fetching: { $set: true },
                error: { $set: initialState.error },
            }),
        [failDownloadFacilities]: (state, payload) =>
            update(state, {
                fetching: { $set: false },
                error: { $set: payload },
            }),
        [completeDownloadFacilities]: state =>
            update(state, {
                fetching: { $set: false },
                error: { $set: initialState.error },
            }),
    },
    initialState,
);
