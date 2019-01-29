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
    contributor: '',
    contributorType: '',
    country: '',
});

export default createReducer({
    [updateFacilityNameFilter]: (state, payload) => update(state, {
        facilityName: { $set: payload },
    }),
    [updateContributorFilter]: (state, payload) => update(state, {
        contributor: { $set: payload },
    }),
    [updateContributorTypeFilter]: (state, payload) => update(state, {
        contributorType: { $set: payload },
    }),
    [updateCountryFilter]: (state, payload) => update(state, {
        country: { $set: payload },
    }),
    [resetAllFilters]: () => initialState,
}, initialState);
