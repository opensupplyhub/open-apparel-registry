import React, { useState } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import get from 'lodash/get';
import includes from 'lodash/includes';

import {
    approveFacilityClaim,
    denyFacilityClaim,
    revokeFacilityClaim,
} from '../actions/claimFacilityDashboard';

import { facilityClaimStatusChoicesEnum } from '../util/constants';

import { getValueFromEvent } from '../util/util';

import { facilityClaimPropType } from '../util/propTypes';

const dialogTypesEnum = Object.freeze({
    APPROVE: 'APPROVE',
    DENY: 'DENY',
    REVOKE: 'REVOKE',
});

const dashboardClaimsControlsStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'start',
    }),
    controlsContainerStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem 0',
    }),
    buttonStyles: Object.freeze({
        margin: '10px',
    }),
    errorSectionStyles: Object.freeze({
        color: 'red',
    }),
    statusChangeSectionStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        padding: '5px',
        width: '300px',
        height: '90px',
    }),
    titleStyles: Object.freeze({
        marginLeft: '10px',
    }),
    claimIDAndStatusStyles: Object.freeze({
        padding: '1%',
    }),
    statusLabelStyles: Object.freeze({
        padding: '1rem 0',
    }),
    dialogActionsStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: '10px',
    }),
    dialogContainerStyles: Object.freeze({
        padding: '10px',
    }),
    dialogTextFieldStyles: Object.freeze({
        width: '100%',
        marginTop: '10px',
    }),
});

function DashboardClaimsDetailsControls({
    data: {
        id: claimID,
        status,
    },
    fetching,
    error,
    approveClaim,
    denyClaim,
    revokeClaim,
}) {
    const [statusChangeText, setStatusChangeText] = useState('');
    const [displayedDialogType, setDisplayedDialogType] = useState(null);

    const openApproveDialog = () => setDisplayedDialogType(dialogTypesEnum.APPROVE);
    const openDenyDialog = () => setDisplayedDialogType(dialogTypesEnum.DENY);
    const openRevokeDialog = () => setDisplayedDialogType(dialogTypesEnum.REVOKE);

    const closeDialog = () => {
        setDisplayedDialogType(null);
        setStatusChangeText('');
    };

    const handleUpdateStatusChangeText = e => setStatusChangeText(getValueFromEvent(e));

    const handleApproveClaim = () => {
        approveClaim(statusChangeText);
        closeDialog();
    };

    const handleDenyClaim = () => {
        denyClaim(statusChangeText);
        closeDialog();
    };

    const handleRevokeClaim = () => {
        revokeClaim(statusChangeText);
        closeDialog();
    };

    const controlsSection = (() => {
        if (fetching) {
            return <CircularProgress />;
        }

        if (status === facilityClaimStatusChoicesEnum.PENDING) {
            return (
                <>
                    <Button
                        onClick={openApproveDialog}
                        variant="contained"
                        color="primary"
                        style={dashboardClaimsControlsStyles.buttonStyles}
                    >
                        Approve Claim
                    </Button>
                    <Button
                        onClick={openDenyDialog}
                        variant="contained"
                        color="secondary"
                        style={dashboardClaimsControlsStyles.buttonStyles}
                    >
                        Deny Claim
                    </Button>
                </>
            );
        }

        if (status === facilityClaimStatusChoicesEnum.APPROVED) {
            return (
                <Button
                    onClick={openRevokeDialog}
                    variant="contained"
                    color="secondary"
                    style={dashboardClaimsControlsStyles.buttonStyles}
                >
                    Revoke Claim
                </Button>
            );
        }

        return <div />;
    })();

    const errorSection = error && (
        <Typography
            variant="body1"
            style={dashboardClaimsControlsStyles.errorSectionStyles}
        >
            An error prevented updating the facility claim status
        </Typography>
    );

    const dialogContentData = get(Object.freeze({
        [dialogTypesEnum.APPROVE]: Object.freeze({
            title: 'Approve this facility claim?',
            action: handleApproveClaim,
            actionTerm: 'approve',
        }),
        [dialogTypesEnum.DENY]: Object.freeze({
            title: 'Deny this facility claim?',
            action: handleDenyClaim,
            actionTerm: 'deny',
        }),
        [dialogTypesEnum.REVOKE]: Object.freeze({
            title: 'Revoke this facility claim?',
            action: handleRevokeClaim,
            actionTerm: 'revoke',
        }),
    }), displayedDialogType, null);

    const isPendingOrApproved = includes([
        facilityClaimStatusChoicesEnum.PENDING,
        facilityClaimStatusChoicesEnum.APPROVED,
    ], status);

    return (
        <div style={dashboardClaimsControlsStyles.containerStyles}>
            <div style={dashboardClaimsControlsStyles.claimIDAndStatusStyles}>
                <Typography variant="title">
                    Facility Claim ID {claimID}
                </Typography>
                <Typography
                    variant="display1"
                    style={dashboardClaimsControlsStyles.statusLabelStyles}
                >
                    {status}
                </Typography>
            </div>
            {
                isPendingOrApproved && (
                    <div style={dashboardClaimsControlsStyles.statusChangeSectionStyles}>
                        <Typography
                            variant="title"
                            style={dashboardClaimsControlsStyles.titleStyles}
                        >
                            Update Status
                        </Typography>
                        {errorSection}
                        <div style={dashboardClaimsControlsStyles.controlsContainerStyles}>
                            {controlsSection}
                        </div>
                    </div>
                )
            }
            <Dialog
                open={displayedDialogType || false}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={dashboardClaimsControlsStyles.dialogContainerStyles}
            >
                {
                    dialogContentData
                        ? (
                            <>
                                <DialogTitle>
                                    {dialogContentData.title}
                                </DialogTitle>
                                <DialogContent>
                                    <InputLabel htmlFor="dialog-text-field">
                                        <Typography variant="body2">
                                            Enter a reason. (This will be emailed to
                                            the person who submitted the facility claim.)
                                        </Typography>
                                    </InputLabel>
                                    <TextField
                                        id="dialog-text-field"
                                        variant="outlined"
                                        value={statusChangeText}
                                        onChange={handleUpdateStatusChangeText}
                                        autoFocus
                                        multiline
                                        rows={4}
                                        style={dashboardClaimsControlsStyles.dialogTextFieldStyles}
                                    />
                                </DialogContent>
                                <DialogActions
                                    style={dashboardClaimsControlsStyles.dialogActionsStyles}
                                >
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={closeDialog}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={dialogContentData.action}
                                    >
                                        {dialogContentData.actionTerm}
                                    </Button>
                                </DialogActions>
                            </>
                        )
                        : <div style={{ display: 'none' }} />
                }
            </Dialog>
        </div>
    );
}

DashboardClaimsDetailsControls.defaultProps = {
    error: null,
};

DashboardClaimsDetailsControls.propTypes = {
    data: facilityClaimPropType.isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string),
    approveClaim: func.isRequired,
    denyClaim: func.isRequired,
    revokeClaim: func.isRequired,
};

function mapStateToProps({
    claimFacilityDashboard: {
        statusControls: {
            fetching,
            error,
        },
    },
}) {
    return {
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch, {
    data: {
        id,
    },
}) {
    return {
        approveClaim: reason => dispatch(approveFacilityClaim(id, reason)),
        denyClaim: reason => dispatch(denyFacilityClaim(id, reason)),
        revokeClaim: reason => dispatch(revokeFacilityClaim(id, reason)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardClaimsDetailsControls);
