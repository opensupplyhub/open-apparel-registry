import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeSplitFacilityAPIURL,
    makeLinkFacilityAPIURL,
} from '../util/util';

export const startFetchFacilityForCard = createAction(
    'START_FETCH_FACILITY_FOR_CARD',
);
export const failFetchFacilityForCard = createAction(
    'FAIL_FETCH_FACILITY_FOR_CARD',
);
export const completeFetchFacilityForCard = createAction(
    'COMPLETE_FETCH_FACILITY_FOR_CARD',
);
export const clearFacilityForCard = createAction('CLEAR_FACILITY_FOR_CARD');

export function fetchFacilityForCard({ oarID, card }) {
    return dispatch => {
        dispatch(startFetchFacilityForCard(card));

        return apiRequest
            .get(makeSplitFacilityAPIURL(oarID))
            .then(({ data }) =>
                dispatch(completeFetchFacilityForCard({ data, card })),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching that facility',
                        failFetchFacilityForCard,
                    ),
                ),
            );
    };
}

export const startLinkFacilityId = createAction('START_LINK_FACILITY_ID');
export const failLinkFacilityId = createAction('FAIL_LINK_FACILITY_ID');
export const completeLinkFacilityId = createAction('COMPLETE_LINK_FACILITY_ID');

export function linkFacilityId({ newOarID, oarID }) {
    return dispatch => {
        if (!oarID || !newOarID) {
            return null;
        }

        dispatch(startLinkFacilityId());

        return apiRequest
            .post(makeLinkFacilityAPIURL(oarID), { new_oar_id: newOarID })
            .then(({ data }) => {
                dispatch(completeLinkFacilityId(data));
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented moving that facility match',
                        failLinkFacilityId,
                    ),
                ),
            );
    };
}
