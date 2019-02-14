/* eslint-env jest */

const mapValues = require('lodash/mapValues');
const isEqual = require('lodash/isEqual');
const turf = require('@turf/turf');

const {
    makeFacilityListsURL,
    makeSingleFacilityListURL,
    makeAPITokenURL,
    makeGetContributorsURL,
    makeGetContributorTypesURL,
    makeGetCountriesURL,
    makeGetFacilitiesURL,
    makeGetFacilityByOARIdURL,
    makeGetFacilitiesURLWithQueryString,
    getValueFromObject,
    createQueryStringFromSearchFilters,
    allFiltersAreEmpty,
    createFiltersFromQueryString,
    getFeaturesFromFeatureCollection,
    getValueFromEvent,
    getCheckedFromEvent,
    getFileFromInputRef,
    getFileNameFromInputRef,
    createSignupErrorMessages,
    createSignupRequestData,
    createErrorListFromResponseObject,
    mapDjangoChoiceTuplesToSelectOptions,
    allListsAreEmpty,
    makeFacilityDetailLink,
    getBBoxForArrayOfGeoJSONPoints,
    makeFacilityListItemsDetailLink,
    makePaginatedFacilityListItemsDetailLinkWithRowCount,
    makeSliceArgumentsForTablePagination,
    getNumberFromParsedQueryStringParamOrUseDefault,
    createPaginationOptionsFromQueryString,
    makeReportADataIssueEmailLink,
    makeFeatureCollectionFromSingleFeature,
} = require('../util/util');

const {
    OTHER,
    registrationFieldsEnum,
    registrationFormFields,
    DEFAULT_PAGE,
    DEFAULT_ROWS_PER_PAGE,
} = require('../util/constants');

it('creates a route for checking facility list items', () => {
    const listID = 'hello';
    const expectedRoute = '/lists/hello';
    expect(makeFacilityListItemsDetailLink(listID)).toBe(expectedRoute);
});

it('creates a paginated facility list items route with the row count', () => {
    const listID = 'foo';
    const page = 'bar';
    const rowCount = 'baz';
    const expectedRoute = '/lists/foo?page=bar&rowsPerPage=baz';
    expect(makePaginatedFacilityListItemsDetailLinkWithRowCount(listID, page, rowCount))
        .toBe(expectedRoute);
});

it('creates API URLs for a user\'s facility lists viewset', () => {
    const facilityListsURL = '/api/facility-lists/';
    expect(makeFacilityListsURL()).toEqual(facilityListsURL);
    const singleFacilityListURL = '/api/facility-lists/2/';
    expect(makeSingleFacilityListURL(2)).toEqual(singleFacilityListURL);
});

it('creates an API URL for generating an API token', () => {
    const uid = 123;
    const expectedMatch = '/api-token-auth/';
    expect(makeAPITokenURL(uid)).toEqual(expectedMatch);
});

it('creates API URLs for getting contributor, contributor type, and country options', () => {
    const contributorMatch = '/api/contributors/';
    const contributorTypesMatch = '/api/contributor-types/';
    const countriesMatch = '/api/countries/';

    expect(makeGetContributorsURL()).toEqual(contributorMatch);
    expect(makeGetContributorTypesURL()).toEqual(contributorTypesMatch);
    expect(makeGetCountriesURL()).toEqual(countriesMatch);
});

it('creates an API URL for getting all facilities', () => {
    const expectedMatch = '/api/facilities/';
    expect(makeGetFacilitiesURL()).toEqual(expectedMatch);
});

it('creates an API URL for getting a single facility by OAR ID', () => {
    const expectedMatch = '/api/facilities/12345/';
    expect(makeGetFacilityByOARIdURL(12345)).toEqual(expectedMatch);
});

it('creates an API URL for getting facilities with a query string', () => {
    const qs = 'hello=world';
    const expectedMatch = '/api/facilities/?hello=world';
    expect(makeGetFacilitiesURLWithQueryString(qs)).toEqual(expectedMatch);
});

it('gets the value from a React Select option object', () => {
    const reactSelectOption = { value: 'value' };
    const expectedMatch = 'value';
    expect(getValueFromObject(reactSelectOption)).toEqual(expectedMatch);
});

it('creates a querystring from a set of filter selection', () => {
    const emptyFilterSelections = {
        facilityName: '',
        contributors: [],
        contributorTypes: [],
        countries: [],
    };

    const expectedEmptySelectionQSMatch = '';
    expect(createQueryStringFromSearchFilters(emptyFilterSelections))
        .toEqual(expectedEmptySelectionQSMatch);

    const multipleFilterSelections = {
        facilityName: '',
        contributors: [
            { value: 'foo', label: 'foo' },
            { value: 'bar', label: 'bar' },
            { value: 'baz', label: 'bar' },
        ],
        contributorTypes: [],
        countries: [
            { value: 'country', label: 'country' },
        ],
    };

    const expectedMultipleFilterSelectionsMatch =
        'contributors=foo&contributors=bar&contributors=baz&countries=country';
    expect(createQueryStringFromSearchFilters(multipleFilterSelections))
        .toEqual(expectedMultipleFilterSelectionsMatch);

    const allFilters = {
        facilityName: 'hello',
        contributors: [
            { value: 'hello', label: 'hello' },
            { value: 'world', label: 'hello' },
        ],
        contributorTypes: [
            { value: 'foo', label: 'foo' },
        ],
        countries: [
            { value: 'bar', label: 'bar' },
        ],
    };

    const expectedAllFiltersMatch =
        'name=hello&contributors=hello&contributors=world'
            .concat('&contributor_types=foo&countries=bar');
    expect(createQueryStringFromSearchFilters(allFilters))
        .toEqual(expectedAllFiltersMatch);
});

it('checks whether the filters object has only empty values', () => {
    const emptyFilters = {
        hello: '',
        world: [],
        foo: {},
        bar: null,
    };

    expect(allFiltersAreEmpty(emptyFilters)).toBe(true);

    const nonEmptyFilters = {
        foo: '',
        bar: [],
        baz: [1],
    };

    expect(allFiltersAreEmpty(nonEmptyFilters)).toBe(false);

    const nonEmptyStringFilter = {
        hello: 'hello',
        world: [],
    };

    expect(allFiltersAreEmpty(nonEmptyStringFilter)).toBe(false);
});

it('gets a list of features from a feature collection', () => {
    const featureCollection = { features: ['feature'] };
    const expectedMatch = ['feature'];

    expect(isEqual(
        getFeaturesFromFeatureCollection(featureCollection),
        expectedMatch,
    )).toBe(true);
});

it('creates a set of filters from a querystring', () => {
    const contributorsString = '?contributors=1&contributors=2';
    const expectedContributorsMatch = {
        facilityName: '',
        contributors: [
            {
                value: 1,
                label: '1',
            },
            {
                value: 2,
                label: '2',
            },
        ],
        contributorTypes: [],
        countries: [],
    };

    expect(isEqual(
        createFiltersFromQueryString(contributorsString),
        expectedContributorsMatch,
    )).toBe(true);

    const typesString = '?contributor_types=Union&contributor_types=Service Provider';
    const expectedTypesMatch = {
        facilityName: '',
        contributors: [],
        contributorTypes: [
            {
                value: 'Union',
                label: 'Union',
            },
            {
                value: 'Service Provider',
                label: 'Service Provider',
            },
        ],
        countries: [],
    };

    expect(isEqual(
        createFiltersFromQueryString(typesString),
        expectedTypesMatch,
    )).toBe(true);

    const countriesString = '?countries=US&countries=CN';
    const expectedCountriesMatch = {
        facilityName: '',
        contributors: [],
        contributorTypes: [],
        countries: [
            {
                value: 'US',
                label: 'US',
            },
            {
                value: 'CN',
                label: 'CN',
            },
        ],
    };

    expect(isEqual(
        createFiltersFromQueryString(countriesString),
        expectedCountriesMatch,
    )).toBe(true);

    const stringWithCountriesMissing = '?contributor_types=Union&countries=';
    const expectedMissingCountriesMatch = {
        facilityName: '',
        contributors: [],
        contributorTypes: [
            {
                value: 'Union',
                label: 'Union',
            },
        ],
        countries: [],
    };

    expect(isEqual(
        createFiltersFromQueryString(stringWithCountriesMissing),
        expectedMissingCountriesMatch,
    )).toBe(true);
});

it('creates a facility detail link', () => {
    const expectedMatch = '/facilities/hello';
    const link = makeFacilityDetailLink('hello');

    expect(link).toEqual(expectedMatch);
});

it('gets the value from an event on a DOM input', () => {
    const value = 'value';
    const mockEvent = {
        target: {
            value,
        },
    };

    expect(getValueFromEvent(mockEvent)).toEqual(value);
});

it('gets the checked state from an even on a DOM checkbox input', () => {
    const checked = true;
    const mockEvent = {
        target: {
            checked,
        },
    };

    expect(getCheckedFromEvent(mockEvent)).toEqual(true);
});

it('gets the file from a file input ref', () => {
    const file = {
        current: {
            files: [
                'file',
            ],
        },
    };

    expect(getFileFromInputRef(file)).toEqual('file');
});

it('gets null from an empty file input ref', () => {
    const file = undefined;

    expect(getFileFromInputRef(file)).toEqual(null);
});

it('gets the filename from a file input ref', () => {
    const file = {
        current: {
            files: [
                {
                    name: 'file',
                },
            ],
        },
    };

    expect(getFileNameFromInputRef(file))
        .toEqual('file');
});

it('gets an empty string for the filename from an empty file input ref', () => {
    const file = undefined;

    expect(getFileNameFromInputRef(file))
        .toEqual('');
});

it('creates a list of error messages if any required signup fields are missing', () => {
    const incompleteForm = mapValues(registrationFieldsEnum, '');

    const expectedErrorMessageCount = registrationFormFields
        .filter(({ required }) => required)
        .filter(({ id }) => id !== registrationFieldsEnum.otherContributorType)
        .length;

    expect(createSignupErrorMessages(incompleteForm).length)
        .toEqual(expectedErrorMessageCount);
});

it('creates zero error messages if all required signup fields are present', () => {
    const completeForm = registrationFieldsEnum;

    expect(createSignupErrorMessages(completeForm).length)
        .toEqual(0);
});

it('creates an error message for missing otherContributorType field when it is required', () => {
    const completeForm = Object.assign({}, registrationFieldsEnum, {
        [registrationFieldsEnum.contributorType]: OTHER,
        [registrationFieldsEnum.otherContributorType]: '',
    });

    expect(createSignupErrorMessages(completeForm).length)
        .toEqual(1);
});

it('creates no error message for missing otherContributorType field when present', () => {
    const completeForm = Object.assign({}, registrationFieldsEnum, {
        [registrationFieldsEnum.contributorType]: OTHER,
        [registrationFieldsEnum.otherContributorType]: 'other contributor type',
    });

    expect(createSignupErrorMessages(completeForm).length)
        .toEqual(0);
});

it('correctly reformats data to send to Django from the signup form state', () => {
    // drop `confirmPassword` since it's sent as `password` to Django
    const {
        confirmPassword,
        ...completeForm
    } = registrationFieldsEnum;

    const requestData = createSignupRequestData(completeForm);

    registrationFormFields.forEach(({ id, modelFieldName }) =>
        expect(requestData[modelFieldName]).toEqual(completeForm[id]));
});

it('creates a list of field errors from a Django error object', () => {
    const djangoErrors = {
        email: [
            'this email is already used',
        ],
        name: [
            'this name has too few characters',
            'this name has too few vowels',
        ],
    };

    const expectedErrorMessages = [
        'email: this email is already used',
        'name: this name has too few characters',
        'name: this name has too few vowels',
    ];

    const errorMessages = createErrorListFromResponseObject(djangoErrors);

    expect(errorMessages).toEqual(expectedErrorMessages);
});

it('correctly maps a list of Choice tuples from Django into an array of select options', () => {
    const expectedOptions = [
        {
            value: 'one',
            label: 'one',
        },
        {
            value: 'two',
            label: 'two',
        },
    ];

    const mockChoices = [['one', 'one'], ['two', 'two']];

    const optionsFromChoices = mapDjangoChoiceTuplesToSelectOptions(mockChoices);

    expect(isEqual(expectedOptions, optionsFromChoices)).toBe(true);
});

it('correctly checks whether an array of arrays contains only empty arrays', () => {
    const fourEmptyLists = [[], [], [], []];
    const zeroEmptyLists = [];
    const oneEmptyList = [[]];

    expect(allListsAreEmpty(...fourEmptyLists)).toBe(true);
    expect(allListsAreEmpty(...zeroEmptyLists)).toBe(true);
    expect(allListsAreEmpty(...oneEmptyList)).toBe(true);

    const oneNonEmptyList = [['hello']];
    const threeEmptyListsOneNonEmptyList = [[], [], [], [{ hello: 'world' }]];
    const sixNonEmptyLists = [
        ['hello'],
        [
            { hello: 'hello' },
            { world: 'world' },
        ],
        [1, 2, 3, 4, 5],
        [isEqual],
        [new Set([1, 2, 3, 4])],
        [new Map([['hello', 'hello'], ['world', 'world']])],
    ];

    expect(allListsAreEmpty(...oneNonEmptyList)).toBe(false);
    expect(allListsAreEmpty(...threeEmptyListsOneNonEmptyList)).toBe(false);
    expect(allListsAreEmpty(...sixNonEmptyLists)).toBe(false);
});

it('creates a bounding box for an array of GeoJSON points', () => {
    const inputData = [
        turf.point([0, 1]),
        turf.point([1, 0]),
    ];

    const expectedResult = [
        0,
        0,
        1,
        1,
    ];

    expect(getBBoxForArrayOfGeoJSONPoints(inputData)).toEqual(expectedResult);
});

it('creates arguments for slicing a list of items for paginating', () => {
    const pageZero = 0;
    const pageOne = 1;
    const pageSeven = 7;
    const twentyRows = 20;
    const twentyFiveRows = 25;

    const expectedPageZeroTwentyRowsMatch = [
        0,
        20,
    ];

    expect(isEqual(
        makeSliceArgumentsForTablePagination(pageZero, twentyRows),
        expectedPageZeroTwentyRowsMatch,
    )).toBe(true);

    const expectedPageOneTwentyRowsMatch = [
        20,
        40,
    ];

    expect(isEqual(
        makeSliceArgumentsForTablePagination(pageOne, twentyRows),
        expectedPageOneTwentyRowsMatch,
    )).toBe(true);

    const expectedPageOneTwentyFiveRowsMatch = [
        25,
        50,
    ];

    expect(isEqual(
        makeSliceArgumentsForTablePagination(pageOne, twentyFiveRows),
        expectedPageOneTwentyFiveRowsMatch,
    )).toBe(true);

    const expectedPageSevenTwentyFiveRowsMatch = [
        175,
        200,
    ];

    expect(isEqual(
        makeSliceArgumentsForTablePagination(pageSeven, twentyFiveRows),
        expectedPageSevenTwentyFiveRowsMatch,
    )).toBe(true);
});

it('gets a number from a parsed querystring param or uses the default', () => {
    const defaultValue = 12345;
    const arrayOfStrings = [
        'hello',
        'world',
    ];

    expect(getNumberFromParsedQueryStringParamOrUseDefault(arrayOfStrings, defaultValue))
        .toBe(defaultValue);

    const firstNumber = 5;
    const arrayOfNumbers = [
        firstNumber,
        10,
        20,
    ];

    expect(getNumberFromParsedQueryStringParamOrUseDefault(arrayOfNumbers, defaultValue))
        .toBe(firstNumber);

    const fiveString = '5';

    expect(getNumberFromParsedQueryStringParamOrUseDefault(fiveString, defaultValue))
        .toBe(firstNumber);

    const stringValue = 'hello';
    expect(getNumberFromParsedQueryStringParamOrUseDefault(stringValue, defaultValue))
        .toBe(defaultValue);
});

it('creates a set of pagination options from a querystring', () => {
    const emptyQueryString = '';
    const expectedPaginationValuesForEmptyQueryString = {
        page: DEFAULT_PAGE,
        rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    };

    expect(isEqual(
        createPaginationOptionsFromQueryString(emptyQueryString),
        expectedPaginationValuesForEmptyQueryString,
    )).toBe(true);

    const pageOnlyQueryString = '?page=1000';
    const expectedValuesForPageOnlyQueryString = {
        page: 1000,
        rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    };

    expect(isEqual(
        createPaginationOptionsFromQueryString(pageOnlyQueryString),
        expectedValuesForPageOnlyQueryString,
    )).toBe(true);

    const pageRowQueryString = '?page=500&rowsPerPage=12345';
    const expectedPageRowValues = {
        page: 500,
        rowsPerPage: 12345,
    };

    expect(isEqual(
        createPaginationOptionsFromQueryString(pageRowQueryString),
        expectedPageRowValues,
    )).toBe(true);

    const complexQueryString = '?page=hello&page=world&rowsPerPage=hello';
    const expectedComplexQueryStringValues = {
        page: DEFAULT_PAGE,
        rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    };

    expect(isEqual(
        createPaginationOptionsFromQueryString(complexQueryString),
        expectedComplexQueryStringValues,
    )).toBe(true);
});

it('creates an email link for reporting a data issue for a facility with a given OAR ID', () => {
    const oarID = 'oarID';
    const expectedMatch = 'mailto:info@openapparel.org?subject=Reporting a data issue on ID oarID';

    expect(makeReportADataIssueEmailLink(oarID)).toBe(expectedMatch);
});

it('creates a geojson FeatureCollection from a single geojson Feature', () => {
    const feature = {
        id: 1,
        type: 'Feature',
        geometry: 'geometry',
        properties: {
            hello: 'world',
        },
    };

    const expectedFeatureCollection = {
        type: 'FeatureCollection',
        features: [
            {
                id: 1,
                type: 'Feature',
                geometry: 'geometry',
                properties: {
                    hello: 'world',
                },
            },
        ],
    };

    expect(isEqual(
        makeFeatureCollectionFromSingleFeature(feature),
        expectedFeatureCollection,
    )).toBe(true);
});
