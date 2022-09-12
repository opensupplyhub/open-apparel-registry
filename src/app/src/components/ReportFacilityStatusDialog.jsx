import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import DashboardActivityReportToast from './DashboardActivityReportToast';

import {
    createDashboardActivityReport,
    resetDashbooardActivityReports,
} from '../actions/dashboardActivityReports';

import { facilityDetailsPropType } from '../util/propTypes';
import { authLoginFormRoute } from '../util/constants';

const styles = theme =>
    Object.freeze({
        linkStyle: Object.freeze({
            display: 'inline-block',
            fontSize: '16px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: theme.typography.fontFamily,
        }),
        facilityName: Object.freeze({
            padding: '5px 0 15px',
        }),
        description: Object.freeze({
            fontWeight: 'bold',
            color: 'rgb(27, 27, 26)',
            fontSize: '16px',
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
            minWidth: '300px',
        }),
    });

function ReportFacilityStatusDialog({
    data,
    user,
    dashboardActivityReports: { activityReports },
    submitReport,
    resetReports,
    setShowDialog,
    showDialog,
    classes,
}) {
    const [reasonForReport, setReportReason] = useState('');

    const closeDialog = () => {
        setShowDialog(false);
        setReportReason('');
    };

    const handleSubmit = () => {
        if (!reasonForReport.length) return;
        const closureState = data.properties.is_closed ? 'OPEN' : 'CLOSED';
        submitReport({ id: data.id, reasonForReport, closureState });
        closeDialog();
    };

    const loginButton = (
        <Button
            variant="contained"
            color="primary"
            onClick={closeDialog}
            component={Link}
            to={authLoginFormRoute}
        >
            Log In
        </Button>
    );

    const dialog = (
        <Dialog
            open={showDialog}
            onClose={closeDialog}
            aria-labelledby="status-dialogue"
            aria-describedby="status-dialog-description"
            className={classes.dialogContainerStyles}
        >
            <DialogTitle id="status-dialog-title">
                {`Report facility ${
                    data.properties.is_closed ? 'reopened' : 'closed'
                }`}
                <Typography className={classes.facilityName}>
                    {data.properties.name}
                </Typography>
                <Divider />
            </DialogTitle>
            {!user ? (
                <DialogContent>
                    <DialogContentText
                        id="status-dialog-description"
                        className={classes.description}
                    >
                        {`You must be logged in to report this facility as ${
                            data.properties.is_closed ? 'reopened' : 'closed'
                        }`}
                    </DialogContentText>
                </DialogContent>
            ) : (
                <DialogContent>
                    <DialogContentText
                        id="status-dialog-description"
                        className={classes.description}
                    >
                        Please provide information the OS Hub team can use to
                        verify this status change. Should you need to share or
                        attach a document or screenshot, please email it to{' '}
                        <a href="mailto:info@openapparel.org">
                            info@openapparel.org
                        </a>{' '}
                        after completing this form.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="report-reason"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={reasonForReport}
                        className={classes.dialogTextFieldStyles}
                        onChange={e => setReportReason(e.target.value)}
                    />
                </DialogContent>
            )}
            {!user ? (
                <DialogActions className={classes.dialogActionsStyles}>
                    {loginButton}
                </DialogActions>
            ) : (
                <DialogActions className={classes.dialogActionsStyles}>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                    >
                        Report
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );

    return (
        <div>
            {dialog}
            <DashboardActivityReportToast
                {...activityReports}
                resetReports={resetReports}
            />
        </div>
    );
}

ReportFacilityStatusDialog.propTypes = {
    data: facilityDetailsPropType.isRequired,
};

function mapStateToProps({
    dashboardActivityReports,
    facilities: {
        singleFacility: { data },
    },
    auth: {
        user: { user },
    },
}) {
    return { dashboardActivityReports, user, data };
}

function mapDispatchToProps(dispatch) {
    return {
        submitReport: data => dispatch(createDashboardActivityReport(data)),
        resetReports: () => dispatch(resetDashbooardActivityReports()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(styles)(ReportFacilityStatusDialog));
