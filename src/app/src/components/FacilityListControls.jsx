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
import DialogContentText from '@material-ui/core/DialogContentText';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

import { facilityListStatusChoicesEnum } from '../util/constants';

import { getValueFromEvent } from '../util/util';
import {
    approveFacilityList,
    rejectFacilityList,
} from '../actions/facilityListDetails';

const dialogTypesEnum = Object.freeze({ REJECT: 'REJECT', INFORM: 'INFORM' });

const facilityListControlStyles = Object.freeze({
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
    listIDAndStatusStyles: Object.freeze({
        padding: '1%',
    }),
    statusLabelStyles: Object.freeze({
        padding: '1rem 0',
        display: 'flex',
        alignItems: 'center',
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

function FacilityListControls({
    status,
    statusChangeReason,
    fetching,
    error,
    approveList,
    rejectList,
    isAdminUser,
}) {
    const [statusChangeText, setStatusChangeText] = useState('');
    const [displayedDialogType, setDisplayedDialogType] = useState(null);

    const openRejectDialog = () =>
        setDisplayedDialogType(dialogTypesEnum.REJECT);
    const openInformationDialog = () =>
        setDisplayedDialogType(dialogTypesEnum.INFORM);

    const closeDialog = () => {
        setDisplayedDialogType(null);
        setStatusChangeText('');
    };

    const handleUpdateStatusChangeText = e =>
        setStatusChangeText(getValueFromEvent(e));

    const handleApproveList = () => {
        approveList(statusChangeText);
        closeDialog();
    };

    const handleRejectList = () => {
        rejectList(statusChangeText);
        closeDialog();
    };

    const controlsSection = (() => {
        if (fetching) {
            return <CircularProgress />;
        }

        if (status === facilityListStatusChoicesEnum.PENDING && isAdminUser) {
            return (
                <>
                    <Button
                        onClick={handleApproveList}
                        variant="contained"
                        color="primary"
                        style={facilityListControlStyles.buttonStyles}
                    >
                        Approve List
                    </Button>
                    <Button
                        onClick={openRejectDialog}
                        variant="contained"
                        color="secondary"
                        style={facilityListControlStyles.buttonStyles}
                    >
                        Reject List
                    </Button>
                </>
            );
        }

        return <div />;
    })();

    const errorSection = error && (
        <Typography
            variant="body1"
            style={facilityListControlStyles.errorSectionStyles}
        >
            An error prevented updating the facility list status
        </Typography>
    );

    return (
        <div style={facilityListControlStyles.containerStyles}>
            <div style={facilityListControlStyles.listIDAndStatusStyles}>
                <Typography variant="title">List Status</Typography>
                <Typography
                    variant="display1"
                    style={facilityListControlStyles.statusLabelStyles}
                >
                    {status}{' '}
                    {status === facilityListStatusChoicesEnum.REJECTED && (
                        <Button
                            onClick={openInformationDialog}
                            variant="outlined"
                            color="primary"
                            style={facilityListControlStyles.buttonStyles}
                        >
                            More information
                        </Button>
                    )}
                </Typography>
            </div>
            {status === facilityListStatusChoicesEnum.PENDING && isAdminUser && (
                <div
                    style={facilityListControlStyles.statusChangeSectionStyles}
                >
                    <Typography
                        variant="title"
                        style={facilityListControlStyles.titleStyles}
                    >
                        Update Status
                    </Typography>
                    {errorSection}
                    <div
                        style={
                            facilityListControlStyles.controlsContainerStyles
                        }
                    >
                        {controlsSection}
                    </div>
                </div>
            )}
            <Dialog
                open={!!displayedDialogType || false}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={facilityListControlStyles.dialogContainerStyles}
            >
                {displayedDialogType === dialogTypesEnum.REJECT && (
                    <>
                        <DialogTitle>Reject this facility list?</DialogTitle>
                        <DialogContent>
                            <InputLabel htmlFor="dialog-text-field">
                                <Typography variant="body2">
                                    Enter a reason. (This will be emailed to the
                                    person who submitted the facility list.)
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
                                style={
                                    facilityListControlStyles.dialogTextFieldStyles
                                }
                            />
                        </DialogContent>
                        <DialogActions
                            style={
                                facilityListControlStyles.dialogActionsStyles
                            }
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
                                onClick={handleRejectList}
                            >
                                Reject
                            </Button>
                        </DialogActions>
                    </>
                )}
                {displayedDialogType === dialogTypesEnum.INFORM && (
                    <>
                        <DialogTitle>Reason for status</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {statusChangeReason}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions
                            style={
                                facilityListControlStyles.dialogActionsStyles
                            }
                        >
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={closeDialog}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
}

FacilityListControls.defaultProps = {
    error: null,
    isAdminUser: false,
};

FacilityListControls.propTypes = {
    status: string.isRequired,
    statusChangeReason: string.isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string),
    approveList: func.isRequired,
    rejectList: func.isRequired,
    isAdminUser: bool,
};

function mapStateToProps({
    facilityListDetails: {
        list: { data, fetching, error },
    },
}) {
    return {
        fetching,
        error,
        status: data?.status,
        statusChangeReason: data?.status_change_reason,
    };
}

function mapDispatchToProps(dispatch, { id }) {
    return {
        approveList: () => dispatch(approveFacilityList(id)),
        rejectList: reason => dispatch(rejectFacilityList(id, reason)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(FacilityListControls);
