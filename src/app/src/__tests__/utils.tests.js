/* eslint-env jest */
const {
    makeGetListsURL,
    makeUpdateListURL,
    makeConfirmTempURL,
    makeUpdateSourceNameURL,
    makeUploadTempFacilityURL,
    makeGenerateAPIKeyURL,
    makeAllSourceURL,
    makeAllCountryURL,
    makeTotalFacilityURL,
    makeSearchFacilityByNameAndCountryURL,
    getValueFromEvent,
    getCheckedFromEvent,
} = require('../util/util');

const REACT_APP_API_URL = 'REACT_APP_API_URL';
const REACT_APP_API_KEY = 'REACT_APP_API_KEY';

const setEnvironmentVariables = () =>
    Object.assign(
        process.env,
        {
            REACT_APP_API_URL,
            REACT_APP_API_KEY,
        },
    );

beforeEach(setEnvironmentVariables);

it('creates an API URL for getting lists', () => {
    const uid = 123;
    const expectedMatch = 'REACT_APP_API_URL/getLists/123/?key=REACT_APP_API_KEY';
    expect(makeGetListsURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for updating a list', () => {
    const uid = 123;
    const file = 'file';
    const expectedMatch = 'REACT_APP_API_URL/getList/123/?file_name=file&key=REACT_APP_API_KEY';
    expect(makeUpdateListURL(uid, file)).toEqual(expectedMatch);
});

it('creates an API URL for confirming temp', () => {
    const tempId = 'tempId';
    const expectedMatch = 'REACT_APP_API_URL/confirmTemp/tempId/?key=REACT_APP_API_KEY';
    expect(makeConfirmTempURL(tempId)).toEqual(expectedMatch);
});

it('creates an API URL for updating a source name', () => {
    const uid = 123;
    const expectedMatch = 'REACT_APP_API_URL/updateSourceName/123/?key=REACT_APP_API_KEY';
    expect(makeUpdateSourceNameURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for uploading facilities', () => {
    const uid = 123;
    const expectedMatch = 'REACT_APP_API_URL/uploadTempFactory/123/?key=REACT_APP_API_KEY';
    expect(makeUploadTempFacilityURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for generating an API key', () => {
    const uid = 123;
    const expectedMatch =
        'REACT_APP_API_URL/generateKey/123/?key=REACT_APP_API_KEY';

    expect(makeGenerateAPIKeyURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for getting all sources', () => {
    const expectedMatch = 'REACT_APP_API_URL/allsource/';
    expect(makeAllSourceURL()).toEqual(expectedMatch);
});

it('creates an API URL for getting all countries', () => {
    const expectedMatch = 'REACT_APP_API_URL/allcountry/';
    expect(makeAllCountryURL()).toEqual(expectedMatch);
});

it('creates an API URL for getting all facilities', () => {
    const expectedMatch = 'REACT_APP_API_URL/totalFactories/';
    expect(makeTotalFacilityURL()).toEqual(expectedMatch);
});

it('creates an API URL for searching facilities by name, country, and optional contributor', () => {
    const name = 'name';
    const country = 'country';
    const contributor = 'contributor';

    const expectedMatchWithoutContributor =
        'REACT_APP_API_URL/searchFactoryNameCountry/?name=name&country=country&contributor=';

    expect(makeSearchFacilityByNameAndCountryURL(name, country))
        .toEqual(expectedMatchWithoutContributor);

    const expectedMatchWithContributor =
        'REACT_APP_API_URL/searchFactoryNameCountry/?name=name&country=country&contributor=contributor';

    expect(makeSearchFacilityByNameAndCountryURL(name, country, contributor))
        .toEqual(expectedMatchWithContributor);
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
