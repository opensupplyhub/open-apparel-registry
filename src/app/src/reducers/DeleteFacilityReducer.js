import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilityToDelete,
    failFetchFacilityToDelete,
    completeFetchFacilityToDelete,
    clearFacilityToDelete,
    updateFacilityToDeleteOSID,
    startDeleteFacility,
    failDeleteFacility,
    completeDeleteFacility,
    resetDeleteFacilityState,
} from '../actions/deleteFacility';

const initialState = Object.freeze({
    facility: Object.freeze({
        osID: '',
        data: null,
        fetching: false,
        error: null,
    }),
    delete: Object.freeze({
        fetching: false,
        error: null,
    }),
});

export default createReducer(
    {
        [startFetchFacilityToDelete]: state =>
            update(state, {
                facility: {
                    fetching: { $set: true },
                    error: { $set: initialState.facility.error },
                },
            }),
        [failFetchFacilityToDelete]: (state, error) =>
            update(state, {
                facility: {
                    fetching: { $set: initialState.facility.fetching },
                    error: { $set: error },
                },
            }),
        [completeFetchFacilityToDelete]: (state, data) =>
            update(state, {
                facility: {
                    fetching: { $set: initialState.facility.fetching },
                    data: { $set: data },
                },
            }),
        [updateFacilityToDeleteOSID]: (state, osID) =>
            update(state, {
                facility: {
                    osID: { $set: osID },
                    error: { $set: initialState.facility.error },
                },
            }),
        [clearFacilityToDelete]: state =>
            update(state, {
                facility: {
                    $set: initialState.facility,
                },
            }),
        [startDeleteFacility]: state =>
            update(state, {
                delete: {
                    fetching: { $set: true },
                    error: { $set: initialState.delete.error },
                },
            }),
        [failDeleteFacility]: (state, error) =>
            update(state, {
                delete: {
                    fetching: { $set: initialState.delete.fetching },
                    error: { $set: error },
                },
            }),
        [completeDeleteFacility]: state =>
            update(state, {
                facility: {
                    $set: initialState.facility,
                },
                delete: {
                    fetching: { $set: initialState.delete.fetching },
                },
            }),
        [resetDeleteFacilityState]: () => initialState,
    },
    initialState,
);
