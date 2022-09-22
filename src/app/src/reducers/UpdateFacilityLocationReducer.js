import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchDashboardUpdateLocationContributors,
    failFetchDashboardUpdateLocationContributors,
    completeFetchDashboardUpdateLocationContributors,
    startFetchUpdateLocationFacility,
    failFetchUpdateLocationFacility,
    completeFetchUpdateLocationFacility,
    clearUpdateLocationFacility,
    updateUpdateLocationFacilityOSID,
    updateUpdateLocationLat,
    updateUpdateLocationLng,
    updateUpdateLocationNotes,
    updateUpdateLocationContributor,
    startUpdateFacilityLocation,
    failUpdateFacilityLocation,
    completeUpdateFacilityLocation,
} from '../actions/updateFacilityLocation';

const initialState = Object.freeze({
    osID: '',
    data: null,
    fetching: false,
    error: null,
    notes: '',
    newLocation: Object.freeze({
        lat: null,
        lng: null,
    }),
    update: Object.freeze({
        fetching: false,
        error: null,
    }),
    contributors: Object.freeze({
        data: Object.freeze([]),
        fetching: false,
        error: null,
    }),
    contributor: null,
});

export default createReducer(
    {
        [startFetchDashboardUpdateLocationContributors]: state =>
            update(state, {
                contributors: {
                    fetching: { $set: true },
                    error: { $set: null },
                },
            }),
        [failFetchDashboardUpdateLocationContributors]: (state, payload) =>
            update(state, {
                contributors: {
                    fetching: { $set: false },
                    error: { $set: payload },
                },
            }),
        [completeFetchDashboardUpdateLocationContributors]: (state, payload) =>
            update(state, {
                contributors: {
                    fetching: { $set: false },
                    error: { $set: null },
                    data: { $set: payload },
                },
            }),
        [startFetchUpdateLocationFacility]: state =>
            update(state, {
                fetching: { $set: true },
                error: { $set: initialState.error },
                data: { $set: initialState.data },
            }),
        [failFetchUpdateLocationFacility]: (state, error) =>
            update(state, {
                fetching: { $set: initialState.fetching },
                error: { $set: error },
            }),
        [completeFetchUpdateLocationFacility]: (state, data) =>
            update(state, {
                fetching: { $set: initialState.fetching },
                data: { $set: data },
            }),
        [clearUpdateLocationFacility]: state =>
            update(state, {
                osID: { $set: initialState.osID },
                data: { $set: initialState.data },
                fetching: { $set: initialState.fetching },
                error: { $set: initialState.error },
            }),
        [updateUpdateLocationFacilityOSID]: (state, osID) =>
            update(state, {
                osID: { $set: osID },
                error: { $set: initialState.error },
            }),
        [updateUpdateLocationLat]: (state, lat) =>
            update(state, {
                newLocation: {
                    lat: { $set: lat },
                },
            }),
        [updateUpdateLocationLng]: (state, lng) =>
            update(state, {
                newLocation: {
                    lng: { $set: lng },
                },
            }),
        [updateUpdateLocationNotes]: (state, notes) =>
            update(state, {
                notes: { $set: notes },
            }),
        [startUpdateFacilityLocation]: state =>
            update(state, {
                update: {
                    fetching: { $set: true },
                    error: { $set: initialState.update.error },
                },
            }),
        [completeUpdateFacilityLocation]: (state, data) =>
            update(state, {
                update: {
                    fetching: { $set: initialState.update.fetching },
                    error: { $set: initialState.update.error },
                },
                newLocation: { $set: initialState.newLocation },
                notes: { $set: initialState.notes },
                contributor: { $set: initialState.contributor },
                data: { $set: data },
            }),
        [failUpdateFacilityLocation]: (state, error) =>
            update(state, {
                update: {
                    fetching: { $set: initialState.update.fetching },
                    error: { $set: error },
                },
            }),
        [updateUpdateLocationContributor]: (state, contributor) =>
            update(state, {
                contributor: { $set: contributor },
            }),
    },
    initialState,
);
