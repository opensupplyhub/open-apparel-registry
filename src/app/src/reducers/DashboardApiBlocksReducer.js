import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchDashboardApiBlocks,
    failFetchDashboardApiBlocks,
    completeFetchDashboardApiBlocks,
    startFetchDashboardApiBlock,
    failFetchDashboardApiBlock,
    completeFetchDashboardApiBlock,
    startUpdateDashboardApiBlock,
    failUpdateDashboardApiBlock,
    completeUpdateDashboardApiBlock,
} from '../actions/dashboardApiBlocks';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    apiBlocks: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    apiBlock: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

export default createReducer(
    {
        [startFetchDashboardApiBlocks]: state =>
            update(state, {
                apiBlocks: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchDashboardApiBlocks]: (state, payload) =>
            update(state, {
                apiBlocks: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchDashboardApiBlocks]: (state, payload) =>
            update(state, {
                apiBlocks: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startFetchDashboardApiBlock]: state =>
            update(state, {
                apiBlock: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchDashboardApiBlock]: (state, payload) =>
            update(state, {
                apiBlock: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchDashboardApiBlock]: (state, payload) =>
            update(state, {
                apiBlock: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startUpdateDashboardApiBlock]: state =>
            update(state, {
                apiBlock: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failUpdateDashboardApiBlock]: (state, payload) =>
            update(state, {
                apiBlock: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeUpdateDashboardApiBlock]: (state, payload) =>
            update(state, {
                apiBlock: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [completeSubmitLogOut]: () => initialState,
    },
    initialState,
);
