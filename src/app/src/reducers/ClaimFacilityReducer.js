import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    startFetchClaimFacilityData,
    failFetchClaimFacilityData,
    completeFetchClaimFacilityData,
    clearClaimFacilityDataAndForm,
    updateClaimAFacilityContactPerson,
    updateClaimAFacilityEmail,
    updateClaimAFacilityPhoneNumber,
    updateClaimAFacilityCompany,
    updateClaimAFacilityWebsite,
    updateClaimAFacilityDescription,
    updateClaimAFacilityVerificationMethod,
    updateClaimAFacilityPreferredContactMethod,
    startSubmitClaimAFacilityData,
    failSubmitClaimAFacilityData,
    completeSubmitClaimAFacilityData,
} from '../actions/claimFacility';

const initialState = Object.freeze({
    facilityData: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
    claimData: Object.freeze({
        formData: Object.freeze({
            contactPerson: '',
            email: '',
            phoneNumber: '',
            companyName: '',
            website: '',
            facilityDescription: '',
            verificationMethod: '',
            preferredContactMethod: null,
        }),
        fetching: false,
        error: null,
    }),
});

export default createReducer(
    {
        [startFetchClaimFacilityData]: state =>
            update(state, {
                facilityData: {
                    data: { $set: initialState.facilityData.data },
                    fetching: { $set: true },
                    error: { $set: initialState.facilityData.error },
                },
            }),
        [failFetchClaimFacilityData]: (state, error) =>
            update(state, {
                facilityData: {
                    fetching: { $set: false },
                    error: { $set: error },
                },
            }),
        [completeFetchClaimFacilityData]: (state, data) =>
            update(state, {
                facilityData: {
                    data: { $set: data },
                    fetching: { $set: false },
                    error: { $set: initialState.facilityData.error },
                },
            }),
        [updateClaimAFacilityContactPerson]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        contactPerson: { $set: payload },
                    },
                },
            }),
        [updateClaimAFacilityEmail]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        email: { $set: payload },
                    },
                },
            }),

        [updateClaimAFacilityPhoneNumber]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        phoneNumber: { $set: payload },
                    },
                },
            }),
        [updateClaimAFacilityCompany]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        companyName: { $set: payload },
                    },
                },
            }),
        [updateClaimAFacilityWebsite]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        website: { $set: payload },
                    },
                },
            }),
        [updateClaimAFacilityDescription]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        facilityDescription: { $set: payload },
                    },
                },
            }),
        [updateClaimAFacilityVerificationMethod]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        verificationMethod: { $set: payload },
                    },
                },
            }),
        [updateClaimAFacilityPreferredContactMethod]: (state, payload) =>
            update(state, {
                claimData: {
                    formData: {
                        preferredContactMethod: { $set: payload },
                    },
                },
            }),
        [startSubmitClaimAFacilityData]: state =>
            update(state, {
                claimData: {
                    error: { $set: initialState.claimData.error },
                    fetching: { $set: true },
                },
            }),
        [failSubmitClaimAFacilityData]: (state, error) =>
            update(state, {
                claimData: {
                    error: { $set: error },
                    fetching: { $set: false },
                },
            }),
        [completeSubmitClaimAFacilityData]: state =>
            update(state, {
                claimData: {
                    fetching: { $set: false },
                },
            }),
        [clearClaimFacilityDataAndForm]: () => initialState,
    },
    initialState,
);
