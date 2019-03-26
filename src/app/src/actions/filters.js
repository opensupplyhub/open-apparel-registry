import update from 'immutability-helper';
import { createAction } from 'redux-act';

import {
    createFiltersFromQueryString,
    updateListWithLabels,
} from '../util/util';

export const updateFacilityNameFilter = createAction('UPDATE_FACILITY_NAME_FILTER');
export const updateContributorFilter = createAction('UPDATE_CONTRIBUTOR_FILTER');
export const updateContributorTypeFilter = createAction('UPDATE_CONTRIBUTOR_TYPE_FILTER');
export const updateCountryFilter = createAction('UPDATE_COUNTRY_FILTER');
export const resetAllFilters = createAction('RESET_ALL_FILTERS');
export const updateAllFilters = createAction('UPDATE_ALL_FILTERS');

export function setFiltersFromQueryString(qs = '') {
    return (dispatch, getState) => {
        if (!qs) {
            return null;
        }

        // If contributor data already exists in the state, use it to match
        // filters from the query string with labels. Otherwise, use the
        // query string values directly. It will be updated later when the
        // contributor data is loaded.

        const filters = createFiltersFromQueryString(qs);
        const { filterOptions: { contributors: { data } } } = getState();

        const payload = data.length
            ? update(filters, {
                contributors: {
                    $set: updateListWithLabels(filters.contributors, data),
                },
            })
            : filters;

        return dispatch(updateAllFilters(payload));
    };
}
