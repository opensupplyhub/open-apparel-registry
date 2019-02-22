import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilityListItems,
    failFetchFacilityListItems,
    completeFetchFacilityListItems,
    resetFacilityListItems,
    startConfirmFacilityListItemPotentialMatch,
    failConfirmFacilityListItemPotentialMatch,
    completeConfirmFacilityListItemPotentialMatch,
    startRejectFacilityListItemPotentialMatch,
    failRejectFacilityListItemPotentialMatch,
    completeRejectFacilityListItemPotentialMatch,
    setSelectedFacilityListItemsRowIndex,
} from '../actions/facilityListDetails';

import { completeSubmitLogOut } from '../actions/auth';

import { facilityListItemStatusChoicesEnum } from '../util/constants';

const initialState = Object.freeze({
    data: null,
    fetching: false,
    error: null,
    confirmOrRejectMatch: Object.freeze({
        fetching: false,
        error: null,
    }),
    selectedFacilityListItemsRowIndex: -1,
});

const startConfirmOrRejectMatch = state => update(state, {
    confirmOrRejectMatch: {
        fetching: { $set: true },
        error: { $set: null },
    },
});

const failConfirmOrRejectMatch = (state, payload) => update(state, {
    confirmOrRejectMatch: {
        fetching: { $set: false },
        error: { $set: payload },
    },
});

const toggleSelectedRowIndex = (state, payload) => {
    const newRowIndex = state.selectedFacilityListItemsRowIndex === payload
        ? initialState.selectedFacilityListItemsRowIndex
        : payload;

    return update(state, {
        selectedFacilityListItemsRowIndex: {
            $set: newRowIndex,
        },
    });
};

const completeConfirmMatch = (state, payload) => {
    const indexForListItemToUpdate = state
        .data
        .items
        .findIndex(({ id }) => id === payload.id);

    const updatedItems = [
        ...state.data.items.slice(0, indexForListItemToUpdate),
        payload,
        ...state.data.items.slice(indexForListItemToUpdate + 1),
    ];

    const updatedSelectedRowIndex =
        payload.status === facilityListItemStatusChoicesEnum.CONFIRMED_MATCH
            ? payload.row_index
            : state.selectedFacilityListItemsRowIndex;

    return update(state, {
        confirmOrRejectMatch: {
            fetching: { $set: false },
            error: { $set: null },
        },
        data: {
            items: {
                $set: updatedItems,
            },
        },
        selectedFacilityListItemsRowIndex: {
            $set: updatedSelectedRowIndex,
        },
    });
};

export default createReducer({
    [startFetchFacilityListItems]: state => update(state, {
        fetching: { $set: true },
        error: { $set: null },
    }),
    [failFetchFacilityListItems]: (state, payload) => update(state, {
        fetching: { $set: false },
        error: { $set: payload },
    }),
    [completeFetchFacilityListItems]: (state, payload) => update(state, {
        data: { $set: payload },
        fetching: { $set: false },
        error: { $set: null },
    }),
    [resetFacilityListItems]: () => initialState,
    [startConfirmFacilityListItemPotentialMatch]: startConfirmOrRejectMatch,
    [startRejectFacilityListItemPotentialMatch]: startConfirmOrRejectMatch,
    [failConfirmFacilityListItemPotentialMatch]: failConfirmOrRejectMatch,
    [failRejectFacilityListItemPotentialMatch]: failConfirmOrRejectMatch,
    [completeConfirmFacilityListItemPotentialMatch]: completeConfirmMatch,
    [completeRejectFacilityListItemPotentialMatch]: completeConfirmMatch,
    [setSelectedFacilityListItemsRowIndex]: toggleSelectedRowIndex,
    [completeSubmitLogOut]: () => initialState,
}, initialState);
