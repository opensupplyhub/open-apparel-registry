import { createAction } from 'redux-act';

import apiRequest from '../util/apiRequest';

import { logErrorAndDispatchFailure, makeFacilityListsURL } from '../util/util';

import { contributeReplacesNoneSelectionID } from '../util/constants';

export const updateFileUploadName = createAction('UPDATE_FILE_UPLOAD_NAME');
export const updateFileUploadDescription = createAction(
    'UPDATE_FILE_UPLOAD_DESCRIPTION',
);
export const updateFileUploadFileName = createAction(
    'UPDATE_FILE_UPLOAD_FILE_NAME',
);
export const updateFileUploadListToReplaceID = createAction(
    'UPDATE_FILE_UPLOAD_LIST_TO_REPLACE_ID',
);

export const startUploadFile = createAction('START_UPLOAD_FILE');
export const failUploadFile = createAction('FAIL_UPLOAD_FILE');
export const completeUploadFile = createAction('COMPLETE_UPLOAD_FILE');

export const resetUploadState = createAction('RESET_UPLOAD_STATE');

export function uploadFile(file = null, redirectToListDetail) {
    return (dispatch, getState) => {
        dispatch(startUploadFile());

        const {
            upload: {
                form: { name, description, replaces },
            },
        } = getState();

        if (!file) {
            return dispatch(
                logErrorAndDispatchFailure(
                    null,
                    'Missing required facility list file',
                    failUploadFile,
                ),
            );
        }

        const formData = new FormData();
        formData.append('file', file);

        if (name) {
            formData.append('name', name);
        }

        if (description) {
            formData.append('description', description);
        }

        if (replaces !== contributeReplacesNoneSelectionID) {
            formData.append('replaces', replaces);
        }

        return apiRequest
            .post(makeFacilityListsURL(), formData)
            .then(({ data: { id } }) => {
                dispatch(completeUploadFile());
                redirectToListDetail(id);
            })
            .catch(err =>
                dispatch(
                    logErrorAndDispatchFailure(
                        err,
                        'An error prevented uploading that file',
                        failUploadFile,
                    ),
                ),
            );
    };
}
