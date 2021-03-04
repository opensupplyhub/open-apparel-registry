import querystring from 'querystring';
import { createAction } from 'redux-act';
import startsWith from 'lodash/startsWith';

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
