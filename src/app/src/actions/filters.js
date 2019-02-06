import { createAction } from 'redux-act';

import { createFiltersFromQueryString } from '../util/util';

export const updateFacilityNameFilter = createAction('UPDATE_FACILITY_NAME_FILTER');
export const updateContributorFilter = createAction('UPDATE_CONTRIBUTOR_FILTER');
export const updateContributorTypeFilter = createAction('UPDATE_CONTRIBUTOR_TYPE_FILTER');
export const updateCountryFilter = createAction('UPDATE_COUNTRY_FILTER');
export const resetAllFilters = createAction('RESET_ALL_FILTERS');
export const updateAllFilters = createAction('UPDATE_ALL_FILTERS');

export function setFiltersFromQueryString(qs = '') {
    return (dispatch) => {
        if (!qs) {
            return null;
        }

        return dispatch(updateAllFilters(createFiltersFromQueryString(qs)));
    };
}
