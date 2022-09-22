import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchMergeTargetFacility,
    failFetchMergeTargetFacility,
    completeFetchMergeTargetFacility,
    clearMergeTargetFacility,
    updateMergeTargetFacilityOSID,
    startFetchFacilityToMerge,
    failFetchFacilityToMerge,
    completeFetchFacilityToMerge,
    clearFacilityToMerge,
    updateFacilityToMergeOSID,
    startMergeFacilities,
    failMergeFacilities,
    completeMergeFacilities,
    resetMergeFacilitiesState,
    flipFacilitiesToMerge,
} from '../actions/mergeFacilities';

const initialState = Object.freeze({
    targetFacility: Object.freeze({
        osID: '',
        data: null,
        fetching: false,
        error: null,
    }),
    facilityToMerge: Object.freeze({
        osID: '',
        data: null,
        fetching: false,
        error: null,
    }),
    merge: Object.freeze({
        fetching: false,
        error: null,
    }),
});

export default createReducer(
    {
        [flipFacilitiesToMerge]: state =>
            update(state, {
                targetFacility: {
                    $set: state.facilityToMerge,
                },
                facilityToMerge: {
                    $set: state.targetFacility,
                },
            }),
        [startFetchMergeTargetFacility]: state =>
            update(state, {
                targetFacility: {
                    fetching: { $set: true },
                    error: { $set: initialState.targetFacility.error },
                    data: { $set: initialState.targetFacility.data },
                },
            }),
        [failFetchMergeTargetFacility]: (state, error) =>
            update(state, {
                targetFacility: {
                    fetching: { $set: initialState.targetFacility.fetching },
                    error: { $set: error },
                },
            }),
        [completeFetchMergeTargetFacility]: (state, data) =>
            update(state, {
                targetFacility: {
                    fetching: { $set: initialState.targetFacility.fetching },
                    data: { $set: data },
                },
            }),
        [clearMergeTargetFacility]: state =>
            update(state, {
                targetFacility: {
                    $set: initialState.targetFacility,
                },
            }),
        [updateMergeTargetFacilityOSID]: (state, osID) =>
            update(state, {
                targetFacility: {
                    osID: { $set: osID },
                    error: { $set: initialState.targetFacility.error },
                },
            }),
        [startFetchFacilityToMerge]: state =>
            update(state, {
                facilityToMerge: {
                    fetching: { $set: true },
                    error: { $set: initialState.facilityToMerge.error },
                    data: { $set: initialState.facilityToMerge.data },
                },
            }),
        [failFetchFacilityToMerge]: (state, error) =>
            update(state, {
                facilityToMerge: {
                    fetching: { $set: initialState.facilityToMerge.fetching },
                    error: { $set: error },
                },
            }),
        [completeFetchFacilityToMerge]: (state, data) =>
            update(state, {
                facilityToMerge: {
                    fetching: { $set: initialState.facilityToMerge.fetching },
                    data: { $set: data },
                },
            }),
        [clearFacilityToMerge]: state =>
            update(state, {
                facilityToMerge: {
                    $set: initialState.facilityToMerge,
                },
            }),
        [updateFacilityToMergeOSID]: (state, osID) =>
            update(state, {
                facilityToMerge: {
                    osID: { $set: osID },
                    error: { $set: initialState.facilityToMerge.error },
                },
            }),
        [startMergeFacilities]: state =>
            update(state, {
                merge: {
                    fetching: { $set: true },
                    error: { $set: initialState.merge.error },
                },
            }),
        [failMergeFacilities]: (state, error) =>
            update(state, {
                merge: {
                    fetching: { $set: initialState.merge.fetching },
                    error: { $set: error },
                },
            }),
        [completeMergeFacilities]: (state, data) =>
            update(state, {
                targetFacility: {
                    data: { $set: data },
                },
                facilityToMerge: {
                    $set: initialState.facilityToMerge,
                },
                merge: {
                    fetching: { $set: initialState.merge.fetching },
                },
            }),
        [resetMergeFacilitiesState]: () => initialState,
    },
    initialState,
);
