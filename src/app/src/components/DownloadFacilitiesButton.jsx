import React, { useEffect, useState } from 'react';
import { arrayOf, string, bool } from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

import { toast } from 'react-toastify';

import downloadFacilities from '../actions/downloadFacilities';
import DownloadIcon from './DownloadIcon';
import ArrowDropDownIcon from './ArrowDropDownIcon';

const downloadFacilitiesStyles = theme =>
    Object.freeze({
        listHeaderButtonStyles: Object.freeze({
            height: '45px',
            margin: '5px 0',
            backgroundColor: theme.palette.action.main,
            fontSize: '16px',
            fontWeight: 900,
            lineHeight: '20px',
            '&:hover': {
                backgroundColor: theme.palette.action.dark,
            },
        }),
        buttonText: Object.freeze({
            marginLeft: '0.2rem',
            marginRight: '0.6rem',
        }),
        downloadTooltip: {
            fontSize: '0.875rem',
            fontFamily: theme.typography.fontFamily,
        },
        buttonContent: {
            display: 'flex',
            alignItems: 'center',
            textTransform: 'none',
        },
    });

function DownloadFacilitiesButton({
    /* from state */
    dispatch,
    isEmbedded,
    logDownloadError,
    user,
    /* from props */
    allowLargeDownloads,
    disabled,
    setLoginRequiredDialogIsOpen,
    classes,
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

    const handleDownload = format => {
        dispatch(downloadFacilities(format, { isEmbedded }));
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
        <Tooltip
            title={
                allowLargeDownloads ? (
                    ''
                ) : (
                    <p className={classes.downloadTooltip}>
                        Downloads are supported only for searches resulting in
                        10,000 facilities or less.
                    </p>
                )
            }
            placement="left"
        >
            <div>
                <Button
                    disabled={disabled}
                    variant="outlined"
                    className={classes.listHeaderButtonStyles}
                    aria-owns={anchorEl ? 'download-menu' : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    <div className={classes.buttonContent}>
                        <DownloadIcon
                            color={disabled ? 'rgba(0, 0, 0, 0.26)' : '#1C1B1F'}
                        />
                        <span className={classes.buttonText}>Download</span>
                        <ArrowDropDownIcon
                            color={disabled ? 'rgba(0, 0, 0, 0.26)' : '#1C1B1F'}
                        />
                    </div>
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
        </Tooltip>
    );
}

DownloadFacilitiesButton.defaultProps = {
    allowLargeDownloads: false,
    disabled: false,
    logDownloadError: null,
};

DownloadFacilitiesButton.propTypes = {
    allowLargeDownloads: bool,
    disabled: bool,
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

export default connect(mapStateToProps)(
    withStyles(downloadFacilitiesStyles)(DownloadFacilitiesButton),
);
