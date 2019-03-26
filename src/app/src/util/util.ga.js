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

export const acceptGATracking = () => {
    // If user has already rejected GA tracking, this is a noop
    if (!userHasRejectedGATracking()) {
        localStorage.setItem(GA_TRACKING, HAS_ACCEPTED_GA_TRACKING);
    }
};

export const clearGATrackingDecision = () => {
    localStorage.removeItem(GA_TRACKING);
};
