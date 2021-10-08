import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import constant from 'lodash/constant';

import {
    startFetchFacilityForCard,
    failFetchFacilityForCard,
    completeFetchFacilityForCard,
    clearFacilityForCard,
    startLinkFacilityId,
    failLinkFacilityId,
    completeLinkFacilityId,
} from '../actions/linkFacilityId';

const initialCard = Object.freeze({ fetching: false, data: null });
const initialState = Object.freeze({
    error: null,
    facilities: {
        source: initialCard,
        newid: initialCard,
    },
});

export default createReducer(
    {
        [startFetchFacilityForCard]: (state, card) =>
            update(state, {
                facilities: {
                    [card]: { fetching: { $set: true } },
                },
                error: { $set: initialState.error },
            }),
        [failFetchFacilityForCard]: (state, error) =>
            update(state, {
                error: { $set: error },
            }),
        [completeFetchFacilityForCard]: (state, payload) =>
            update(state, {
                facilities: {
                    [payload.card]: {
                        data: { $set: payload.data },
                        fetching: { $set: initialCard.fetching },
                    },
                },
                error: { $set: initialState.error },
            }),
        [startLinkFacilityId]: state =>
            update(state, {
                facilities: {
                    source: { fetching: { $set: true } },
                },
                error: { $set: initialState.error },
            }),
        [failLinkFacilityId]: (state, error) =>
            update(state, {
                facilities: {
                    source: { fetching: { $set: false } },
                },
                error: { $set: error },
            }),
        [completeLinkFacilityId]: (state, payload) =>
            update(state, {
                facilities: {
                    source: {
                        data: { $set: payload },
                        fetching: { $set: initialCard.fetching },
                    },
                },
                error: { $set: initialState.error },
            }),
        [clearFacilityForCard]: constant(initialState),
    },
    initialState,
);
