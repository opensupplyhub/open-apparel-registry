import React, { useEffect, useState } from 'react';
import { arrayOf, func, string } from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';

import { toast } from 'react-toastify';

import { logDownload } from '../actions/logDownload';

const downloadFacilitiesStyles = Object.freeze({
    listHeaderButtonStyles: Object.freeze({
        height: '45px',
        margin: '5px 0',
    }),
});

function DownloadFacilitiesButton({
    logDownloadError,
    user,
    handleDownload,
    setLoginRequiredDialogIsOpen,
}) {
    const [requestedDownload, setRequestedDownload] = useState(false);

    useEffect(() => {
        if (requestedDownload && logDownloadError) {
            toast('A problem prevented downloading the facilities');
            setRequestedDownload(false);
        }
    }, [logDownloadError, requestedDownload]);

    return (
        <Button
            variant="outlined"
            color="primary"
            styles={downloadFacilitiesStyles.listHeaderButtonStyles}
            onClick={() => {
                if (user) {
                    setRequestedDownload(true);
                    handleDownload();
                } else {
                    setLoginRequiredDialogIsOpen(true);
                }
            }}
        >
            Download CSV
        </Button>
    );
}

DownloadFacilitiesButton.defaultProps = {
    logDownloadError: null,
};

DownloadFacilitiesButton.propTypes = {
    logDownloadError: arrayOf(string),
    handleDownload: func.isRequired,
};

function mapStateToProps({
    auth: {
        user: { user },
    },
    logDownload: { error: logDownloadError },
}) {
    return {
        user,
        logDownloadError,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        handleDownload: () => dispatch(logDownload()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DownloadFacilitiesButton);
