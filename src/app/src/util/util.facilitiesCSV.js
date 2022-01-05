/* eslint-disable camelcase */
import isArray from 'lodash/isArray';
import get from 'lodash/get';

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
            is_closed,
            contributor_fields,
        },
        geometry: {
            coordinates: [lng, lat],
        },
    } = feature;

    const contributorData =
        options && options.isEmbedded
            ? []
            : [contributors ? contributors.map(c => c.name).join('|') : ''];
    const ppeFields =
        options && options.includePPEFields
            ? PPE_FIELD_NAMES.map(f =>
                  isArray(
                      feature.properties[f],
                  ) /* eslint-disable-line no-confusing-arrow */
                      ? feature.properties[f].join('|')
                      : feature.properties[f],
              )
            : [];
    const closureFields =
        options && options.includeClosureFields
            ? [is_closed ? 'CLOSED' : null]
            : [];
    const contributorFields =
        options && options.isEmbedded
            ? contributor_fields.map(field => field.value)
            : [];

    return Object.freeze(
        [oar_id, name, address, country_code, country_name, lat, lng]
            .concat(contributorData)
            .concat(ppeFields)
            .concat(closureFields)
            .concat(contributorFields),
    );
};

export const makeFacilityReducer = options => (acc, next) =>
    acc.concat([createFacilityRowFromFeature(next, options)]);

const getContributorFieldHeaders = facilities => {
    const fields = get(facilities, '[0].properties.contributor_fields', []);
    return fields.map(field => field.label);
};

export const makeHeaderRow = (options, facilities = []) => {
    let headerRow = csvHeaders;
    if (!options || !options.isEmbedded) {
        headerRow = headerRow.concat(['contributors']);
    }
    if (options && options.includePPEFields) {
        headerRow = headerRow.concat(PPE_FIELD_NAMES);
    }
    if (options && options.includeClosureFields) {
        headerRow = headerRow.concat(['is_closed']);
    }
    if (options && options.isEmbedded) {
        headerRow = headerRow.concat(getContributorFieldHeaders(facilities));
    }
    return [headerRow];
};

export const formatDataForCSV = (facilities, options = {}) =>
    facilities.reduce(
        makeFacilityReducer(options),
        makeHeaderRow(options, facilities),
    );

export const createFacilitiesCSV = (facilities, options = {}) => {
    const data = formatDataForCSV(facilities, options);
    return joinDataIntoCSVString(data);
};
