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
        ],
    ];

    expect(isEqual(
        formatDataForCSV(facilities),
        expected2DArray,
    )).toBe(true);
});
