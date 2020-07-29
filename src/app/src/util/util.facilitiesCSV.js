/* eslint-disable camelcase */
import isArray from 'lodash/isArray';

import { joinDataIntoCSVString } from './util';
import { PPE_FIELD_NAMES } from './constants';

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

export const createFacilityRowFromFeature = (feature, options) => {
    const {
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
    } = feature;

    const ppeFields = options && options.includePPEFields
        ? PPE_FIELD_NAMES.map(
            f => isArray(feature.properties[f]) /* eslint-disable-line no-confusing-arrow */

                ? feature.properties[f].join('|')
                : feature.properties[f],
        )
        : [];

    return Object.freeze([
        oar_id,
        name,
        address,
        country_code,
        country_name,
        lat,
        lng,
        contributors ? contributors.map(c => c.name).join('|') : '',
    ].concat(ppeFields));
};

export const makeFacilityReducer = options => (acc, next) =>
    acc.concat([createFacilityRowFromFeature(next, options)]);

export const makeHeaderRow = options =>
    [
        options && options.includePPEFields
            ? csvHeaders.concat(PPE_FIELD_NAMES)
            : csvHeaders,
    ];

export const formatDataForCSV = (facilities, options = {}) =>
    facilities.reduce(
        makeFacilityReducer(options),
        makeHeaderRow(options),
    );

export const createFacilitiesCSV = (facilities, options = {}) => {
    const data = formatDataForCSV(facilities, options);
    return joinDataIntoCSVString(data);
};
