import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchDashboardActivityReports,
    failFetchDashboardActivityReports,
    completeFetchDashboardActivityReports,
    startUpdateDashboardActivityReport,
    failUpdateDashboardActivityReport,
    completeUpdateDashboardActivityReport,
} from '../actions/dashboardActivityReports';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    activityReports: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
});

export default createReducer(
    {
        [startFetchDashboardActivityReports]: state =>
            update(state, {
                activityReports: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchDashboardActivityReports]: (state, payload) =>
            update(state, {
                activityReports: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchDashboardActivityReports]: (state, payload) =>
            update(state, {
                activityReports: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startUpdateDashboardActivityReport]: state =>
            update(state, {
                activityReports: {
                    error: { $set: null },
                },
            }),
        [failUpdateDashboardActivityReport]: (state, payload) =>
            update(state, {
                activityReports: {
                    error: { $set: payload },
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
                },
            }),
        [completeSubmitLogOut]: () => initialState,
    },
    initialState,
);
