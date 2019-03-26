/* eslint-env jest */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable space-before-function-paren */

import {
    userHasAcceptedOrRejectedGATracking,
    userHasAcceptedGATracking,
    userHasRejectedGATracking,
    rejectGATracking,
    acceptGATracking,
    clearGATrackingDecision,
} from '../util/util.ga.js';

beforeEach(() => {
    const localStorageMock = {
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

    global.localStorage = localStorageMock;
    jest.spyOn(global.localStorage, 'setItem');
});

afterEach(() => {
    global.localStorage = null;
});

it('correctly sets a `HAS_REJECTED_GA_TRACKING` value in localStorage', () => {
    rejectGATracking();

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith('GA_TRACKING', 'HAS_REJECTED_GA_TRACKING');
    expect(localStorage.getItem('GA_TRACKING')).toBe('HAS_REJECTED_GA_TRACKING');

    expect(userHasAcceptedOrRejectedGATracking()).toBe(true);
    expect(userHasRejectedGATracking()).toBe(true);
    expect(userHasAcceptedGATracking()).toBe(false);
});

it('correctly sets a `HAS_REJECTED_GA_TRACKING` value in localStorage', () => {
    acceptGATracking();

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith('GA_TRACKING', 'HAS_ACCEPTED_GA_TRACKING');
    expect(localStorage.getItem('GA_TRACKING')).toBe('HAS_ACCEPTED_GA_TRACKING');

    expect(userHasAcceptedOrRejectedGATracking()).toBe(true);
    expect(userHasAcceptedGATracking()).toBe(true);
    expect(userHasRejectedGATracking()).toBe(false);
});

it('correctly clears a `HAS_ACCEPTED_GA_TRACKING` decision value from localStorage', () => {
    acceptGATracking();

    expect(userHasAcceptedGATracking()).toBe(true);

    jest.spyOn(global.localStorage, 'removeItem');
    clearGATrackingDecision();

    expect(localStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(localStorage.removeItem).toHaveBeenCalledWith('GA_TRACKING');

    expect(userHasAcceptedGATracking()).toBe(false);
    expect(userHasAcceptedOrRejectedGATracking()).toBe(false);
});
