/* eslint-disable camelcase */
import isArray from 'lodash/isArray';
import get from 'lodash/get';
import moment from 'moment';

import { joinDataIntoCSVString } from './util';
import { PPE_FIELD_NAMES, EXTENDED_FIELD_TYPES } from './constants';

export const csvHeaders = Object.freeze([
    'oar_id',
    'name',
    'address',
    'country_code',
    'country_name',
    'lat',
    'lng',
]);

const formatAttribution = ({ value, updated_at, contributor_name }) =>
    !contributor_name
        ? value
        : `${value} (${contributor_name} on ${moment(updated_at).format(
              'LL',
          )})`;

const formatNumberOfWorkers = ({
    value: { max, min },
    updated_at,
    contributor_name,
}) =>
    formatAttribution({
        value: max === min ? `${max}` : `${min}-${max}`,
        contributor_name,
        updated_at,
    });

const formatParentCompany = ({ value, contributor_name, updated_at }) =>
    formatAttribution({
        value: EXTENDED_FIELD_TYPES.find(
            f => f.fieldName === 'parent_company',
        ).formatValue(value),
        contributor_name,
        updated_at,
    });

const formatFacilityType = (
    [m, r],
    {
        value: { matched_values = [], raw_values = [] },
        updated_at,
        contributor_name,
    },
) => {
    let raw =
        typeof raw_values === 'string' ? raw_values.split('|') : raw_values;

    const matches = matched_values.map((values, i) =>
        formatAttribution({
            value: values[2] !== null ? values[2] : raw[i],
            contributor_name,
            updated_at,
        }),
    );
    raw = raw.map(value =>
        formatAttribution({
            value,
            contributor_name,
            updated_at,
        }),
    );
    return [m.concat(matches), r.concat(raw)];
};

const formatProcessingType = (
    [m, r],
    {
        value: { matched_values = [], raw_values = [] },
        updated_at,
        contributor_name,
    },
) => {
    let raw =
        typeof raw_values === 'string' ? raw_values.split('|') : raw_values;

    const matches = matched_values.map((values, i) =>
        formatAttribution({
            value: values[3] !== null ? values[3] : raw[i],
            contributor_name,
            updated_at,
        }),
    );
    raw = raw.map(value =>
        formatAttribution({
            value,
            contributor_name,
            updated_at,
        }),
    );
    return [m.concat(matches), r.concat(raw)];
};

const formatProductType = ({ value, contributor_name, updated_at }) =>
    value.raw_values
        .map(v =>
            formatAttribution({
                value: v,
                contributor_name,
                updated_at,
            }),
        )
        .join('|');

const formatExtendedFields = fields => {
    const numberOfWorkers = fields.number_of_workers
        .map(formatNumberOfWorkers)
        .join('|');
    const parentCompany = fields.parent_company
        .map(formatParentCompany)
        .join('|');
    const [
        facilityTypeMatches,
        facilityTypeRaw,
    ] = fields.facility_type.reduce(formatFacilityType, [[], []]);
    const [
        processingTypeMatches,
        processingTypeRaw,
    ] = fields.processing_type.reduce(formatProcessingType, [[], []]);
    const productType = fields.product_type.map(formatProductType).join('|');
    const columns = [
        numberOfWorkers,
        parentCompany,
        facilityTypeMatches.join('|'),
        facilityTypeRaw.join('|'),
        processingTypeMatches.join('|'),
        processingTypeRaw.join('|'),
        productType,
    ];
    return columns;
};

const extendedFieldHeaders = [
    'number_of_workers',
    'parent_company',
    'facility_type',
    'facility_type_raw',
    'processing_type',
    'processing_type_raw',
    'product_type',
];

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
            extended_fields,
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
    let contributorFields = [];
    if (options && options.isEmbedded) {
        contributorFields = options.includeExtendedFields
            ? contributor_fields.filter(
                  field => !extendedFieldHeaders.includes(field.fieldName),
              )
            : contributor_fields;
        contributorFields = contributorFields.map(field => field.value);
    }

    const extendedFields =
        options && options.includeExtendedFields
            ? formatExtendedFields(extended_fields)
            : [];

    return Object.freeze(
        [oar_id, name, address, country_code, country_name, lat, lng]
            .concat(contributorData)
            .concat(ppeFields)
            .concat(contributorFields)
            .concat(extendedFields)
            .concat(closureFields),
    );
};

export const makeFacilityReducer = options => (acc, next) =>
    acc.concat([createFacilityRowFromFeature(next, options)]);

const getContributorFieldHeaders = (facilities, options) => {
    let fields = get(facilities, '[0].properties.contributor_fields', []);
    if (options && options.includeExtendedFields) {
        fields = fields.filter(
            field => !extendedFieldHeaders.includes(field.fieldName),
        );
    }
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
    if (options && options.isEmbedded) {
        headerRow = headerRow.concat(
            getContributorFieldHeaders(facilities, options),
        );
    }
    if (options && options.includeExtendedFields) {
        headerRow = headerRow.concat(extendedFieldHeaders);
    }
    if (options && options.includeClosureFields) {
        headerRow = headerRow.concat(['is_closed']);
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
