import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import {
    logErrorAndDispatchFailure,
    makeDashboardApiBlocksURL,
    makeDashboardApiBlockURL,
} from '../util/util';

export const startFetchDashboardApiBlocks = createAction('START_FETCH_DASHBOARD_API_BLOCKS');
export const failFetchDashboardApiBlocks = createAction('FAIL_FETCH_DASHBOARD_API_BLOCKS');
export const completeFetchDashboardApiBlocks = createAction('COMPLETE_FETCH_DASHBOARD_API_BLOCKS');

export function fetchDashboardApiBlocks() {
    return (dispatch) => {
        dispatch(startFetchDashboardApiBlocks());

        return apiRequest
            .get(makeDashboardApiBlocksURL())
            .then(({ data }) => dispatch(completeFetchDashboardApiBlocks(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching API blocks',
                        failFetchDashboardApiBlocks,
                    ),
                ));
    };
}

export const startFetchDashboardApiBlock = createAction('START_FETCH_DASHBOARD_API_BLOCK');
export const failFetchDashboardApiBlock = createAction('FAIL_FETCH_DASHBOARD_API_BLOCK');
export const completeFetchDashboardApiBlock = createAction('COMPLETE_FETCH_DASHBOARD_API_BLOCK');

export function fetchDashboardApiBlock(blockID) {
    return (dispatch) => {
        dispatch(startFetchDashboardApiBlock());

        return apiRequest
            .get(makeDashboardApiBlockURL(blockID))
            .then(({ data }) => dispatch(completeFetchDashboardApiBlock(data)))
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented fetching the API block',
                        failFetchDashboardApiBlock,
                    ),
                ));
    };
}

export const startUpdateDashboardApiBlock = createAction('START_UPDATE_API_BLOCK');
export const failUpdateDashboardApiBlock = createAction('FAIL_UPDATE_API_BLOCK');
export const completeUpdateDashboardApiBlock = createAction('COMPLETE_UPDATE_API_BLOCK');

export function updateDashboardApiBlock({ graceLimit, graceReason }) {
    return (dispatch, getState) => {
        dispatch(startUpdateDashboardApiBlock());

        const {
            dashboardApiBlocks: { apiBlock },
        } = getState();

        const block = { ...apiBlock.data, grace_limit: graceLimit, grace_reason: graceReason };

        if (block.grace_limit <= block.limit || block.grace_limit <= block.actual) {
            return dispatch(
                failUpdateDashboardApiBlock([
                    'Grace limit must be higher than request limit and actual count',
                ]),
            );
        }

        return apiRequest
            .put(makeDashboardApiBlockURL(block.id), block)
            .then(({ data }) => dispatch(completeUpdateDashboardApiBlock(data)))
            .catch(e =>
                dispatch(
                    logErrorAndDispatchFailure(
                        e,
                        'An error prevented signing up',
                        failUpdateDashboardApiBlock,
                    ),
                ));
    };
}
