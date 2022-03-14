import update from 'immutability-helper';
import { createAction } from 'redux-act';

import {
    createFiltersFromQueryString,
    updateListWithLabels,
} from '../util/util';
import { setEmbeddedMapStatusFromQueryString } from '../actions/embeddedMap';

export const updateFacilityFreeTextQueryFilter = createAction(
    'UPDATE_FACILITY_FREE_TEXT_QUERY_FILTER',
);
export const updateContributorFilter = createAction(
    'UPDATE_CONTRIBUTOR_FILTER',
);
export const updateContributorTypeFilter = createAction(
    'UPDATE_CONTRIBUTOR_TYPE_FILTER',
);
export const updateListFilter = createAction('UPDATE_LIST_FILTER');
export const updateCountryFilter = createAction('UPDATE_COUNTRY_FILTER');
export const updateParentCompanyFilter = createAction(
    'UPDATE_PARENT_COMPANY_FILTER',
);
export const updateFacilityTypeFilter = createAction(
    'UPDATE_FACILITY_TYPE_FILTER',
);
export const updateProcessingTypeFilter = createAction(
    'UPDATE_PROCESSING_TYPE_FILTER',
);
export const updateProductTypeFilter = createAction(
    'UPDATE_PRODUCT_TYPE_FILTER',
);
export const updateCombineContributorsFilterOption = createAction(
    'UPDATE_COMBINE_CONTRIBUTORS_FILTER_OPTION',
);
export const updateBoundaryFilter = createAction('UPDATE_BOUNDARY_FILTER');
export const updatePPEFilter = createAction('UPDATE_PPE_FILTER');
export const resetAllFilters = createAction('RESET_ALL_FILTERS');
export const updateAllFilters = createAction('UPDATE_ALL_FILTERS');

export function setFiltersFromQueryString(qs = '') {
    return (dispatch, getState) => {
        if (!qs) {
            return null;
        }

        dispatch(setEmbeddedMapStatusFromQueryString(qs));

        // If contributor data already exists in the state, use it to match
        // filters from the query string with labels. Otherwise, use the
        // query string values directly. It will be updated later when the
        // contributor data is loaded.

        const filters = createFiltersFromQueryString(qs);
        const {
            filterOptions: {
                contributors: { data },
                lists,
            },
        } = getState();

        let payload = data.length
            ? update(filters, {
                  contributors: {
                      $set: updateListWithLabels(filters.contributors, data),
                  },
                  parentCompany: {
                      $set: updateListWithLabels(filters.parentCompany, data),
                  },
              })
            : filters;

        payload = lists.data.length
            ? update(payload, {
                  lists: {
                      $set: updateListWithLabels(filters.lists, lists.data),
                  },
              })
            : payload;

        return dispatch(updateAllFilters(payload));
    };
}
