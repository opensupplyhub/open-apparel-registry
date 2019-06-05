import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchClientInfo,
    failFetchClientInfo,
    completeFetchClientInfo,
} from '../actions/clientInfo';

const initialState = Object.freeze({ fetched: false, countryCode: null });

export default createReducer({
    [startFetchClientInfo]: () => initialState,
    [failFetchClientInfo]: state => update(state, {
        fetched: { $set: true },
    }),
    [completeFetchClientInfo]: (state, payload) => update(state, {
        fetched: { $set: true },
        countryCode: { $set: payload.country_code2 },
    }),
}, initialState);
