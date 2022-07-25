import noop from 'lodash/noop';
import { createAction } from 'redux-act';

import { logDownload, startLogDownload, failLogDownload } from './logDownload';
import { makeSidebarFacilitiesTabActive } from './ui';

import apiRequest from '../util/apiRequest';
import {
    logErrorAndDispatchFailure,
    makeGetFacilitiesDownloadURLWithQueryString,
    createQueryStringFromSearchFilters,
} from '../util/util';

import { FACILITIES_DOWNLOAD_REQUEST_PAGE_SIZE } from '../util/constants';

export const startFetchDownloadFacilities = createAction(
    'START_FETCH_DOWNLOAD_FACILITIES',
);
export const failFetchDownloadFacilities = createAction(
    'FAIL_FETCH_DOWNLOAD_FACILITIES',
);
export const completeFetchDownloadFacilities = createAction(
    'COMPLETE_FETCH_DOWNLOAD_FACILITIES',
);

export const startFetchNextPageOfDownloadFacilities = createAction(
    'START_FETCH_NEXT_PAGE_OF_DOWNLOAD_FACILITIES',
);
export const failFetchNextPageOfDownloadFacilities = createAction(
    'FAIL_FETCH_NEXT_PAGE_OF_DOWNLOAD_FACILITIES',
);
export const completeFetchNextPageOfDownloadFacilities = createAction(
    'COMPLETE_FETCH_NEXT_PAGE_OF_DOWNLOAD_FACILITIES',
);

export function fetchNextPageOfDownloadFacilities() {
    return (dispatch, getState) => {
        const {
            facilitiesDownload: {
                facilities: { nextPageURL },
            },
        } = getState();

        if (!nextPageURL) {
            return noop();
        }

        dispatch(startFetchNextPageOfDownloadFacilities());

        return apiRequest
            .get(nextPageURL)
            .then(({ data }) =>
                dispatch(completeFetchNextPageOfDownloadFacilities(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching the next page of facilities',
                        failFetchNextPageOfDownloadFacilities,
                    ),
                ),
            );
    };
}

export default function downloadFacilities(format, { isEmbedded }) {
    return (dispatch, getState) => {
        const detail = true;
        const pageSize = FACILITIES_DOWNLOAD_REQUEST_PAGE_SIZE;

        dispatch(startLogDownload());

        dispatch(startFetchDownloadFacilities());

        const {
            filters,
            embeddedMap: { embed },
        } = getState();

        const qs = createQueryStringFromSearchFilters(filters, embed, detail);

        return apiRequest
            .get(makeGetFacilitiesDownloadURLWithQueryString(qs, pageSize))
            .then(({ data }) => {
                dispatch(completeFetchDownloadFacilities(data));
                dispatch(makeSidebarFacilitiesTabActive());
                dispatch(logDownload(format, { isEmbedded }));
            })
            .catch(err => {
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching facilities',
                        failFetchDownloadFacilities,
                    ),
                );
                dispatch(failLogDownload());
            });
    };
}
