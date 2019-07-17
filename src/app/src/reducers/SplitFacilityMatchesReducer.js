import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import constant from 'lodash/constant';
import get from 'lodash/get';
import reject from 'lodash/reject';
import find from 'lodash/find';

import {
    startFetchFacilityToSplit,
    failFetchFacilityToSplit,
    completeFetchFacilityToSplit,
    clearFacilityToSplit,
    resetSplitFacilityState,
    updateFacilityToSplitOARID,
    startSplitFacilityMatch,
    failSplitFacilityMatch,
    completeSplitFacilityMatch,
} from '../actions/splitFacilityMatches';

const initialState = Object.freeze({
    facility: Object.freeze({
        oarID: '',
        data: null,
        fetching: false,
        error: null,
    }),
    splitFacilities: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
});

const handleCompleteSplitFacilityMatch = (state, data) => {
    const existingMatches = get(
        state,
        'facility.data.properties.matches',
        [],
    );

    const matchIDFromData = get(data, 'match_id', null);

    const {
        list_contributor_id = null, // eslint-disable-line camelcase
        // eslint-disable-next-line camelcase
    } = find(existingMatches, ({ match_id }) => match_id === matchIDFromData);

    return update(state, {
        splitFacilities: {
            data: { $set: state.splitFacilities.data.concat(data) },
            fetching: { $set: initialState.splitFacilities.fetching },
        },
        facility: {
            data: {
                properties: {
                    contributors: {
                        $set: reject(
                            state.facility.data.properties.contributors,
                            { id: list_contributor_id },
                        ),
                    },
                },
            },
        },
    });
};

export default createReducer({
    [startFetchFacilityToSplit]: state => update(state, {
        facility: {
            fetching: { $set: true },
            error: { $set: initialState.facility.error },
        },
    }),
    [failFetchFacilityToSplit]: (state, error) => update(state, {
        facility: {
            fetching: { $set: initialState.facility.fetching },
            error: { $set: error },
        },
    }),
    [completeFetchFacilityToSplit]: (state, data) => update(state, {
        facility: {
            data: { $set: data },
            fetching: { $set: initialState.facility.fetching },
        },
    }),
    [updateFacilityToSplitOARID]: (state, oarID) => update(state, {
        facility: {
            oarID: { $set: oarID },
            error: { $set: initialState.facility.error },
        },
    }),
    [clearFacilityToSplit]: state => update(state, {
        facility: {
            $set: initialState.facility,
        },
    }),
    [startSplitFacilityMatch]: state => update(state, {
        splitFacilities: {
            fetching: { $set: true },
            error: { $set: initialState.splitFacilities.error },
        },
    }),
    [failSplitFacilityMatch]: (state, error) => update(state, {
        splitFacilities: {
            fetching: { $set: initialState.splitFacilities.fetching },
            error: { $set: error },
        },
    }),
    [completeSplitFacilityMatch]: handleCompleteSplitFacilityMatch,
    [resetSplitFacilityState]: constant(initialState),
}, initialState);
