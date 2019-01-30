import { createAction } from 'redux-act';

import { logErrorAndDispatchFailure } from '../util/util';

export const startFetchFacilities = createAction('START_FETCH_FACILITIES');
export const failFetchFacilities = createAction('FAIL_FETCH_FACILITIES');
export const completeFetchFacilities = createAction('COMPLETE_FETCH_FACILITIES');
export const resetFacilities = createAction('RESET_FACILITIES');

export function fetchFacilities() {
    return (dispatch, getState) => {
        dispatch(startFetchFacilities());

        const {
            filters: {
                facilityName,
                contributors,
                contributorTypes,
                countries,
            },
        } = getState();

        window.console.log(
            'filter params ->',
            facilityName,
            contributors,
            contributorTypes,
            countries,
        );

        return Promise
            .resolve({ data: [] })
            .then(({ data }) => dispatch(completeFetchFacilities(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching facilities',
                failFetchFacilities,
            )));
    };
}
