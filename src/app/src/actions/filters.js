import { createAction } from 'redux-act';

export const updateFacilityNameFilter = createAction('UPDATE_FACILITY_NAME_FILTER');
export const updateContributorFilter = createAction('UPDATE_CONTRIBUTOR_FILTER');
export const updateContributorTypeFilter = createAction('UPDATE_CONTRIBUTOR_TYPE_FILTER');
export const updateCountryFilter = createAction('UPDATE_COUNTRY_FILTER');
export const resetAllFilters = createAction('RESET_ALL_FILTERS');
