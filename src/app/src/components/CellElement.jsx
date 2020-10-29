import React, { Component } from 'react';
import { bool, func, number, oneOf, oneOfType, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import isObject from 'lodash/isObject';

import { facilityMatchStatusChoicesEnum } from '../util/constants';

import { confirmRejectMatchRowStyles } from '../util/styles';

const confirmRejectDialogStates = Object.freeze({
    none: 'none',
    confirm: 'confirm',
    reject: 'reject',
});

export default class CellElement extends Component {
    state = {
        currentDialog: confirmRejectDialogStates.none,
    };

    openConfirmDialog = () =>
        this.setState(state => Object.assign({}, state, {
            currentDialog: confirmRejectDialogStates.confirm,
        }));

    openRejectDialog = () =>
        this.setState(state => Object.assign({}, state, {
            currentDialog: confirmRejectDialogStates.reject,
        }));

    closeDialog = () =>
        this.setState(state => Object.assign({}, state, {
            currentDialog: confirmRejectDialogStates.none,
        }));

    confirmFacilityMatch = () => {
        const {
            item,
        } = this.props;

        if (isObject(item) && item.confirmMatch) {
            item.confirmMatch();
        }

        return this.closeDialog();
    };

    rejectFacilityMatch = () => {
        const {
            item,
        } = this.props;

        if (isObject(item) && item.rejectMatch) {
            item.rejectMatch();
        }

        return this.closeDialog();
    };

    render() {
        const {
            item,
            fetching,
            errorState,
            hasActions,
            stringIsHidden,
            linkURL,
        } = this.props;

        if (!hasActions) {
            const insetComponent = (() => {
                if (stringIsHidden) {
                    return ' ';
                }

                if (linkURL) {
                    return (
                        <Link
                            to={linkURL}
                            href={linkURL}
                        >
                            {item}
                        </Link>
                    );
                }

                return item;
            })();

            return (
                <div
                    key={item}
                    style={
                        errorState
                            ? confirmRejectMatchRowStyles.errorCellRowStyles
                            : null
                    }
                >
                    {insetComponent}
                </div>
            );
        }

        if (item.status !== facilityMatchStatusChoicesEnum.PENDING) {
            return (
                <div
                    key={item.id}
                    style={confirmRejectMatchRowStyles.cellRowStyles}
                >
                    <div style={confirmRejectMatchRowStyles.cellActionStyles}>
                        <div>
                            {item.status}
                        </div>
                    </div>
                </div>
            );
        }

        const confirmDialog = (
            <Dialog
                open={this.state.currentDialog === confirmRejectDialogStates.confirm}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm this potential facility match?
                </DialogTitle>
                <DialogContent id="alert-dialog-description">
                    <h3>
                        This action will confirm this facility as a match for the list item.
                    </h3>
                    <p>
                        <strong>
                            Potential match:
                        </strong>
                    </p>
                    <ul>
                        <li>
                            name: {item.matchName}
                        </li>
                        <li>
                            address: {item.matchAddress}
                        </li>
                    </ul>
                    <p>
                        <strong>
                            List item:
                        </strong>
                    </p>
                    <ul>
                        <li>
                            name: {item.itemName}
                        </li>
                        <li>
                            address: {item.itemAddress}
                        </li>
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={this.closeDialog}
                    >
                        No, do not confirm
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.confirmFacilityMatch}
                    >
                        Yes, confirm
                    </Button>
                </DialogActions>
            </Dialog>
        );

        const rejectDialog = (
            <Dialog
                open={this.state.currentDialog === confirmRejectDialogStates.reject}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Reject this potential facility match?
                </DialogTitle>
                <DialogContent id="alert-dialog-description">
                    <h3>
                        This action will reject the facility as a potential match.
                    </h3>
                    <p>
                        <strong>
                            Potential match:
                        </strong>
                    </p>
                    <ul>
                        <li>
                            name: {item.matchName}
                        </li>
                        <li>
                            address: {item.matchAddress}
                        </li>
                    </ul>
                    <p>
                        <strong>
                            List item:
                        </strong>
                    </p>
                    <ul>
                        <li>
                            name: {item.itemName}
                        </li>
                        <li>
                            address: {item.itemAddress}
                        </li>
                    </ul>
                    <p>
                        If no other potential matches remain, this will
                        create a new facility.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={this.closeDialog}
                    >
                        No, do not reject
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={this.rejectFacilityMatch}
                    >
                        Yes, reject
                    </Button>
                </DialogActions>
            </Dialog>
        );

        return (
            <div
                key={item.id}
                style={confirmRejectMatchRowStyles.cellRowStyles}
                className="STATUS_POTENTIAL_MATCH--ACTIONS"
            >
                <div style={confirmRejectMatchRowStyles.cellActionStyles}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.openConfirmDialog}
                        disabled={fetching}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={this.openRejectDialog}
                        disabled={fetching}
                    >
                        Reject
                    </Button>
                    {confirmDialog}
                    {rejectDialog}
                </div>
            </div>
        );
    }
}

CellElement.defaultProps = {
    fetching: false,
    errorState: false,
    hasActions: false,
    stringIsHidden: false,
    linkURL: null,
};

CellElement.propTypes = {
    item: oneOfType([
        number,
        string,
        shape({
            id: number.isRequired,
            confirmMatch: func.isRequired,
            rejectMatch: func.isRequired,
            status: oneOf(Object.values(facilityMatchStatusChoicesEnum)).isRequired,
            matchName: string.isRequird,
            matchAddress: string.isRequired,
            itemName: string.isRequired,
            itemAddress: string.isRequired,
        }),
    ]).isRequired,
    fetching: bool,
    errorState: bool,
    hasActions: bool,
    stringIsHidden: bool,
    linkURL: string,
};
