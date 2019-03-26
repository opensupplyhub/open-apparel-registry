/* eslint-env jest */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable space-before-function-paren */

import {
    userHasAcceptedOrRejectedGATracking,
    userHasAcceptedGATracking,
    userHasRejectedGATracking,
    rejectGATracking,
    acceptGATrackingAndStartTracking,
    clearGATrackingDecision,
    createGADisableKey,
} from '../util/util.ga.js';

beforeEach(() => {
    const window = {};

    window.localStorage = {
        store: {},
        getItem: function(key) {
            return this.store[key] || null;
        },
        setItem: function(key, value) {
            this.store[key] = value.toString();
        },
        removeItem: function(key) {
            delete this.store[key];
        },
        clear: function() {
            this.store = {};
        },
    };

    window.ENVIRONMENT = {
        REACT_APP_GOOGLE_ANALYTICS_KEY: 'GA_KEY',
    };

    global.window = window;
    jest.spyOn(global.window.localStorage, 'setItem');
});

afterEach(() => {
    window.localStorage = null;
});

it('creates a `ga-disable-ID` key for opting out of tracking', () => {
    const expectedGADisableKey = 'ga-disable-test-key';
    const testGAKey = 'test-key';

    expect(createGADisableKey(testGAKey)).toBe(expectedGADisableKey);
});

it('correctly sets a `HAS_REJECTED_GA_TRACKING` value in localStorage', () => {
    rejectGATracking();

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(2);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('GA_TRACKING', 'HAS_REJECTED_GA_TRACKING');
    expect(window.localStorage.getItem('GA_TRACKING')).toBe('HAS_REJECTED_GA_TRACKING');

    expect(userHasAcceptedOrRejectedGATracking()).toBe(true);
    expect(userHasRejectedGATracking()).toBe(true);
    expect(userHasAcceptedGATracking()).toBe(false);
});

it('correctly sets a `HAS_ACCEPTED_GA_TRACKING` value in localStorage', () => {
    acceptGATrackingAndStartTracking();

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(2);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('GA_TRACKING', 'HAS_ACCEPTED_GA_TRACKING');
    expect(window.localStorage.getItem('GA_TRACKING')).toBe('HAS_ACCEPTED_GA_TRACKING');

    expect(userHasAcceptedOrRejectedGATracking()).toBe(true);
    expect(userHasAcceptedGATracking()).toBe(true);
    expect(userHasRejectedGATracking()).toBe(false);
});

it('correctly clears a `HAS_ACCEPTED_GA_TRACKING` decision value from localStorage', () => {
    acceptGATrackingAndStartTracking();

    expect(userHasAcceptedGATracking()).toBe(true);

    jest.spyOn(window.localStorage, 'removeItem');
    clearGATrackingDecision();

    expect(window.localStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('GA_TRACKING');

    expect(userHasAcceptedGATracking()).toBe(false);
    expect(userHasAcceptedOrRejectedGATracking()).toBe(false);
});
