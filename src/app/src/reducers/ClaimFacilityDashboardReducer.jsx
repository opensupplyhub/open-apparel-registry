import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchFacilityClaims,
    failFetchFacilityClaims,
    completeFetchFacilityClaims,
    clearFacilityClaims,
    startFetchSingleFacilityClaim,
    failFetchSingleFacilityClaim,
    completeFetchSingleFacilityClaim,
    clearSingleFacilityClaim,
    startApproveFacilityClaim,
    startDenyFacilityClaim,
    startRevokeFacilityClaim,
    failApproveFacilityClaim,
    failDenyFacilityClaim,
    failRevokeFacilityClaim,
    completeApproveFacilityClaim,
    completeDenyFacilityClaim,
    completeRevokeFacilityClaim,
    resetFacilityClaimControls,
    startAddNewFacilityClaimReviewNote,
    failAddNewFacilityClaimReviewNote,
    completeAddNewFacilityClaimReviewNote,
    clearFacilityClaimReviewNote,
    updateFacilityClaimReviewNote,
} from '../actions/claimFacilityDashboard';

const initialState = Object.freeze({
    list: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
    detail: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
    statusControls: Object.freeze({
        fetching: false,
        error: null,
    }),
    note: Object.freeze({
        note: '',
        fetching: false,
        error: null,
    }),
});

const handleStartChangeStatus = state =>
    update(state, {
        statusControls: {
            fetching: { $set: true },
            error: { $set: initialState.statusControls.error },
        },
    });

const handleFailChangeStatus = (state, error) =>
    update(state, {
        statusControls: {
            fetching: { $set: initialState.statusControls.fetching },
            error: { $set: error },
        },
    });

const handleCompleteChangeStatus = (state, data) =>
    update(state, {
        statusControls: {
            $set: initialState.statusControls,
        },
        detail: {
            data: { $set: data },
        },
    });

export default createReducer(
    {
        [startFetchFacilityClaims]: state =>
            update(state, {
                list: {
                    fetching: { $set: true },
                    error: { $set: initialState.list.error },
                },
            }),
        [failFetchFacilityClaims]: (state, error) =>
            update(state, {
                list: {
                    fetching: { $set: initialState.list.fetching },
                    error: { $set: error },
                },
            }),
        [completeFetchFacilityClaims]: (state, data) =>
            update(state, {
                list: {
                    fetching: { $set: initialState.list.fetching },
                    error: { $set: initialState.list.error },
                    data: { $set: data },
                },
            }),
        [clearFacilityClaims]: state =>
            update(state, {
                list: { $set: initialState.list },
            }),
        [startFetchSingleFacilityClaim]: state =>
            update(state, {
                detail: {
                    fetching: { $set: true },
                    error: { $set: initialState.detail.error },
                },
            }),
        [failFetchSingleFacilityClaim]: (state, error) =>
            update(state, {
                detail: {
                    fetching: { $set: initialState.detail.fetching },
                    error: { $set: error },
                },
            }),
        [completeFetchSingleFacilityClaim]: (state, data) =>
            update(state, {
                detail: {
                    fetching: { $set: initialState.detail.fetching },
                    error: { $set: initialState.detail.error },
                    data: { $set: data },
                },
            }),
        [clearSingleFacilityClaim]: state =>
            update(state, {
                detail: { $set: initialState.detail },
            }),
        [startApproveFacilityClaim]: handleStartChangeStatus,
        [startDenyFacilityClaim]: handleStartChangeStatus,
        [startRevokeFacilityClaim]: handleStartChangeStatus,
        [failApproveFacilityClaim]: handleFailChangeStatus,
        [failDenyFacilityClaim]: handleFailChangeStatus,
        [failRevokeFacilityClaim]: handleFailChangeStatus,
        [completeApproveFacilityClaim]: handleCompleteChangeStatus,
        [completeDenyFacilityClaim]: handleCompleteChangeStatus,
        [completeRevokeFacilityClaim]: handleCompleteChangeStatus,
        [resetFacilityClaimControls]: state =>
            update(state, {
                statusControls: {
                    $set: initialState.statusControls,
                },
            }),
        [startAddNewFacilityClaimReviewNote]: state =>
            update(state, {
                note: {
                    fetching: { $set: true },
                    error: { $set: initialState.note.error },
                },
            }),
        [failAddNewFacilityClaimReviewNote]: (state, error) =>
            update(state, {
                note: {
                    fetching: { $set: false },
                    error: { $set: error },
                },
            }),
        [completeAddNewFacilityClaimReviewNote]: (state, data) =>
            update(state, {
                note: {
                    $set: initialState.note,
                },
                detail: {
                    data: { $set: data },
                },
            }),
        [clearFacilityClaimReviewNote]: state =>
            update(state, {
                note: {
                    $set: initialState.note,
                },
            }),
        [updateFacilityClaimReviewNote]: (state, note) =>
            update(state, {
                note: {
                    note: { $set: note },
                    error: { $set: initialState.note.error },
                },
            }),
    },
    initialState,
);
