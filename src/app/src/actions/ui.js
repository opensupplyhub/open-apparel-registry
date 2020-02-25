import { createAction } from 'redux-act';

export const makeSidebarGuideTabActive = createAction('MAKE_SIDEBAR_GUIDE_TAB_ACTIVE');
export const makeSidebarSearchTabActive = createAction('MAKE_SIDEBAR_SEARCH_TAB_ACTIVE');
export const makeSidebarFacilitiesTabActive = createAction('MAKE_SIDEBAR_FACILITIES_TAB_ACTIVE');

export const recordSearchTabResetButtonClick =
    createAction('RECORD_SEARCH_TAB_RESET_BUTTON_CLICK');

export const reportWindowResize =
    createAction('REPORT_WINDOW_RESIZE');

export const updateSidebarFacilitiesTabTextFilter =
    createAction('UPDATE_SIDEBAR_FACILITIES_TAB_TEXT_FILTER');
export const resetSidebarFacilitiesTabTextFilter =
    createAction('RESET_SIDEBAR_FACILITIES_TAB_TEXT_FILTER');

export const toggleZoomToSearch =
    createAction('TOGGLE_ZOOM_TO_SEARCH');
