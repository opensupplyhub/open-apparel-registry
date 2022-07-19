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
    startFetchSectorOptions,
    failFetchSectorOptions,
    completeFetchSectorOptions,
    startFetchParentCompanyOptions,
    failFetchParentCompanyOptions,
    completeFetchParentCompanyOptions,
    startFetchFacilityProcessingTypeOptions,
    failFetchFacilityProcessingTypeOptions,
    completeFetchFacilityProcessingTypeOptions,
    startFetchNumberOfWorkersOptions,
    failFetchNumberOfWorkersOptions,
    completeFetchNumberOfWorkersTypeOptions,
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
    sectors: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    parentCompanies: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    facilityProcessingType: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    productType: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    numberOfWorkers: Object.freeze({
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
        [startFetchSectorOptions]: state =>
            update(state, {
                sectors: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchSectorOptions]: (state, payload) =>
            update(state, {
                sectors: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchSectorOptions]: (state, payload) =>
            update(state, {
                sectors: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startFetchParentCompanyOptions]: state =>
            update(state, {
                parentCompanies: {
                    fetching: { $set: true },
                    error: { $set: initialState.parentCompanies.error },
                },
            }),
        [failFetchParentCompanyOptions]: (state, error) =>
            update(state, {
                parentCompanies: {
                    fetching: {
                        $set: initialState.parentCompanies.fetching,
                    },
                    error: { $set: error },
                },
            }),
        [completeFetchParentCompanyOptions]: (state, data) =>
            update(state, {
                parentCompanies: {
                    data: { $set: data },
                    fetching: {
                        $set: initialState.parentCompanies.fetching,
                    },
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
        [startFetchNumberOfWorkersOptions]: state =>
            update(state, {
                numberOfWorkers: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchNumberOfWorkersOptions]: (state, payload) =>
            update(state, {
                numberOfWorkers: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchNumberOfWorkersTypeOptions]: (state, payload) =>
            update(state, {
                numberOfWorkers: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [resetFilterOptions]: () => initialState,
    },
    initialState,
);
