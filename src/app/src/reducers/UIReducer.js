import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import isObject from 'lodash/isObject';

import {
    updateSidebarFacilitiesTabTextFilter,
    resetSidebarFacilitiesTabTextFilter,
    recordSearchTabResetButtonClick,
    reportWindowResize,
    toggleZoomToSearch,
    setSidebarTabActive,
    showDrawFilter,
    setGDPROpen,
    toggleFilterModal,
} from '../actions/ui';

import { completeFetchFacilities } from '../actions/facilities';

const initialState = Object.freeze({
    activeFilterSidebarTab: 0,
    filterModalOpen: false,
    facilitiesSidebarTabSearch: Object.freeze({
        filterText: '',
        resetButtonClickCount: 0,
    }),
    window: Object.freeze({
        innerHeight: isObject(window) ? window.innerHeight : null,
        innerWidth: isObject(window) ? window.innerWidth : null,
    }),
    zoomToSearch: true,
    drawFilterActive: false,
    gdprOpen: false,
});

export default createReducer(
    {
        [recordSearchTabResetButtonClick]: state =>
            update(state, {
                facilitiesSidebarTabSearch: {
                    resetButtonClickCount: {
                        $set:
                            state.facilitiesSidebarTabSearch
                                .resetButtonClickCount + 1,
                    },
                },
            }),
        [setSidebarTabActive]: (state, payload = 0) =>
            update(state, {
                activeFilterSidebarTab: {
                    $set: payload,
                },
            }),
        [toggleFilterModal]: (state, payload) =>
            update(state, {
                filterModalOpen: {
                    $set: payload ?? !state.filterModalOpen,
                },
            }),
        [completeFetchFacilities]: state =>
            update(state, {
                facilitiesSidebarTabSearch: {
                    searchTerm: {
                        $set:
                            initialState.facilitiesSidebarTabSearch.searchTerm,
                    },
                },
            }),
        [updateSidebarFacilitiesTabTextFilter]: (state, payload) =>
            update(state, {
                facilitiesSidebarTabSearch: {
                    filterText: {
                        $set: payload,
                    },
                },
            }),
        [resetSidebarFacilitiesTabTextFilter]: state =>
            update(state, {
                facilitiesSidebarTabSearch: {
                    filterText: {
                        $set:
                            initialState.facilitiesSidebarTabSearch.filterText,
                    },
                },
            }),
        [reportWindowResize]: (state, payload) =>
            update(state, {
                window: { $merge: payload },
            }),
        [toggleZoomToSearch]: (state, payload) =>
            update(state, {
                zoomToSearch: { $set: payload },
            }),
        [showDrawFilter]: (state, payload) =>
            update(state, {
                drawFilterActive: { $set: payload },
            }),
        [setGDPROpen]: (state, payload) =>
            update(state, {
                gdprOpen: { $set: payload },
            }),
    },
    initialState,
);
