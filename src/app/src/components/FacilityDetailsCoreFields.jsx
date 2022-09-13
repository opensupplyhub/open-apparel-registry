import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';

import ContentCopyIcon from './ContentCopyIcon';
import ArrowDropDownIcon from './ArrowDropDownIcon';
import FlagIcon from './FlagIcon';
import ShowOnly from './ShowOnly';
import ReportFacilityStatusDialog from './ReportFacilityStatusDialog';
import CopySearch from './CopySearch';

import { facilityDetailsActions } from '../util/constants';

import {
    makeReportADataIssueEmailLink,
    makeReportADuplicateEmailLink,
    makeDisputeClaimEmailLink,
} from '../util/util';

const coreFieldsStyles = theme =>
    Object.freeze({
        root: {
            color: '#191919',
            display: 'flex',
            justifyContent: 'center',
        },
        contentContainer: {
            width: '100%',
            maxWidth: '1072px',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: theme.spacing.unit * 5,
            paddingLeft: theme.spacing.unit * 3,
        },
        detailsType: {
            fontWeight: 700,
            textTransform: 'uppercase',
        },
        nameRow: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        name: {
            fontWeight: 900,
            fontSize: '2.5rem',
            [theme.breakpoints.up('md')]: {
                fontSize: '3.5rem',
            },
        },
        menuButton: {
            marginRight: theme.spacing.unit * 2,
        },
        buttonContainer: {
            marginTop: '1.25rem',
            [theme.breakpoints.up('md')]: {
                fontSize: '1.75rem',
            },
        },
        buttonText: {
            textTransform: 'none',
            fontSize: '1rem',
            marginLeft: theme.spacing.unit,
            marginRight: theme.spacing.unit,
        },
        osId: {
            marginTop: theme.spacing.unit * 2,
            fontSize: '18px',
        },
        menuLink: {
            color: 'inherit',
            textDecoration: 'inherit',
        },
    });

const FacilityDetailsCoreFields = ({
    classes,
    name,
    oarId,
    isEmbed,
    isClaimed,
    isClosed,
    facilityIsClaimedByCurrentUser,
    userHasPendingFacilityClaim,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState();
    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);

    const menu = (
        <Menu
            id="report-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <MenuItem onClick={handleClose}>
                <a
                    href={makeReportADuplicateEmailLink(oarId)}
                    target="_blank"
                    rel="noreferrer"
                    className={classes.menuLink}
                >
                    {facilityDetailsActions.REPORT_AS_DUPLICATE}
                </a>
            </MenuItem>
            <MenuItem
                onClick={() => {
                    setShowDialog(true);
                    handleClose();
                }}
            >
                {isClosed
                    ? facilityDetailsActions.REPORT_AS_REOPENED
                    : facilityDetailsActions.REPORT_AS_CLOSED}
            </MenuItem>
            <MenuItem onClick={handleClose}>
                <a
                    href={makeReportADataIssueEmailLink(oarId)}
                    target="_blank"
                    rel="noreferrer"
                    className={classes.menuLink}
                >
                    {facilityDetailsActions.SUGGEST_AN_EDIT}
                </a>
            </MenuItem>
            <ShowOnly
                when={
                    !facilityIsClaimedByCurrentUser &&
                    !userHasPendingFacilityClaim &&
                    isClaimed
                }
            >
                <MenuItem onClick={handleClose}>
                    <a
                        href={makeDisputeClaimEmailLink(oarId)}
                        target="_blank"
                        rel="noreferrer"
                        className={classes.menuLink}
                    >
                        {facilityDetailsActions.DISPUTE_CLAIM}
                    </a>
                </MenuItem>
            </ShowOnly>
        </Menu>
    );

    return (
        <div className={classes.root}>
            <div className={classes.contentContainer}>
                <Typography className={classes.detailsType}>
                    Facility
                </Typography>
                <Grid container className={classes.nameRow}>
                    <Grid item xs={12} md={isEmbed ? 12 : 7}>
                        <Typography className={classes.name}>{name}</Typography>
                    </Grid>
                    <ShowOnly when={!isEmbed}>
                        <Grid
                            item
                            xs={12}
                            md={5}
                            className={classes.buttonContainer}
                        >
                            <Button
                                variant="outlined"
                                className={classes.menuButton}
                                aria-owns={anchorEl ? 'report-menu' : undefined}
                                aria-haspopup="true"
                                onClick={handleClick}
                            >
                                <FlagIcon />
                                <span className={classes.buttonText}>
                                    Report
                                </span>
                                <ArrowDropDownIcon />
                            </Button>
                            {menu}
                            <CopySearch toastText="Copied link">
                                <Button variant="outlined">
                                    <ContentCopyIcon />
                                    <span className={classes.buttonText}>
                                        Copy Link
                                    </span>
                                </Button>
                            </CopySearch>
                        </Grid>
                    </ShowOnly>
                </Grid>
                <Typography className={classes.osId}>
                    <strong>OS ID:</strong> {oarId}
                </Typography>
            </div>
            <ReportFacilityStatusDialog
                showDialog={showDialog}
                setShowDialog={setShowDialog}
            />
        </div>
    );
};

export default withStyles(coreFieldsStyles)(FacilityDetailsCoreFields);
