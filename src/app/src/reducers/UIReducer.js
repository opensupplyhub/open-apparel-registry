import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    makeSidebarGuideTabActive,
    makeSidebarSearchTabActive,
    makeSidebarFacilitiesTabActive,
    updateSidebarFacilitiesTabTextFilter,
    resetSidebarFacilitiesTabTextFilter,
} from '../actions/ui';

import { completeFetchFacilities } from '../actions/facilities';

import { completeSubmitLogOut } from '../actions/auth';

import { filterSidebarTabsEnum } from '../util/constants';

const initialState = Object.freeze({
    activeFilterSidebarTab: filterSidebarTabsEnum.search,
    facilitiesSidebarTabSearch: Object.freeze({
        filterText: '',
    }),
});

export default createReducer({
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
    [completeSubmitLogOut]: () => initialState,
}, initialState);
