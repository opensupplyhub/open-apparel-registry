import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import { logErrorAndDispatchFailure, makeGetFacilityByOARIdURL } from '../util/util';

export const startFetchClaimFacilityData = createAction('START_FETCH_CLAIM_FACILITY_DATA');
export const failFetchClaimFacilityData = createAction('FAIL_FETCH_CLAIM_FACILITY_DATA');
export const completeFetchClaimFacilityData = createAction('COMPLETE_FETCH_CLAIM_FACILITY_DATA');
export const clearClaimFacilityDataAndForm = createAction('CLEAR_CLAIM_FACILITY_DATA_AND_FORM');

export function fetchClaimFacilityData(oarID) {
    return (dispatch) => {
        dispatch(startFetchClaimFacilityData());

        return csrfRequest
            .get(makeGetFacilityByOARIdURL(oarID))
            .then(({ data }) => dispatch(completeFetchClaimFacilityData(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching data about that facility',
                failFetchClaimFacilityData,
            )));
    };
}

export const updateClaimAFacilityContactPerson =
    createAction('UPDATE_CLAIM_A_FACILITY_CONTACT_PERSON');
export const updateClaimAFacilityEmail =
    createAction('UPDATE_CLAIM_A_FACILITY_EMAIL');
export const updateClaimAFacilityPhoneNumber =
    createAction('UPDATE_CLAIM_A_FACILITY_PHONE_NUMBER');
export const updateClaimAFacilityCompany =
    createAction('UPDATE_CLAIM_A_FACILITY_COMPANY');
export const updateClaimAFacilityWebsite =
    createAction('UPDATE_CLAIM_A_FACILITY_WEBSITE');
export const updateClaimAFacilityDescription =
    createAction('UPDATE_CLAIM_A_FACILITY_DESCRIPTION');
export const updateClaimAFacilityVerificationMethod =
    createAction('UPDATE_CLAIM_A_FACILITY_VERIFICATION_METHOD');
export const updateClaimAFacilityPreferredContactMethod =
    createAction('UPDATE_CLAIM_A_FACILITY_PREFERRED_CONTACT_METHOD');

export const startSubmitClaimAFacilityData =
    createAction('START_SUBMIT_CLAIM_A_FACILITY_DATA');
export const failSubmitClaimAFacilityData =
    createAction('FAIL_SUBMIT_CLAIM_A_FACILITY_DATA');
export const completeSubmitClaimAFacilityData =
    createAction('COMPLETE_SUBMIT_CLAIM_A_FACILITY_DATA');

export function submitClaimAFacilityData(oarID) {
    return (dispatch, getState) => {
        dispatch(startSubmitClaimAFacilityData());

        const {
            claimFacility: {
                claimData: {
                    formData,
                },
            },
        } = getState();

        window.console.dir(formData);

        return Promise
            .resolve(({ data: oarID }))
            .then(({ data }) => dispatch(completeSubmitClaimAFacilityData(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented submitting facility claim data',
                failSubmitClaimAFacilityData,
            )));
    };
}
