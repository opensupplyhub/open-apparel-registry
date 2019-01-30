import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchContributorOptions,
    failFetchContributorOptions,
    completeFetchContributorOptions,
    startFetchContributorTypeOptions,
    failFetchContributorTypeOptions,
    completeFetchContributorTypeOptions,
    startFetchCountryOptions,
    failFetchCountryOptions,
    completeFetchCountryOptions,
    resetFilterOptions,
} from '../actions/filterOptions';

const initialState = Object.freeze({
    contributors: Object.freeze({
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
});

export default createReducer({
    [startFetchContributorOptions]: state => update(state, {
        contributors: {
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchContributorOptions]: (state, payload) => update(state, {
        contributors: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchContributorOptions]: (state, payload) => update(state, {
        contributors: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    }),
    [startFetchContributorTypeOptions]: state => update(state, {
        contributorTypes: {
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchContributorTypeOptions]: (state, payload) => update(state, {
        contributorTypes: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchContributorTypeOptions]: (state, payload) => update(state, {
        contributorTypes: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    }),
    [startFetchCountryOptions]: state => update(state, {
        countries: {
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchCountryOptions]: (state, payload) => update(state, {
        countries: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchCountryOptions]: (state, payload) => update(state, {
        countries: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    }),
    [resetFilterOptions]: () => initialState,
}, initialState);
