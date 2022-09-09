import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import constant from 'lodash/constant';
import get from 'lodash/get';
import reject from 'lodash/reject';
import find from 'lodash/find';

import {
    startFetchFacilityToAdjust,
    failFetchFacilityToAdjust,
    completeFetchFacilityToAdjust,
    clearFacilityToAdjust,
    resetAdjustFacilityState,
    updateFacilityToAdjustOARID,
    startSplitFacilityMatch,
    failSplitFacilityMatch,
    completeSplitFacilityMatch,
    startPromoteFacilityMatch,
    failPromoteFacilityMatch,
    completePromoteFacilityMatch,
    startFetchFacilityToTransfer,
    failFetchFacilityToTransfer,
    completeFetchFacilityToTransfer,
    clearFacilityToTransfer,
} from '../actions/adjustFacilityMatches';

const initialState = Object.freeze({
    facility: Object.freeze({
        oarID: '',
        data: null,
        fetching: false,
        error: null,
    }),
    adjustFacilities: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    transferFacility: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

const handleCompleteSplitFacilityMatch = (state, data) => {
    const existingMatches = get(state, 'facility.data.properties.matches', []);

    const matchIDFromData = get(data, 'match_id', null);

    const { list_contributor_id: contributorId = null } = find(
        existingMatches,
        ({ match_id: id }) => id === matchIDFromData,
    );

    return update(state, {
        adjustFacilities: {
            data: { $set: state.adjustFacilities.data.concat(data) },
            fetching: { $set: initialState.adjustFacilities.fetching },
        },
        facility: {
            data: {
                properties: {
                    contributors: {
                        $set: reject(
                            state.facility.data.properties.contributors,
                            { id: contributorId },
                        ),
                    },
                },
            },
        },
    });
};

export default createReducer(
    {
        [startFetchFacilityToAdjust]: state =>
            update(state, {
                facility: {
                    fetching: { $set: true },
                    error: { $set: initialState.facility.error },
                },
            }),
        [failFetchFacilityToAdjust]: (state, error) =>
            update(state, {
                facility: {
                    fetching: { $set: initialState.facility.fetching },
                    error: { $set: error },
                },
            }),
        [completeFetchFacilityToAdjust]: (state, data) =>
            update(state, {
                facility: {
                    data: { $set: data },
                    fetching: { $set: initialState.facility.fetching },
                },
            }),
        [updateFacilityToAdjustOARID]: (state, oarID) =>
            update(state, {
                facility: {
                    oarID: { $set: oarID },
                    error: { $set: initialState.facility.error },
                },
            }),
        [clearFacilityToAdjust]: state =>
            update(state, {
                facility: {
                    $set: initialState.facility,
                },
            }),
        [startSplitFacilityMatch]: state =>
            update(state, {
                adjustFacilities: {
                    fetching: { $set: true },
                    error: { $set: initialState.adjustFacilities.error },
                },
            }),
        [failSplitFacilityMatch]: (state, error) =>
            update(state, {
                adjustFacilities: {
                    fetching: { $set: initialState.adjustFacilities.fetching },
                    error: { $set: error },
                },
            }),
        [completeSplitFacilityMatch]: handleCompleteSplitFacilityMatch,
        [startPromoteFacilityMatch]: state =>
            update(state, {
                adjustFacilities: {
                    fetching: { $set: true },
                    error: { $set: initialState.adjustFacilities.error },
                },
            }),
        [failPromoteFacilityMatch]: (state, error) =>
            update(state, {
                adjustFacilities: {
                    fetching: { $set: initialState.adjustFacilities.fetching },
                    error: { $set: error },
                },
            }),
        [completePromoteFacilityMatch]: (state, data) =>
            update(state, {
                adjustFacilities: {
                    fetching: { $set: initialState.adjustFacilities.fetching },
                },
                facility: {
                    data: { $set: data },
                },
            }),
        [startFetchFacilityToTransfer]: state =>
            update(state, {
                transferFacility: {
                    fetching: { $set: true },
                    error: { $set: initialState.transferFacility.error },
                },
            }),
        [failFetchFacilityToTransfer]: (state, error) =>
            update(state, {
                transferFacility: {
                    fetching: { $set: initialState.transferFacility.fetching },
                    error: { $set: error },
                },
            }),
        [completeFetchFacilityToTransfer]: (state, data) =>
            update(state, {
                transferFacility: {
                    data: { $set: data },
                    fetching: { $set: initialState.transferFacility.fetching },
                },
            }),
        [clearFacilityToTransfer]: state =>
            update(state, {
                transferFacility: { $set: initialState.transferFacility },
            }),
        [resetAdjustFacilityState]: constant(initialState),
    },
    initialState,
);
