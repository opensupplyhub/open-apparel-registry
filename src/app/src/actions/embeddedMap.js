import querystring from 'querystring';
import { createAction } from 'redux-act';
import startsWith from 'lodash/startsWith';

import apiRequest from '../util/apiRequest';
import {
    makeContributorEmbedConfigURL,
    logErrorAndDispatchFailure,
} from '../util/util';
import { OARFont, OARColor } from '../util/constants';

export const setEmbeddedMapStatus = createAction('SET_EMBEDDED_MAP_STATUS');

export function setEmbeddedMapStatusFromQueryString(qs = '') {
    return dispatch => {
        if (!qs) {
            return null;
        }

        const qsToParse = startsWith(qs, '?') ? qs.slice(1) : qs;

        const { embed = '' } = querystring.parse(qsToParse);

        return dispatch(setEmbeddedMapStatus(embed));
    };
}

export const startFetchEmbedConfig = createAction('START_FETCH_EMBED_CONFIG');
export const completeFetchEmbedConfig = createAction(
    'COMPLETE_FETCH_EMBED_CONFIG',
);
export const failFetchEmbedConfig = createAction('FAIL_FETCH_EMBED_CONFIG');

export function fetchEmbedConfig(contributorID) {
    return dispatch => {
        dispatch(startFetchEmbedConfig());

        return apiRequest
            .get(makeContributorEmbedConfigURL(contributorID))
            .then(({ data }) => {
                const { font, color } = data;
                dispatch(
                    completeFetchEmbedConfig({
                        ...data,
                        font: !font ? OARFont : font,
                        color: !color ? OARColor : color,
                    }),
                );
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching embedded map configuration data',
                        failFetchEmbedConfig,
                    ),
                ),
            );
    };
}
