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
        confirmOrRejectMatch: {
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
        items: {
            $merge: {
                data: payload,
                fetching: false,
                error: null,
            },
        },
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
