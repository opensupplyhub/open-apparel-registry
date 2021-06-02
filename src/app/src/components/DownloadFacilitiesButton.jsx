import React, { useEffect, useState } from 'react';
import { arrayOf, string } from 'prop-types';
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
    /* from state */
    dispatch,
    isEmbedded,
    logDownloadError,
    user,
    /* from props */
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

    const handleDownload = format =>
        dispatch(logDownload(format, { isEmbedded }));

    const selectFormatAndDownload = format => {
        if (user || isEmbedded) {
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
};

function mapStateToProps({
    auth: {
        user: { user },
    },
    logDownload: { error: logDownloadError },
    embeddedMap: { embed: isEmbedded },
}) {
    return {
        user,
        logDownloadError,
        isEmbedded,
    };
}

export default connect(mapStateToProps)(DownloadFacilitiesButton);
