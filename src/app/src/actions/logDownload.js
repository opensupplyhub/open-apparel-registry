import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    makeLogDownloadUrl,
    logErrorAndDispatchFailure,
    downloadFacilitiesCSV,
} from '../util/util';

export const startLogDownload =
    createAction('START_LOG_DOWNLOAD');
export const failLogDownload =
    createAction('FAIL_LOG_DOWNLOAD');
export const completeLogDownload =
    createAction('COMPLETE_LOG_DOWNLOAD');

export function logDownload() {
    return (dispatch, getState) => {
        dispatch(startLogDownload());

        const {
            facilities: {
                facilities: {
                    data: {
                        features: facilities,
                    },
                },
            },
        } = getState();

        const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const recordCount = facilities ? facilities.length : 0;
        return apiRequest
            .post(makeLogDownloadUrl(path, recordCount))
            .then(() => downloadFacilitiesCSV(facilities))
            .then(() => dispatch(completeLogDownload()))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented the download',
                failLogDownload,
            )));
    };
}
