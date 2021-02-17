import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import {
    startFetchFacilities,
    failFetchFacilities,
    completeFetchFacilities,
    resetFacilities,
    startFetchSingleFacility,
    failFetchSingleFacility,
    completeFetchSingleFacility,
    resetSingleFacility,
    startFetchNextPageOfFacilities,
    failFetchNextPageOfFacilities,
    completeFetchNextPageOfFacilities,
} from '../actions/facilities';

import {
    updateFacilityFreeTextQueryFilter,
    updateContributorFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
    updatePPEFilter,
    resetAllFilters,
    updateAllFilters,
} from '../actions/filters';

import {
    completeCreateDashboardActivityReport,
} from '../actions/dashboardActivityReports';

import { makeFeatureCollectionFromSingleFeature } from '../util/util';

import { completeSubmitLogOut } from '../actions/auth';

const initialState = Object.freeze({
    facilities: Object.freeze({
        data: null,
        fetching: false,
        error: null,
        nextPageURL: null,
        isInfiniteLoading: false,
    }),
    singleFacility: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

const handleFetchSingleFacility = (state, payload) => {
    // Check whether retrieving the single facility should also
    // replace the facilities feature collection in cases when
    //
    // - facilities data is null or empty
    // - facilities data has only one feature that is not the single facility
    const shouldReplaceAllFacilities = isNull(state.facilities.data)
        || isEmpty(state.facilities.data)
        || (state.facilities.data.features.length === 1
        && get(state, 'facilities.data.features[0].properties.oar_id', null)
        !== payload.properties.oar_id);

    if (shouldReplaceAllFacilities) {
        return update(state, {
            facilities: {
                data: { $set: makeFeatureCollectionFromSingleFeature(payload) },
            },
            singleFacility: {
                fetching: { $set: false },
                error: { $set: null },
                data: { $set: payload },
            },
        });
    }

    return update(state, {
        singleFacility: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    });
};

const clearFacilitiesDataOnFilterChange = state => update(state, {
    facilities: {
        data: { $set: null },
    },
});

export default createReducer({
    [startFetchFacilities]: state => update(state, {
        facilities: {
            fetching: { $set: true },
            error: { $set: null },
            data: { $set: null },
        },
    }),
    [failFetchFacilities]: (state, payload) => update(state, {
        facilities: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchFacilities]: (state, payload) => update(state, {
        facilities: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
            nextPageURL: { $set: get(payload, 'next', null) },
        },
    }),
    [startFetchNextPageOfFacilities]: state => update(state, {
        facilities: {
            isInfiniteLoading: { $set: true },
        },
    }),
    [failFetchNextPageOfFacilities]: state => update(state, {
        facilities: {
            isInfiniteLoading: { $set: false },
        },
    }),
    [completeFetchNextPageOfFacilities]: (state, payload) => update(state, {
        facilities: {
            fetching: { $set: false },
            error: { $set: null },
            data: {
                features: {
                    $push: get(payload, 'features', []),
                },
            },
            nextPageURL: { $set: get(payload, 'next', null) },
            isInfiniteLoading: { $set: false },
        },
    }),
    [resetFacilities]: state => update(state, {
        facilities: { $set: initialState.facilities },
    }),
    [startFetchSingleFacility]: state => update(state, {
        singleFacility: {
            data: { $set: null },
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchSingleFacility]: (state, payload) => update(state, {
        singleFacility: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchSingleFacility]: handleFetchSingleFacility,
    [resetSingleFacility]: state => update(state, {
        singleFacility: { $set: initialState.singleFacility },
    }),
    [updateFacilityFreeTextQueryFilter]: clearFacilitiesDataOnFilterChange,
    [updateContributorFilter]: clearFacilitiesDataOnFilterChange,
    [updateContributorTypeFilter]: clearFacilitiesDataOnFilterChange,
    [updateCountryFilter]: clearFacilitiesDataOnFilterChange,
    [updatePPEFilter]: clearFacilitiesDataOnFilterChange,
    [resetAllFilters]: clearFacilitiesDataOnFilterChange,
    [updateAllFilters]: clearFacilitiesDataOnFilterChange,
    [completeSubmitLogOut]: clearFacilitiesDataOnFilterChange,
    [completeCreateDashboardActivityReport]: (state, payload) => update(state, {
        singleFacility: {
            data: {
                properties: {
                    activity_reports: { $unshift: [payload.data] },
                },
            },
        },
    }),
}, initialState);
