import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import isObject from 'lodash/isObject';

import {
    makeSidebarGuideTabActive,
    makeSidebarSearchTabActive,
    makeSidebarFacilitiesTabActive,
    recordSearchTabResetButtonClick,
    reportWindowResize,
} from '../actions/ui';

import { completeFetchFacilities } from '../actions/facilities';

import { filterSidebarTabsEnum } from '../util/constants';

const initialState = Object.freeze({
    activeFilterSidebarTab: filterSidebarTabsEnum.search,
    facilitiesSidebarTabSearch: Object.freeze({
        resetButtonClickCount: 0,
    }),
    window: Object.freeze({
        innerHeight: isObject(window) ? window.innerHeight : null,
        innerWidth: isObject(window) ? window.innerWidth : null,
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
    [reportWindowResize]: (state, payload) => update(state, {
        window: { $merge: payload },
    }),
}, initialState);
