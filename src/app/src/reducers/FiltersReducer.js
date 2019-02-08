import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    updateFacilityNameFilter,
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

const initialState = Object.freeze({
    facilityName: '',
    contributors: Object.freeze([]),
    contributorTypes: Object.freeze([]),
    countries: Object.freeze([]),
});

const maybeSetContributorOptionsFromQueryString = (state, payload) => {
    if (!state.contributors.length) {
        return state;
    }

    // filter out any options set from the querystring which turn out
    // not to be valid according to the API's response
    const updatedContributors = state
        .contributors
        .reduce((accumulator, { value }) => {
            const validOption = payload
                .find(({ value: otherValue }) => value === otherValue);

            if (!validOption) {
                return accumulator;
            }

            return accumulator
                .concat(Object.freeze({
                    value,
                    label: validOption.label,
                }));
        }, []);

    return update(state, {
        contributors: { $set: updatedContributors },
    });
};

const maybeSetContributorTypeOptionsFromQueryString = (state, payload) => {
    if (!state.contributorTypes.length) {
        return state;
    }

    // filter out any options set from the querystring which turn out
    // not to be valid according to the API's response
    const updatedContributorTypes = state
        .contributorTypes
        .reduce((accumulator, { value }) => {
            const validOption = payload
                .find(({ value: otherValue }) => value === otherValue);

            if (!validOption) {
                return accumulator;
            }

            return accumulator
                .concat(Object.freeze({
                    value,
                    label: validOption.label,
                }));
        }, []);

    return update(state, {
        contributorTypes: { $set: updatedContributorTypes },
    });
};

const maybeSetCountryOptionsFromQueryString = (state, payload) => {
    if (!state.countries.length) {
        return state;
    }

    // filter out any options set from the querystring which turn out
    // not to be valid according to the API's response
    const updatedCountries = state
        .countries
        .reduce((accumulator, { value }) => {
            const validOption = payload
                .find(({ value: otherValue }) => value === otherValue);

            if (!validOption) {
                return accumulator;
            }

            return accumulator
                .concat(Object.freeze({
                    value,
                    label: validOption.label,
                }));
        }, []);

    return update(state, {
        countries: { $set: updatedCountries },
    });
};

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
    [updateAllFilters]: (_state, payload) => payload,
    [completeFetchContributorOptions]: maybeSetContributorOptionsFromQueryString,
    [completeFetchContributorTypeOptions]: maybeSetContributorTypeOptionsFromQueryString,
    [completeFetchCountryOptions]: maybeSetCountryOptionsFromQueryString,
}, initialState);
