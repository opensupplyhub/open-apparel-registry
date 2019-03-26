import env from './env';

const REACT_APP_GOOGLE_ANALYTICS_KEY = 'REACT_APP_GOOGLE_ANALYTICS_KEY';

export const GA_TRACKING = 'GA_TRACKING';
export const HAS_ACCEPTED_GA_TRACKING = 'HAS_ACCEPTED_GA_TRACKING';
export const HAS_REJECTED_GA_TRACKING = 'HAS_REJECTED_GA_TRACKING';

export const userHasAcceptedOrRejectedGATracking = () =>
    Boolean(localStorage.getItem(GA_TRACKING));

export const userHasAcceptedGATracking = () =>
    localStorage.getItem(GA_TRACKING) === HAS_ACCEPTED_GA_TRACKING;

export const userHasRejectedGATracking = () =>
    localStorage.getItem(GA_TRACKING) === HAS_REJECTED_GA_TRACKING;

export const rejectGATracking = () => {
    localStorage.setItem(GA_TRACKING, HAS_REJECTED_GA_TRACKING);
};

export const enableGATracking = () => {
    const gaKey = env(REACT_APP_GOOGLE_ANALYTICS_KEY);

    if (gaKey) {
        const disableKey = `ga-disable-${gaKey}`;
        window[disableKey] = false;
    }

    if (window.ga) {
        window.ga('send', 'pageview');
    }
};

export const acceptGATracking = () => {
    // If user has already rejected GA tracking, this is a noop
    if (!userHasRejectedGATracking()) {
        localStorage.setItem(GA_TRACKING, HAS_ACCEPTED_GA_TRACKING);
        enableGATracking();
    }
};

export const clearGATrackingDecision = () => {
    localStorage.removeItem(GA_TRACKING);
};
