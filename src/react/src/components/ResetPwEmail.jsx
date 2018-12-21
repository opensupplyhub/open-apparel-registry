import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import MaterialButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as userActions from '../actions/user';

const mapStateToProps = state => ({
    user: state.user,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(userActions, dispatch),
});

class ResetPwEmail extends Component {
    state = {
        open: false,
        email: '',
        error: false,
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    updateResetEmail = () => (event) => {
        const email = event.target.value;
        this.setState({ email });
    };

    validateEmail = () => () => {
        const validEmail = this.state.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        let error = false;
        if (!validEmail) error = true;
        this.setState({ error });
    };

    sendEmail = () => {
        this.props.actions.sendUserEmail(this.state.email);
        this.handleClose();
    };

    render() {
        const { error } = this.state;
        return (
            <div>
                <div
                    role="presentation"
                    className="margin-bottom-64 link-underline cursor"
                    onClick={() => this.handleOpen()}
                >
                    Forgot your password?
                </div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
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
                            onChange={this.updateResetEmail()}
                            onBlur={this.validateEmail()}
                        />
                        {error && (
                            <div style={{ color: 'red' }}>
                                Email address is invalid.
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <MaterialButton
                            onClick={this.handleClose}
                            color="primary"
                        >
                            Cancel
                        </MaterialButton>
                        <MaterialButton
                            disabled={error}
                            onClick={this.sendEmail}
                            color="primary"
                        >
                            Send Me Instructions
                        </MaterialButton>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

ResetPwEmail.propTypes = {
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ResetPwEmail);
