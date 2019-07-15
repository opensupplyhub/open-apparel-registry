import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    updateFacilityFreeTextQueryFilter,
    updateContributorFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
    resetAllFilters,
    updateAllFilters,
} from '../actions/filters';

import {
    completeFetchContributorOptions,
    completeFetchContributorTypeOptions,
    completeFetchCountryOptions,
} from '../actions/filterOptions';

import { completeSubmitLogOut } from '../actions/auth';

import {
    updateListWithLabels,
} from '../util/util';

const initialState = Object.freeze({
    facilityFreeTextQuery: '',
    contributors: Object.freeze([]),
    contributorTypes: Object.freeze([]),
    countries: Object.freeze([]),
});

export const maybeSetFromQueryString = field => (state, payload) => {
    if (!state[field].length) {
        return state;
    }

    // filter out any options set from the querystring which turn out
    // not to be valid according to the API's response
    const updatedField = updateListWithLabels(state[field], payload);

    return update(state, {
        [field]: { $set: updatedField },
    });
};

export default createReducer({
    [updateFacilityFreeTextQueryFilter]: (state, payload) => update(state, {
        facilityFreeTextQuery: { $set: payload },
    }),
    [updateContributorFilter]: (state, payload) => update(state, {
        contributors: { $set: payload },
    }),
    [updateContributorTypeFilter]: (state, payload) => update(state, {
        contributorTypes: { $set: payload },
    }),
    [updateCountryFilter]: (state, payload) => update(state, {
        countries: { $set: payload },
    }),
    [resetAllFilters]: () => initialState,
    [updateAllFilters]: (_state, payload) => payload,
    [completeFetchContributorOptions]: maybeSetFromQueryString('contributors'),
    [completeFetchContributorTypeOptions]: maybeSetFromQueryString('contributorTypes'),
    [completeFetchCountryOptions]: maybeSetFromQueryString('countries'),
    [completeSubmitLogOut]: () => initialState,
}, initialState);
