import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeDashboardActivityReportsURL,
    makeRejectDashboardActivityReportURL,
    makeConfirmDashboardActivityReportURL,
    makeCreateDashboardActivityReportURL,
} from '../util/util';

export const startFetchDashboardActivityReports = createAction(
    'START_FETCH_DASHBOARD_ACTIVITY_REPORTS',
);
export const failFetchDashboardActivityReports = createAction(
    'FAIL_FETCH_DASHBOARD_ACTIVITY_REPORTS',
);
export const completeFetchDashboardActivityReports = createAction(
    'COMPLETE_FETCH_DASHBOARD_ACTIVITY_REPORTS',
);

export function fetchDashboardActivityReports() {
    return dispatch => {
        dispatch(startFetchDashboardActivityReports());

        return apiRequest
            .get(makeDashboardActivityReportsURL())
            .then(({ data }) =>
                dispatch(completeFetchDashboardActivityReports(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching facility activity reports',
                        failFetchDashboardActivityReports,
                    ),
                ),
            );
    };
}

export const startUpdateDashboardActivityReport = createAction(
    'START_UPDATE_DASHBOARD_ACTIVITY_REPORT',
);
export const failUpdateDashboardActivityReport = createAction(
    'FAIL_UPDATE_DASHBOARD_ACTIVITY_REPORT',
);
export const completeUpdateDashboardActivityReport = createAction(
    'COMPLETE_UPDATE_DASHBOARD_ACTIVITY_REPORT',
);

export function rejectDashboardActivityReport({ id, statusChangeReason }) {
    return dispatch => {
        dispatch(startUpdateDashboardActivityReport());

        return apiRequest
            .post(makeRejectDashboardActivityReportURL(id), {
                status_change_reason: statusChangeReason,
            })
            .then(({ data }) =>
                dispatch(completeUpdateDashboardActivityReport(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented rejecting a facility activity report',
                        failUpdateDashboardActivityReport,
                    ),
                ),
            );
    };
}

export function confirmDashboardActivityReport({ id, statusChangeReason }) {
    return dispatch => {
        dispatch(startUpdateDashboardActivityReport());

        return apiRequest
            .post(makeConfirmDashboardActivityReportURL(id), {
                status_change_reason: statusChangeReason,
            })
            .then(({ data }) =>
                dispatch(completeUpdateDashboardActivityReport(data)),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented confirming a facility activity report',
                        failUpdateDashboardActivityReport,
                    ),
                ),
            );
    };
}

export const startCreateDashboardActivityReport = createAction(
    'START_CREATE_DASHBOARD_ACTIVITY_REPORT',
);
export const failCreateDashboardActivityReport = createAction(
    'FAIL_CREATE_DASHBOARD_ACTIVITY_REPORT',
);
export const completeCreateDashboardActivityReport = createAction(
    'COMPLETE_CREATE_DASHBOARD_ACTIVITY_REPORT',
);

export function createDashboardActivityReport({
    id,
    reasonForReport,
    closureState,
}) {
    return dispatch => {
        dispatch(startCreateDashboardActivityReport());

        return apiRequest
            .post(makeCreateDashboardActivityReportURL(id), {
                reason_for_report: reasonForReport,
                closure_state: closureState,
            })
            .then(({ data }) =>
                dispatch(
                    completeCreateDashboardActivityReport({
                        data,
                        message: `Successfully reported facility as ${data.closure_state.toLowerCase()}.`,
                    }),
                ),
            )
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented creating a facility activity report',
                        failCreateDashboardActivityReport,
                    ),
                ),
            );
    };
}

export const resetDashbooardActivityReports = createAction(
    'RESET_DASHBOARD_ACTIVITY_REPORTS',
);
