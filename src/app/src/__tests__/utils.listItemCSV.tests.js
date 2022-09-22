/* eslint-env jest */
const {
    createMatchRowFromListItem,
    formatPotentialMatchData,
    formatDataForCSV,
    csvHeaders,
} = require('../util/util.listItemCSV');

const { facilityMatchStatusChoicesEnum } = require('../util/constants');

it('creates the first few fields for a match row from a list item', () => {
    const listItemWithoutMatchedFacility = {
        row_index: 1,
        status: 'status',
        country_code: 'country_code',
        country_name: 'country_name',
        name: 'name',
        address: 'address',
        matchedFacility: null,
    };

    const expectedListItemWithoutMatchedFacilityMatch = [
        1,
        'status',
        'country_code',
        'country_name',
        'name',
        'address',
        '',
        '',
        '',
        '',
        '',
    ];

    const rowForListItemWithoutMatchedFacility =
        createMatchRowFromListItem(listItemWithoutMatchedFacility);

    expectedListItemWithoutMatchedFacilityMatch.forEach((field, index) => {
        expect(rowForListItemWithoutMatchedFacility[index]).toBe(field);
    });

    const listItemWithMatchedFacility = {
        row_index: 1,
        status: 'status',
        country_code: 'country_code',
        country_name: 'country_name',
        name: 'name',
        address: 'address',
        matched_facility: {
            os_id: 'os_id',
            name: 'oar_name',
            address: 'oar_address',
            location: {
                lng: 'oar_lng',
                lat: 'oar_lat',
            },
        },
    };

    const expectedListItemWithMatchedFacilityMatch = [
        1,
        'status',
        'country_code',
        'country_name',
        'name',
        'address',
        'os_id',
        'oar_name',
        'oar_address',
        'oar_lng',
        'oar_lat',
    ];

    const rowForListItemWithMatchedFacility =
          createMatchRowFromListItem(listItemWithMatchedFacility);

    expectedListItemWithMatchedFacilityMatch.forEach((field, index) => {
        expect(rowForListItemWithMatchedFacility[index]).toBe(field);
    });
});

it('formats a potential match into a list of fields for a CSV row', () => {
    const potentialMatchData = {
        os_id: 'os_id',
        name: 'name',
        address: 'address',
        confidence: 'confidence',
        status: 'status',
        location: {
            lat: 'lat',
            lng: 'lng',
        },
    };

    const expectedFormattedPotentialMatchData = [
        'os_id',
        'name',
        'address',
        'lng',
        'lat',
        'confidence',
        'status',
    ];

    formatPotentialMatchData(potentialMatchData).forEach((field, index) => {
        expect(expectedFormattedPotentialMatchData[index]).toBe(field);
    });
});

it('creates a single CSV row for a list item with no matches', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: null,
            matches: [],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(2);

    const [headerRow, rest] = formattedCSVData;
    const [expectedHeaderRow, expectedRest] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedRest.forEach((field, index) => {
        expect(rest[index]).toBe(field);
    });
});

it('creates a single CSV row for a list item with one PENDING and one REJECTED match', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: null,
            matches: [
                {
                    os_id: 'os_id',
                    name: 'oar_name',
                    address: 'oar_address',
                    confidence: 'confidence',
                    status: facilityMatchStatusChoicesEnum.REJECTED,
                    location: {
                        lng: 'rejected_lng',
                        lat: 'rejected_lat',
                    },
                },
                {
                    os_id: 'os_id',
                    name: 'oar_name',
                    address: 'oar_address',
                    confidence: 'confidence',
                    status: facilityMatchStatusChoicesEnum.PENDING,
                    location: {
                        lng: 'pending_lng',
                        lat: 'pending_lat',
                    },
                },
            ],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            '',
            '',
            'os_id',
            'oar_name',
            'oar_address',
            'pending_lng',
            'pending_lat',
            'confidence',
            facilityMatchStatusChoicesEnum.PENDING,
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(2);

    const [headerRow, rest] = formattedCSVData;
    const [expectedHeaderRow, expectedRest] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedRest.forEach((field, index) => {
        expect(rest[index]).toBe(field);
    });
});

it('creates two CSV rows for a list item with two PENDING matches', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: null,
            matches: [
                {
                    os_id: 'os_id_one',
                    name: 'oar_name_one',
                    address: 'oar_address_one',
                    confidence: 'confidence_one',
                    status: facilityMatchStatusChoicesEnum.PENDING,
                    location: {
                        lat: 'lat_one',
                        lng: 'lng_one',
                    },
                },
                {
                    os_id: 'os_id_two',
                    name: 'oar_name_two',
                    address: 'oar_address_two',
                    confidence: 'confidence_two',
                    status: facilityMatchStatusChoicesEnum.PENDING,
                    location: {
                        lat: 'lat_two',
                        lng: 'lng_two',
                    },
                },
            ],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            '',
            '',
            'os_id_one',
            'oar_name_one',
            'oar_address_one',
            'lng_one',
            'lat_one',
            'confidence_one',
            facilityMatchStatusChoicesEnum.PENDING,
        ],
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            '',
            '',
            'os_id_two',
            'oar_name_two',
            'oar_address_two',
            'lng_two',
            'lat_two',
            'confidence_two',
            facilityMatchStatusChoicesEnum.PENDING,
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(3);

    const [headerRow, first, second] = formattedCSVData;
    const [expectedHeaderRow, expectedFirst, expectedSecond] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedFirst.forEach((field, index) => {
        expect(first[index]).toBe(field);
    });

    expectedSecond.forEach((field, index) => {
        expect(second[index]).toBe(field);
    });
});

it('creates a CSV row for a list item with a matched facility', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: {
                os_id: 'os_id',
                name: 'oar_name',
                address: 'oar_address',
                location: {
                    lat: 'lat',
                    lng: 'lng',
                },
            },
            matches: [
                {
                    os_id: 'os_id',
                    name: 'oar_name',
                    address: 'oar_address',
                    confidence: 'confidence',
                    status: facilityMatchStatusChoicesEnum.AUTOMATIC,
                    location: {
                        lat: 'lat',
                        lng: 'lng',
                    },
                },
            ],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            'os_id',
            'oar_name',
            'oar_address',
            'lng',
            'lat',
            'os_id',
            'oar_name',
            'oar_address',
            'lng',
            'lat',
            'confidence',
            facilityMatchStatusChoicesEnum.AUTOMATIC,
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(2);

    const [headerRow, rest] = formattedCSVData;
    const [expectedHeaderRow, expectedRest] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedRest.forEach((field, index) => {
        expect(rest[index]).toBe(field);
    });
});
