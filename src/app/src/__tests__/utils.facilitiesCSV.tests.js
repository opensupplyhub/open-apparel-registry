/* eslint-env jest */
import isEqual from 'lodash/isEqual';

import {
    csvHeaders,
    createFacilityRowFromFeature,
    formatDataForCSV,
} from '../util/util.facilitiesCSV';

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
        csvHeaders,
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
