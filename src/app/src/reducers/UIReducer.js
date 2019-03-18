import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    makeSidebarGuideTabActive,
    makeSidebarSearchTabActive,
    makeSidebarFacilitiesTabActive,
    updateSidebarFacilitiesTabTextFilter,
    resetSidebarFacilitiesTabTextFilter,
    recordSearchTabResetButtonClick,
} from '../actions/ui';

import { completeFetchFacilities } from '../actions/facilities';

import { filterSidebarTabsEnum } from '../util/constants';

const initialState = Object.freeze({
    activeFilterSidebarTab: filterSidebarTabsEnum.search,
    facilitiesSidebarTabSearch: Object.freeze({
        filterText: '',
        resetButtonClickCount: 0,
    }),
});

export default createReducer({
    [recordSearchTabResetButtonClick]: state => update(state, {
        facilitiesSidebarTabSearch: {
            resetButtonClickCount: {
                $set: (state.facilitiesSidebarTabSearch.resetButtonClickCount + 1),
            },
        },
    }),
    [makeSidebarGuideTabActive]: state => update(state, {
        activeFilterSidebarTab: {
            $set: filterSidebarTabsEnum.guide,
        },
    }),
    [makeSidebarSearchTabActive]: state => update(state, {
        activeFilterSidebarTab: {
            $set: filterSidebarTabsEnum.search,
        },
        facilitiesSidebarTabSearch: {
            searchTerm: {
                $set: initialState.facilitiesSidebarTabSearch.searchTerm,
            },
        },
    }),
    [makeSidebarFacilitiesTabActive]: state => update(state, {
        activeFilterSidebarTab: {
            $set: filterSidebarTabsEnum.facilities,
        },
    }),
    [completeFetchFacilities]: state => update(state, {
        activeFilterSidebarTab: {
            $set: filterSidebarTabsEnum.facilities,
        },
        facilitiesSidebarTabSearch: {
            searchTerm: {
                $set: initialState.facilitiesSidebarTabSearch.searchTerm,
            },
        },
    }),
    [updateSidebarFacilitiesTabTextFilter]: (state, payload) => update(state, {
        facilitiesSidebarTabSearch: {
            filterText: {
                $set: payload,
            },
        },
    }),
    [resetSidebarFacilitiesTabTextFilter]: state => update(state, {
        facilitiesSidebarTabSearch: {
            filterText: {
                $set: initialState.facilitiesSidebarTabSearch.filterText,
            },
        },
    }),
}, initialState);
