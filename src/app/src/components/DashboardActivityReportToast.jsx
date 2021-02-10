import React, { useEffect, useState } from 'react';
import { arrayOf, string } from 'prop-types';

import Snackbar from '@material-ui/core/Snackbar';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const gradient = 'linear-gradient(-90deg, rgb(224, 32, 32) 0%, rgb(163, 79, 165) 21%, rgb(0, 145, 255) 51%, rgb(91, 201, 238) 79%, rgb(109, 212, 0) 100%)';

const styles = {
    message: {
        bottom: '75px',
    },
    messageGradient: {
        width: '368px',
        background: gradient,
        borderRadius: '0px 0px 2px 2px',
        padding: '0 0 6px 0',
    },
    messageContainer: {
        minHeight: '30px',
        padding: 0,
        width: '100%',
        borderRadius: '0px 0px 2px 2px',
    },
    messageContent: {
        minHeight: '30px',
        padding: '5px 10px',
        background: 'white',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    errors: {
        bottom: '50px',
    },
};

function DashboardActivityReportToast({ error, message, resetReports }) {
    const [showErrors, setShowErrors] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (error && error.length) {
            setShowErrors(true);
        } else {
            setShowErrors(false);
        }
    }, [error]);

    useEffect(() => {
        if (message && message.length) {
            setShowMessage(true);
        } else {
            setShowMessage(false);
        }
    }, [message]);

    const handleCloseToast = () => {
        setShowMessage(false);
        setShowErrors(false);
        resetReports();
    };

    const errorsToast = (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={showErrors}
            style={styles.errors}
            autoHideDuration={6000}
            onClose={handleCloseToast}
            message={error && error.map(e => <span key={e}>{e}</span>)}
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={handleCloseToast}
                >
                    <CloseIcon />
                </IconButton>,
            ]}
        />
    );

    const messageToast = (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            style={styles.message}
            open={showMessage}
            autoHideDuration={6000}
            onClose={handleCloseToast}
        >
            <Paper style={styles.messageContainer}>
                <div style={styles.messageGradient}>
                    <div style={styles.messageContent}>
                        <Typography>{message}</Typography>
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={handleCloseToast}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>
            </Paper>
        </Snackbar>
    );

    return (
        <>
            {errorsToast}
            {messageToast}
        </>
    );
}

DashboardActivityReportToast.propTypes = {
    error: arrayOf(string),
    message: string,
};

export default DashboardActivityReportToast;
