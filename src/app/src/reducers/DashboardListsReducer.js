import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchDashboardListContributors,
    failFetchDashboardListContributors,
    completeFetchDashboardListContributors,
    setDashboardListContributor,
    startFetchDashboardFacilityLists,
    failFetchDashboardFacilityLists,
    completeFetchDashboardFacilityLists,
    resetDashboardFacilityLists,
} from '../actions/dashboardLists';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    contributor: null,
    contributors: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    facilityListsCount: null,
    facilityLists: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

export default createReducer(
    {
        [startFetchDashboardListContributors]: state =>
            update(state, {
                contributors: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchDashboardListContributors]: (state, payload) =>
            update(state, {
                contributors: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchDashboardListContributors]: (state, payload) =>
            update(state, {
                contributors: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [setDashboardListContributor]: (state, payload) =>
            update(state, {
                contributor: { $set: payload },
            }),
        [startFetchDashboardFacilityLists]: state =>
            update(state, {
                facilityLists: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchDashboardFacilityLists]: (state, payload) =>
            update(state, {
                facilityLists: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchDashboardFacilityLists]: (state, payload) =>
            update(state, {
                facilityListsCount: { $set: payload.count },
                facilityLists: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload.results },
                },
            }),
        [resetDashboardFacilityLists]: () => initialState,
        [completeSubmitLogOut]: () => initialState,
    },
    initialState,
);
