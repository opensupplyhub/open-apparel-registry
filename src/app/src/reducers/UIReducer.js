import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    makeSidebarGuideTabActive,
    makeSidebarSearchTabActive,
} from '../actions/ui';

import { filterSidebarTabsEnum } from '../util/constants';

const initialState = Object.freeze({
    activeFilterSidebarTab: filterSidebarTabsEnum.search,
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
    }),
}, initialState);
