import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilityList,
    failFetchFacilityList,
    completeFetchFacilityList,
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
    startAssembleAndDownloadFacilityListCSV,
    failAssembleAndDownloadFacilityListCSV,
    completeAssembleAndDownloadFacilityListCSV,
    startRemoveFacilityListItem,
    failRemoveFacilityListItem,
    completeRemoveFacilityListItem,
} from '../actions/facilityListDetails';

import { completeSubmitLogOut } from '../actions/auth';

import { facilityListItemStatusChoicesEnum } from '../util/constants';

const initialState = Object.freeze({
    list: {
        data: null,
        fetching: false,
        error: null,
    },
    items: {
        data: null,
        fetching: false,
        error: null,
    },
    filteredCount: 0,
    confirmOrRejectMatchOrRemoveItem: Object.freeze({
        fetching: false,
        error: null,
    }),
    selectedFacilityListItemsRowIndex: -1,
    downloadCSV: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

const startConfirmOrRejectMatchOrRemoveItem = state => update(state, {
    confirmOrRejectMatchOrRemoveItem: {
        fetching: { $set: true },
        error: { $set: null },
    },
});

const failConfirmOrRejectMatchOrRemoveItem = (state, payload) => update(state, {
    confirmOrRejectMatchOrRemoveItem: {
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

const completeConfirmOrRejectMatchOrRemoveItem = (state, payload) => {
    const indexForListItemToUpdate = state
        .items
        .data
        .findIndex(({ id }) => id === payload.id);

    const updatedItems = [
        ...state.items.data.slice(0, indexForListItemToUpdate),
        payload,
        ...state.items.data.slice(indexForListItemToUpdate + 1),
    ];

    const updatedSelectedRowIndex =
        payload.status === facilityListItemStatusChoicesEnum.CONFIRMED_MATCH
            ? payload.row_index
            : state.selectedFacilityListItemsRowIndex;

    return update(state, {
        list: {
            data: {
                statuses: {
                    $set: payload.list_statuses,
                },
            },
        },
        confirmOrRejectMatchOrRemoveItem: {
            fetching: { $set: false },
            error: { $set: null },
        },
        items: {
            data: {
                $set: updatedItems,
            },
        },
        selectedFacilityListItemsRowIndex: {
            $set: updatedSelectedRowIndex,
        },
    });
};

export default createReducer({
    [startFetchFacilityList]: state => update(state, {
        list: {
            $merge: {
                data: null,
                fetching: true,
                error: null,
            },
        },
    }),
    [failFetchFacilityList]: (state, payload) => update(state, {
        list: {
            $merge: {
                data: null,
                fetching: false,
                error: payload,
            },
        },
    }),
    [completeFetchFacilityList]: (state, payload) => update(state, {
        list: {
            $merge: {
                data: payload,
                fetching: false,
                error: null,
            },
        },
    }),
    [startFetchFacilityListItems]: state => update(state, {
        items: {
            $merge: {
                data: null,
                fetching: true,
                error: null,
            },
        },
    }),
    [failFetchFacilityListItems]: (state, payload) => update(state, {
        items: {
            $merge: {
                data: null,
                fetching: false,
                error: payload,
            },
        },
    }),
    [completeFetchFacilityListItems]: (state, payload) => update(state, {
        filteredCount: { $set: payload.count },
        items: {
            $merge: {
                data: payload.results,
                fetching: false,
                error: null,
            },
        },
    }),
    [startAssembleAndDownloadFacilityListCSV]: state => update(state, {
        downloadCSV: {
            data: { $set: null },
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failAssembleAndDownloadFacilityListCSV]: (state, payload) => update(state, {
        downloadCSV: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeAssembleAndDownloadFacilityListCSV]: (state, payload) => update(state, {
        downloadCSV: {
            data: { $set: payload },
            fetching: { $set: false },
            error: { $set: null },
        },
    }),
    [resetFacilityListItems]: () => initialState,
    [startConfirmFacilityListItemPotentialMatch]: startConfirmOrRejectMatchOrRemoveItem,
    [startRejectFacilityListItemPotentialMatch]: startConfirmOrRejectMatchOrRemoveItem,
    [startRemoveFacilityListItem]: startConfirmOrRejectMatchOrRemoveItem,
    [failConfirmFacilityListItemPotentialMatch]: failConfirmOrRejectMatchOrRemoveItem,
    [failRejectFacilityListItemPotentialMatch]: failConfirmOrRejectMatchOrRemoveItem,
    [failRemoveFacilityListItem]: failConfirmOrRejectMatchOrRemoveItem,
    [completeConfirmFacilityListItemPotentialMatch]: completeConfirmOrRejectMatchOrRemoveItem,
    [completeRejectFacilityListItemPotentialMatch]: completeConfirmOrRejectMatchOrRemoveItem,
    [completeRemoveFacilityListItem]: completeConfirmOrRejectMatchOrRemoveItem,
    [setSelectedFacilityListItemsRowIndex]: toggleSelectedRowIndex,
    [completeSubmitLogOut]: () => initialState,
}, initialState);
