/* eslint-disable camelcase */
import get from 'lodash/get';

import { joinDataIntoCSVString } from './util';

export const csvHeaders = Object.freeze([
    'oar_id',
    'name',
    'address',
    'country_code',
    'country_name',
    'lat',
    'lng',
]);

export const formatDataForCSV = facilities =>
    [get(facilities, 'headers', csvHeaders)].concat(
        get(facilities, 'rows', []),
    );

export const createFacilitiesCSV = facilities => {
    const data = formatDataForCSV(facilities);
    return joinDataIntoCSVString(data);
};
