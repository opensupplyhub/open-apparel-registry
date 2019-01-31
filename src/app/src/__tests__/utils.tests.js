/* eslint-env jest */

const mapValues = require('lodash/mapValues');
const isEqual = require('lodash/isEqual');

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
    getValueFromEvent,
    getCheckedFromEvent,
    getFileFromInputRef,
    getFileNameFromInputRef,
    createSignupErrorMessages,
    createSignupRequestData,
    createErrorListFromResponseObject,
    mapDjangoChoiceTuplesToSelectOptions,
    allListsAreEmpty,
} = require('../util/util');

const {
    registrationFieldsEnum,
    registrationFormFields,
} = require('../util/constants');

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
            { value: 'foo' },
            { value: 'bar' },
            { value: 'baz' },
        ],
        contributorTypes: [],
        countries: [
            { value: 'country' },
        ],
    };
    const expectedMultipleFilterSelectionsMatch =
        'contributors=foo&contributors=bar&contributors=baz&countries=country';
    expect(createQueryStringFromSearchFilters(multipleFilterSelections))
        .toEqual(expectedMultipleFilterSelectionsMatch);

    const allFilters = {
        facilityName: 'hello',
        contributors: [
            { value: 'hello' },
            { value: 'world' },
        ],
        contributorTypes: [
            { value: 'foo' },
        ],
        countries: [
            { value: 'bar' },
        ],
    };

    const expectedAllFiltersMatch =
        'name=hello&contributors=hello&contributors=world'
            .concat('&contributor_types=foo&countries=bar');

    expect(createQueryStringFromSearchFilters(allFilters))
        .toEqual(expectedAllFiltersMatch);
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
        .length;

    expect(createSignupErrorMessages(incompleteForm).length)
        .toEqual(expectedErrorMessageCount);
});

it('creates zero error messages if all required signup fields are present', () => {
    const completeForm = registrationFieldsEnum;

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
