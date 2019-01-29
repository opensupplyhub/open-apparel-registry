import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    updateFacilityNameFilter,
    updateContributorFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
    resetAllFilters,
} from '../actions/filters';

const initialState = Object.freeze({
    facilityName: '',
    contributors: Object.freeze([]),
    contributorTypes: Object.freeze([]),
    countries: Object.freeze([]),
});

export default createReducer({
    [updateFacilityNameFilter]: (state, payload) => update(state, {
        facilityName: { $set: payload },
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
}, initialState);
