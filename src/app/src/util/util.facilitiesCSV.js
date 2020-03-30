/* eslint-disable camelcase */
import flow from 'lodash/flow';

import { joinDataIntoCSVString } from './util';

export const csvHeaders = Object.freeze([
    'oar_id',
    'name',
    'address',
    'country_code',
    'country_name',
    'lat',
    'lng',
    'contributors',
]);

export const createFacilityRowFromFeature = ({
    properties: {
        name,
        address,
        country_code,
        country_name,
        oar_id,
        contributors,
    },
    geometry: {
        coordinates: [
            lng,
            lat,
        ],
    },
}) => Object.freeze([
    oar_id,
    name,
    address,
    country_code,
    country_name,
    lat,
    lng,
    contributors ? contributors.map(c => c.name).join('|') : '',
]);

export const facilityReducer = (acc, next) =>
    acc.concat([createFacilityRowFromFeature(next)]);

export const formatDataForCSV = facilities => facilities.reduce(facilityReducer, [csvHeaders]);

export const createFacilitiesCSV = flow(formatDataForCSV, data => joinDataIntoCSVString(data));
