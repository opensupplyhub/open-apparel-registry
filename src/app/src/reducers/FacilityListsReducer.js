import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchUserFacilityLists,
    failFetchUserFacilityLists,
    completeFetchUserFacilityLists,
    resetUserFacilityLists,
} from '../actions/facilityLists';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    facilityLists: Object.freeze([]),
    fetching: false,
    error: null,
});

export default createReducer(
    {
        [startFetchUserFacilityLists]: state =>
            update(state, {
                fetching: { $set: true },
                error: { $set: null },
            }),
        [failFetchUserFacilityLists]: (state, payload) =>
            update(state, {
                fetching: { $set: false },
                error: { $set: payload },
            }),
        [completeFetchUserFacilityLists]: (state, payload) =>
            update(state, {
                fetching: { $set: false },
                error: { $set: null },
                facilityLists: { $set: payload },
            }),
        [resetUserFacilityLists]: () => initialState,
        [completeSubmitLogOut]: () => initialState,
    },
    initialState,
);
