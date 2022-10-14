import React, { useEffect, useState } from 'react';
import { arrayOf, string } from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { toast } from 'react-toastify';

import {
    downloadFacilities,
    startDownloadFacilities,
    failDownloadFacilities,
} from '../actions/downloadFacilities';
import { fetchFacilities } from '../actions/facilities';
import { FACILITIES_DOWNLOAD_REQUEST_PAGE_SIZE } from '../util/constants';

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
    downloadFacilitiesError,
    user,
    /* from props */
    setLoginRequiredDialogIsOpen,
}) {
    const [requestedDownload, setRequestedDownload] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);

    useEffect(() => {
        if (requestedDownload && downloadFacilitiesError) {
            toast('A problem prevented downloading the facilities');
            setRequestedDownload(false);
        }
    }, [downloadFacilitiesError, requestedDownload]);

    const handleClick = event => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleDownload = format => {
        dispatch(startDownloadFacilities());
        dispatch(
            fetchFacilities({
                pageSize: FACILITIES_DOWNLOAD_REQUEST_PAGE_SIZE,
                detail: true,
                onSuccess: () =>
                    dispatch(downloadFacilities(format, { isEmbedded })),
                onFailure: () => dispatch(failDownloadFacilities()),
            }),
        );
    };

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
    downloadFacilitiesError: null,
};

DownloadFacilitiesButton.propTypes = {
    downloadFacilitiesError: arrayOf(string),
};

function mapStateToProps({
    auth: {
        user: { user },
    },
    downloadFacilities: { error: downloadFacilitiesError },
    embeddedMap: { embed: isEmbedded },
}) {
    return {
        user,
        downloadFacilitiesError,
        isEmbedded,
    };
}

export default connect(mapStateToProps)(DownloadFacilitiesButton);
