import React, { useEffect, useState } from 'react';
import { arrayOf, func, string } from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

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
    const [anchorEl, setAnchorEl] = React.useState(null);

    useEffect(() => {
        if (requestedDownload && logDownloadError) {
            toast('A problem prevented downloading the facilities');
            setRequestedDownload(false);
        }
    }, [logDownloadError, requestedDownload]);

    const handleClick = event => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const selectFormatAndDownload = format => {
        if (user) {
            setRequestedDownload(true);
            handleDownload(format);
        } else {
            setLoginRequiredDialogIsOpen(true);
        }
        handleClose();
    };

    return (
        <div>
            <Button
                variant="outlined"
                color="primary"
                styles={downloadFacilitiesStyles.listHeaderButtonStyles}
                aria-owns={anchorEl ? 'download-menu' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                Download
            </Button>
            <Menu
                id="download-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => selectFormatAndDownload('csv')}>
                    CSV
                </MenuItem>
                <MenuItem onClick={() => selectFormatAndDownload('xlsx')}>
                    Excel
                </MenuItem>
            </Menu>
        </div>
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
        handleDownload: format => dispatch(logDownload(format)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DownloadFacilitiesButton);
