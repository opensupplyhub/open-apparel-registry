import React, { useEffect, useState } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import InputLabel from '@material-ui/core/InputLabel';

import {
    fetchDashboardActivityReports,
    rejectDashboardActivityReport,
    confirmDashboardActivityReport,
} from '../actions/dashboardActivityReports';

import { activityReportPropType } from '../util/propTypes';
import { makeFacilityDetailLink } from '../util/util';

const styles = {
    container: {
        marginBottom: '60px',
        width: '100%',
    },
    buttonGroup: {
        minWidth: '150px',
        display: 'flex',
        alignItems: 'baseline',
    },
    button: {
        color: 'rgb(27, 27, 26)',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'underline',
        textTransform: 'capitalize',
    },
    pending: {
        color: 'rgba(27, 27, 26, 0.6)',
        fontSize: '14px',
        fontStyle: 'italic',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    confirmed: {
        color: 'rgb(3, 39, 164)',
        fontSize: '14px',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    rejected: {
        color: 'rgb(27, 27, 26)',
        fontSize: '14px',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
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
};

const CLOSURE_INDEX = 0;
const REOPEN_INDEX = 1;

const REJECT = 'REJECT';
const CONFIRM = 'CONFIRM';
const STATUS = 'STATUS';
const PENDING = 'PENDING';

const CLOSED = 'CLOSED';
const OPEN = 'OPEN';

function DashboardActivityReports({
    dashboardActivityReports: { activityReports },
    fetchActivityReports,
    rejectReport,
    confirmReport,
}) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [mode, setDialogMode] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [statusChangeReason, setStatusChangeReason] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        fetchActivityReports();
    }, [fetchActivityReports]);

    const { error } = activityReports;
    useEffect(() => {
        if (error && error.length) {
            setShowErrors(true);
        }
    }, [error]);

    const errors = (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            variant="error"
            open={showErrors}
            autoHideDuration={6000}
            onClose={() => setShowErrors(false)}
            message={error && error.map((e, i) => <span id={i}>{e}</span>)}
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={() => setShowErrors(false)}
                >
                    <CloseIcon />
                </IconButton>,
            ]}
        />
    );

    const handleTabChange = (e, tab) => setActiveTabIndex(tab);

    const reports = activityReports.data.filter(report => {
        if (activeTabIndex === CLOSURE_INDEX) {
            return report.closure_state === CLOSED;
        }
        if (activeTabIndex === REOPEN_INDEX) {
            return report.closure_state === OPEN;
        }
        return false;
    });

    const openDialog = (newMode, report) => {
        setDialogMode(newMode);
        setSelectedReport(report);
    };

    const closeDialog = () => {
        setDialogMode(null);
        setSelectedReport(null);
        setStatusChangeReason('');
    };

    const updateReport = () => {
        if (mode === REJECT) {
            rejectReport({ id: selectedReport.id, statusChangeReason });
        } else {
            confirmReport({ id: selectedReport.id, statusChangeReason });
        }
        closeDialog();
    };

    const renderStatus = report => {
        const { status } = report;
        if (status === 'PENDING') {
            return (
                <Button
                    size="small"
                    style={styles.pending}
                    onClick={() => openDialog(PENDING, report)}
                >
                    {status}
                </Button>
            );
        }
        if (status === 'CONFIRMED') {
            return (
                <Button
                    size="small"
                    style={styles.confirmed}
                    onClick={() => openDialog(STATUS, report)}
                >
                    {status}
                </Button>
            );
        }
        if (status === 'REJECTED') {
            return (
                <Button
                    size="small"
                    style={styles.rejected}
                    onClick={() => openDialog(STATUS, report)}
                >
                    {status}
                </Button>
            );
        }
        return <Typography style={styles.pending}>Invalid status</Typography>;
    };

    const statusContent = (
        <>
            <DialogTitle id="status-dialogue">
                {mode === PENDING
                    ? 'Reason for request'
                    : 'Status change reason'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="status-dialog-description">
                    {mode === STATUS &&
                        selectedReport &&
                        selectedReport.status_change_reason}
                    {mode === PENDING &&
                        selectedReport &&
                        selectedReport.reason_for_report}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog}>Close</Button>
            </DialogActions>
        </>
    );

    const formContent = (
        <>
            <DialogTitle id="status-dialog-title">
                {`${mode === REJECT ? 'Reject' : 'Confirm'} ${
                    selectedReport && selectedReport.closure_state === CLOSED
                        ? 'closure'
                        : 'reopening'
                } of facility`}
            </DialogTitle>
            <DialogContent>
                <InputLabel htmlFor="status-change-reason">
                    <Typography variant="body2">
                        Status change reason
                    </Typography>
                </InputLabel>
                <TextField
                    autoFocus
                    margin="dense"
                    id="status-change-reason"
                    variant="outlined"
                    rows={4}
                    multiline
                    value={statusChangeReason}
                    onChange={e => setStatusChangeReason(e.target.value)}
                    style={styles.dialogTextFieldStyles}
                />
            </DialogContent>
            <DialogActions style={styles.dialogActionsStyles}>
                <Button onClick={closeDialog}>Cancel</Button>
                <Button
                    onClick={updateReport}
                    color="primary"
                    variant="contained"
                >
                    {mode === REJECT ? 'Reject' : 'Confirm'}
                </Button>
            </DialogActions>
        </>
    );

    const statusDialog = (
        <Dialog
            open={!!mode}
            onClose={closeDialog}
            aria-labelledby="status-dialogue"
            aria-describedby="status-dialog-description"
            style={styles.dialogContainerStyles}
        >
            {mode === STATUS && statusContent}
            {mode === PENDING && statusContent}
            {mode === REJECT && formContent}
            {mode === CONFIRM && formContent}
        </Dialog>
    );

    return (
        <div>
            <Paper style={styles.container}>
                <AppBar position="static">
                    <Tabs
                        value={activeTabIndex}
                        onChange={handleTabChange}
                        classes={{
                            root: 'tabs',
                            indicator: 'tabs-indicator-color',
                        }}
                    >
                        <Tab label="Closures" className="tab-minwidth" />
                        <Tab label="Reopenings" className="tab-minwidth" />
                    </Tabs>
                </AppBar>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Facility name</TableCell>
                            <TableCell>Reported by user</TableCell>
                            <TableCell>Reported by contributor</TableCell>
                            <TableCell>Closure state</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map(report => (
                            <TableRow key={report.id}>
                                <TableCell>
                                    <Link
                                        to={{
                                            pathname: makeFacilityDetailLink(
                                                report.facility,
                                            ),
                                        }}
                                        href={makeFacilityDetailLink(
                                            report.facility,
                                        )}
                                    >
                                        {report.facility_name}
                                    </Link>
                                </TableCell>
                                <TableCell>{report.reported_by_user}</TableCell>
                                <TableCell>
                                    {report.reported_by_contributor}
                                </TableCell>
                                <TableCell>{report.closure_state}</TableCell>
                                <TableCell>{renderStatus(report)}</TableCell>
                                <TableCell>
                                    {report.status === 'PENDING' && (
                                        <div style={styles.buttonGroup}>
                                            <Button
                                                size="small"
                                                style={styles.button}
                                                onClick={() =>
                                                    openDialog(CONFIRM, report)
                                                }
                                            >
                                                Confirm
                                            </Button>
                                            <Typography> | </Typography>
                                            <Button
                                                size="small"
                                                style={styles.button}
                                                onClick={() =>
                                                    openDialog(REJECT, report)
                                                }
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
            {statusDialog}
            {errors}
        </div>
    );
}

DashboardActivityReports.propTypes = {
    dashboardActivityReports: shape({
        activityReports: shape({
            data: arrayOf(activityReportPropType).isRequired,
            fetching: bool.isRequired,
            error: arrayOf(string),
        }).isRequired,
    }).isRequired,
    fetchActivityReports: func.isRequired,
};

function mapStateToProps({ dashboardActivityReports }) {
    return { dashboardActivityReports };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchActivityReports: () => dispatch(fetchDashboardActivityReports()),
        rejectReport: data => dispatch(rejectDashboardActivityReport(data)),
        confirmReport: data => dispatch(confirmDashboardActivityReport(data)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardActivityReports);
