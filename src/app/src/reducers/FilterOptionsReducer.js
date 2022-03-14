import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchContributorOptions,
    failFetchContributorOptions,
    completeFetchContributorOptions,
    startFetchListOptions,
    failFetchListOptions,
    completeFetchListOptions,
    startFetchContributorTypeOptions,
    failFetchContributorTypeOptions,
    completeFetchContributorTypeOptions,
    startFetchCountryOptions,
    failFetchCountryOptions,
    completeFetchCountryOptions,
    startFetchFacilityProcessingTypeOptions,
    failFetchFacilityProcessingTypeOptions,
    completeFetchFacilityProcessingTypeOptions,
    resetFilterOptions,
} from '../actions/filterOptions';

const initialState = Object.freeze({
    contributors: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    lists: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    contributorTypes: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    countries: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    facilityProcessingType: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
});

export default createReducer(
    {
        [startFetchContributorOptions]: state =>
            update(state, {
                contributors: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchContributorOptions]: (state, payload) =>
            update(state, {
                contributors: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchContributorOptions]: (state, payload) =>
            update(state, {
                contributors: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startFetchListOptions]: state =>
            update(state, {
                lists: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchListOptions]: (state, payload) =>
            update(state, {
                lists: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchListOptions]: (state, payload) =>
            update(state, {
                lists: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startFetchContributorTypeOptions]: state =>
            update(state, {
                contributorTypes: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchContributorTypeOptions]: (state, payload) =>
            update(state, {
                contributorTypes: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchContributorTypeOptions]: (state, payload) =>
            update(state, {
                contributorTypes: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startFetchCountryOptions]: state =>
            update(state, {
                countries: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchCountryOptions]: (state, payload) =>
            update(state, {
                countries: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchCountryOptions]: (state, payload) =>
            update(state, {
                countries: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startFetchFacilityProcessingTypeOptions]: state =>
            update(state, {
                facilityProcessingType: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchFacilityProcessingTypeOptions]: (state, payload) =>
            update(state, {
                facilityProcessingType: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchFacilityProcessingTypeOptions]: (state, payload) =>
            update(state, {
                facilityProcessingType: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [resetFilterOptions]: () => initialState,
    },
    initialState,
);
