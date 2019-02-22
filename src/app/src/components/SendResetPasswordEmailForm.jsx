import React from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, string } from 'prop-types';

import MaterialButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {
    updateForgotPasswordEmailAddress,
    requestForgotPasswordEmail,
    openForgotPasswordDialog,
    closeForgotPasswordDialog,
} from '../actions/auth';

import { getValueFromEvent } from '../util/util';

function SendResetPasswordEmailForm({
    dialogIsOpen,
    handleOpen,
    handleClose,
    error,
    fetching,
    email,
    updateEmail,
    submitForm,
}) {
    const errorMessages = error && error.length
        ? (
            <ul style={{ color: 'red' }}>
                {
                    error.map(err => (
                        <li key={err}>
                            {err}
                        </li>
                    ))
                }
            </ul>)
        : null;

    return (
        <div>
            <div
                role="presentation"
                className="margin-bottom-64 link-underline cursor"
                onClick={handleOpen}
            >
                Forgot your password?
            </div>
            <Dialog
                open={dialogIsOpen}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Forgot your password?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To restore your password, please enter your email
                        address here. We will send you instructions.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={updateEmail}
                    />
                    {errorMessages}
                </DialogContent>
                <DialogActions>
                    <MaterialButton
                        onClick={handleClose}
                        color="primary"
                    >
                        Cancel
                    </MaterialButton>
                    <MaterialButton
                        disabled={fetching}
                        onClick={submitForm}
                        color="primary"
                    >
                        Send Me Instructions
                    </MaterialButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}

SendResetPasswordEmailForm.defaultProps = {
    error: null,
};

SendResetPasswordEmailForm.propTypes = {
    dialogIsOpen: bool.isRequired,
    handleOpen: func.isRequired,
    handleClose: func.isRequired,
    error: arrayOf(string),
    fetching: bool.isRequired,
    updateEmail: func.isRequired,
    submitForm: func.isRequired,
    email: string.isRequired,
};

function mapStateToProps({
    auth: {
        forgotPassword: {
            form: {
                email,
            },
            dialogIsOpen,
            fetching,
            error,
        },
    },
}) {
    return {
        fetching,
        error,
        email,
        dialogIsOpen,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateEmail: e => dispatch(updateForgotPasswordEmailAddress(getValueFromEvent(e))),
        submitForm: () => dispatch(requestForgotPasswordEmail()),
        handleOpen: () => dispatch(openForgotPasswordDialog()),
        handleClose: () => dispatch(closeForgotPasswordDialog()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendResetPasswordEmailForm);
