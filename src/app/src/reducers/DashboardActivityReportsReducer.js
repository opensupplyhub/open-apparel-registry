import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchDashboardActivityReports,
    failFetchDashboardActivityReports,
    completeFetchDashboardActivityReports,
    startUpdateDashboardActivityReport,
    failUpdateDashboardActivityReport,
    completeUpdateDashboardActivityReport,
    startCreateDashboardActivityReport,
    failCreateDashboardActivityReport,
    completeCreateDashboardActivityReport,
    resetDashbooardActivityReports,
} from '../actions/dashboardActivityReports';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    activityReports: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
        message: null,
    }),
});

export default createReducer(
    {
        [startFetchDashboardActivityReports]: state =>
            update(state, {
                activityReports: {
                    fetching: { $set: true },
                    error: { $set: null },
                    message: { $set: null },
                },
            }),
        [failFetchDashboardActivityReports]: (state, payload) =>
            update(state, {
                activityReports: {
                    fetching: { $set: false },
                    error: { $set: payload },
                    message: { $set: null },
                },
            }),
        [completeFetchDashboardActivityReports]: (state, payload) =>
            update(state, {
                activityReports: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                    message: { $set: null },
                },
            }),
        [startUpdateDashboardActivityReport]: state =>
            update(state, {
                activityReports: {
                    error: { $set: null },
                    message: { $set: null },
                },
            }),
        [failUpdateDashboardActivityReport]: (state, payload) =>
            update(state, {
                activityReports: {
                    error: { $set: payload },
                    message: { $set: null },
                },
            }),
        [completeUpdateDashboardActivityReport]: (state, payload) =>
            update(state, {
                activityReports: {
                    error: { $set: null },
                    data: { $apply: (data) => {
                        const index = data.findIndex(el => el.id === payload.id);
                        return [...data.slice(0, index), payload, ...data.slice(index + 1)];
                    },
                    },
                    message: { $set: null },
                },
            }),
        [startCreateDashboardActivityReport]: state =>
            update(state, {
                activityReports: {
                    error: { $set: null },
                    message: { $set: null },
                },
            }),
        [failCreateDashboardActivityReport]: (state, payload) =>
            update(state, {
                activityReports: {
                    error: { $set: payload },
                    message: { $set: null },
                },
            }),
        [completeCreateDashboardActivityReport]: (state, payload) =>
            update(state, {
                activityReports: {
                    error: { $set: null },
                    data: { $unshift: [payload.data] },
                    message: { $set: payload.message },
                },
            }),
        [resetDashbooardActivityReports]: () => initialState,
        [completeSubmitLogOut]: () => initialState,
    },
    initialState,
);
