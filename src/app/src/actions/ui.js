import { createAction } from 'redux-act';

export const setSidebarTabActive = createAction('SET_SIDEBAR_TAB_ACTIVE');

export const toggleFilterModal = createAction('TOGGLE_FILTER_MODAL');

export const recordSearchTabResetButtonClick = createAction(
    'RECORD_SEARCH_TAB_RESET_BUTTON_CLICK',
);

export const reportWindowResize = createAction('REPORT_WINDOW_RESIZE');

export const updateSidebarFacilitiesTabTextFilter = createAction(
    'UPDATE_SIDEBAR_FACILITIES_TAB_TEXT_FILTER',
);
export const resetSidebarFacilitiesTabTextFilter = createAction(
    'RESET_SIDEBAR_FACILITIES_TAB_TEXT_FILTER',
);

export const toggleZoomToSearch = createAction('TOGGLE_ZOOM_TO_SEARCH');

export const showDrawFilter = createAction('SHOW_DRAW_FILTER');

export const setGDPROpen = createAction('SET_GDPR_OPEN');
