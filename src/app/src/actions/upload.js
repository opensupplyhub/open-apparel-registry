import { createAction } from 'redux-act';

import { logErrorAndDispatchFailure } from '../util/util';

export const updateFileUploadName = createAction('UPDATE_FILE_UPLOAD_NAME');
export const updateFileUploadDescription = createAction('UPDATE_FILE_UPLOAD_DESCRIPTION');
export const updateFileUploadFileName = createAction('UPDATE_FILE_UPLOAD_FILE_NAME');

export const startUploadFile = createAction('START_UPLOAD_FILE');
export const failUploadFile = createAction('FAIL_UPLOAD_FILE');
export const completeUploadFile = createAction('COMPLETE_UPLOAD_FILE');

export const resetUploadState = createAction('RESET_UPLOAD_STATE');

export function uploadFile(file) {
    return (dispatch, getState) => {
        dispatch(startUploadFile());

        const {
            upload: {
                form: {
                    name,
                    description,
                },
            },
        } = getState();

        window.console.dir(name, description, file);

        // Validate that name does not have any special char:
        //
        // e.g.
        //
        // {ifHasSpecialChar && (
        //         <p className="form__error">
        //         Use only letters (a-z, A-Z) and numbers (0-9).
        //         </p>
        // )}

        return Promise
            .resolve()
            .then(() => dispatch(completeUploadFile()))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented uploading that file',
                failUploadFile,
            )));
    };
}
