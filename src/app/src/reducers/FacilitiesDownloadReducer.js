import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import get from 'lodash/get';

import {
    startFetchDownloadFacilities,
    failFetchDownloadFacilities,
    completeFetchDownloadFacilities,
    startFetchNextPageOfDownloadFacilities,
    failFetchNextPageOfDownloadFacilities,
    completeFetchNextPageOfDownloadFacilities,
} from '../actions/downloadFacilities';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    facilities: Object.freeze({
        data: null,
        fetching: false,
        error: null,
        nextPageURL: null,
        isInfiniteLoading: false,
    }),
});

export default createReducer(
    {
        [startFetchDownloadFacilities]: state =>
            update(state, {
                facilities: {
                    fetching: { $set: true },
                    error: { $set: null },
                    data: { $set: null },
                },
            }),
        [failFetchDownloadFacilities]: (state, payload) =>
            update(state, {
                facilities: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchDownloadFacilities]: (state, payload) =>
            update(state, {
                facilities: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: {
                        $set: payload,
                    },
                    nextPageURL: { $set: get(payload, 'next', null) },
                },
            }),
        [startFetchNextPageOfDownloadFacilities]: state =>
            update(state, {
                facilities: {
                    isInfiniteLoading: { $set: true },
                },
            }),
        [failFetchNextPageOfDownloadFacilities]: state =>
            update(state, {
                facilities: {
                    isInfiniteLoading: { $set: false },
                },
            }),
        [completeFetchNextPageOfDownloadFacilities]: (state, payload) =>
            update(state, {
                facilities: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: {
                        results: {
                            rows: {
                                $push: get(payload, 'results.rows', []),
                            },
                        },
                    },
                    nextPageURL: { $set: get(payload, 'next', null) },
                    isInfiniteLoading: { $set: false },
                },
            }),
        [completeSubmitLogOut]: state =>
            update(state, {
                facilities: {
                    fetching: { $set: true },
                    error: { $set: null },
                    data: { $set: null },
                },
            }),
    },
    initialState,
);
