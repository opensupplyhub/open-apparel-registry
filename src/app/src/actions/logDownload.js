import { createAction } from 'redux-act';
import get from 'lodash/get';

import apiRequest from '../util/apiRequest';

import { fetchNextPageOfFacilities } from './facilities';

import {
    makeLogDownloadUrl,
    logErrorAndDispatchFailure,
    downloadFacilitiesCSV,
    downloadFacilitiesXLSX,
} from '../util/util';

export const startLogDownload = createAction('START_LOG_DOWNLOAD');
export const failLogDownload = createAction('FAIL_LOG_DOWNLOAD');
export const completeLogDownload = createAction('COMPLETE_LOG_DOWNLOAD');

export function logDownload(format, options) {
    return async (dispatch, getState) => {
        dispatch(startLogDownload());

        const downloadFacilities =
            format === 'csv' ? downloadFacilitiesCSV : downloadFacilitiesXLSX;

        const isEmbedded = options?.isEmbedded || false;

        try {
            const {
                facilities: {
                    facilities: {
                        data: { features: facilities, count },
                        nextPageURL,
                    },
                },
                featureFlags,
            } = getState();

            const ppeIsActive =
                get(featureFlags, 'flags.ppe', false) && !isEmbedded;
            const reportsAreActive =
                get(featureFlags, 'flags.report_a_facility', false) &&
                !isEmbedded;

            const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;

            if (!isEmbedded) {
                await apiRequest.post(makeLogDownloadUrl(path, count));
            }

            if (!nextPageURL) {
                downloadFacilities(facilities, {
                    includePPEFields: ppeIsActive,
                    includeClosureFields: reportsAreActive,
                    isEmbedded,
                });
            } else {
                let nextFacilitiesSetURL = nextPageURL;

                while (nextFacilitiesSetURL) {
                    // `no-await-in-loop` is disabled because we do want the
                    // loop to await each individual promise so it we can check
                    // the `nextPageURL` value each time & thereby determine
                    // whether the loop should stop or whether it should fetch
                    // the next page of results.
                    //
                    // https://eslint.org/docs/rules/no-await-in-loop indicates
                    // that the rule is meant to help developers not mistakenly
                    // use sequential rather than parallel Promises. However,
                    // we don't want to issue these requests in parallel since
                    // doing so will DOS the server. See:
                    // https://github.com/open-apparel-registry/open-apparel-registry/pull/496
                    //
                    // eslint-disable-next-line no-await-in-loop
                    await dispatch(fetchNextPageOfFacilities());

                    const {
                        facilities: {
                            facilities: { nextPageURL: newNextPageURL },
                        },
                    } = getState();

                    nextFacilitiesSetURL = newNextPageURL;
                }

                const {
                    facilities: {
                        facilities: {
                            data: { features },
                        },
                    },
                } = getState();

                downloadFacilities(features, {
                    includePPEFields: ppeIsActive,
                    includeClosureFields: reportsAreActive,
                    isEmbedded,
                });
            }

            return dispatch(completeLogDownload());
        } catch (err) {
            return dispatch(
                logErrorAndDispatchFailure(
                    err,
                    'An error prevented the download',
                    failLogDownload,
                ),
            );
        }
    };
}
