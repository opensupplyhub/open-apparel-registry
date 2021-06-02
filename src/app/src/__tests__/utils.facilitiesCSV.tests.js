/* eslint-env jest */
import isEqual from 'lodash/isEqual';

import {
    csvHeaders,
    createFacilityRowFromFeature,
    formatDataForCSV,
} from '../util/util.facilitiesCSV';

import { PPE_FIELD_NAMES } from '../util/constants';

it('creates a new facility row array from a feature', () => {
    const feature = {
        properties: {
            name: 'name',
            address: 'address',
            country_code: 'country_code',
            country_name: 'country_name',
            oar_id: 'oar_id',
            contributors: [
                {
                    id: 1,
                    name: 'contributor_name (list_name)',
                    verified: false,
                },
                {
                    id: 2,
                    name: 'contributor_2_name (list_2_name)',
                    verified: true,
                },
            ],
        },
        geometry: {
            coordinates: [
                'lng',
                'lat',
            ],
        },
    };

    const expectedRowArray = [
        'oar_id',
        'name',
        'address',
        'country_code',
        'country_name',
        'lat',
        'lng',
        'contributor_name (list_name)|contributor_2_name (list_2_name)',
    ];

    expect(isEqual(
        createFacilityRowFromFeature(feature),
        expectedRowArray,
    )).toBe(true);
});

it('creates a 2-d array including headers for exporting as a CSV', () => {
    const facilities = [
        {
            properties: {
                name: 'name',
                address: 'address',
                country_code: 'country_code',
                country_name: 'country_name',
                oar_id: 'oar_id',
                contributors: [
                    {
                        id: 1,
                        name: 'contributor_name',
                        verified: false,
                    },
                ],
            },
            geometry: {
                coordinates: [
                    'lng',
                    'lat',
                ],
            },
        },
    ];

    const expected2DArray = [
        csvHeaders.concat(['contributors']),
        [
            'oar_id',
            'name',
            'address',
            'country_code',
            'country_name',
            'lat',
            'lng',
            'contributor_name',
        ],
    ];

    expect(isEqual(
        formatDataForCSV(facilities),
        expected2DArray,
    )).toBe(true);
});

it('creates a 2-d array including PPE headers', () => {
    const facilities = [
        {
            properties: {
                name: 'name',
                address: 'address',
                country_code: 'country_code',
                country_name: 'country_name',
                oar_id: 'oar_id',
                contributors: [
                    {
                        id: 1,
                        name: 'contributor_name',
                        verified: false,
                    },
                ],
            },
            geometry: {
                coordinates: [
                    'lng',
                    'lat',
                ],
            },
        },
    ];

    const expectedHeader = csvHeaders.concat(['contributors']).concat(PPE_FIELD_NAMES);
    const expectedRow = [
        'oar_id',
        'name',
        'address',
        'country_code',
        'country_name',
        'lat',
        'lng',
        'contributor_name',
        undefined,
        undefined,
        undefined,
        undefined,
    ];

    const expected2DArray = [expectedHeader, expectedRow];

    expect(
        formatDataForCSV(facilities, { includePPEFields: true }),
    ).toEqual(expected2DArray);
});

it('creates a 2-d array including PPE headers and values', () => {
    const facilities = [
        {
            properties: {
                name: 'name',
                address: 'address',
                country_code: 'country_code',
                country_name: 'country_name',
                oar_id: 'oar_id',
                contributors: [
                    {
                        id: 1,
                        name: 'contributor_name',
                        verified: false,
                    },
                ],
                ppe_product_types: ['ppe_product_type_1', 'ppe_product_type_2'],
                ppe_contact_phone: 'ppe_contact_phone',
                ppe_contact_email: 'ppe_contact_email',
                ppe_website: 'ppe_website',
            },
            geometry: {
                coordinates: [
                    'lng',
                    'lat',
                ],
            },
        },
    ];

    const expected2DArray = [
        csvHeaders.concat([
            'contributors',
            'ppe_product_types',
            'ppe_contact_phone',
            'ppe_contact_email',
            'ppe_website',
        ]),
        [
            'oar_id',
            'name',
            'address',
            'country_code',
            'country_name',
            'lat',
            'lng',
            'contributor_name',
            'ppe_product_type_1|ppe_product_type_2',
            'ppe_contact_phone',
            'ppe_contact_email',
            'ppe_website',
        ],
    ];

    expect(
        formatDataForCSV(facilities, { includePPEFields: true }),
    ).toEqual(expected2DArray);
});

it('creates a 2-d array including closure headers and values', () => {
    const facilities = [
        {
            properties: {
                name: 'name',
                address: 'address',
                country_code: 'country_code',
                country_name: 'country_name',
                oar_id: 'oar_id',
                contributors: [
                    {
                        id: 1,
                        name: 'contributor_name',
                        verified: false,
                    },
                ],
                is_closed: true,
            },
            geometry: {
                coordinates: [
                    'lng',
                    'lat',
                ],
            },
        },
        {
            properties: {
                name: 'name',
                address: 'address',
                country_code: 'country_code',
                country_name: 'country_name',
                oar_id: 'oar_id',
                contributors: [
                    {
                        id: 1,
                        name: 'contributor_name',
                        verified: false,
                    },
                ],
                is_closed: false,
            },
            geometry: {
                coordinates: [
                    'lng',
                    'lat',
                ],
            },
        },
    ];

    const expected2DArray = [
        csvHeaders.concat([
            'contributors',
            'is_closed',
        ]),
        [
            'oar_id',
            'name',
            'address',
            'country_code',
            'country_name',
            'lat',
            'lng',
            'contributor_name',
            'CLOSED',
        ],
        [
            'oar_id',
            'name',
            'address',
            'country_code',
            'country_name',
            'lat',
            'lng',
            'contributor_name',
            null,
        ],
    ];

    expect(
        formatDataForCSV(facilities, { includeClosureFields: true }),
    ).toEqual(expected2DArray);
});
