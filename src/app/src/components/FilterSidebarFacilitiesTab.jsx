import React, { Fragment, useState } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';
import InfiniteAnyHeight from 'react-infinite-any-height';
import noop from 'lodash/noop';

import CopySearch from './CopySearch';
import FeatureFlag from './FeatureFlag';
import DownloadFacilitiesButton from './DownloadFacilitiesButton';

import { toggleFilterModal, reportListScroll } from '../actions/ui';

import { fetchNextPageOfFacilities } from '../actions/facilities';

import { facilityCollectionPropType } from '../util/propTypes';

import {
    REPORT_A_FACILITY,
    authLoginFormRoute,
    authRegisterFormRoute,
    ALLOW_LARGE_DOWNLOADS,
    FACILITIES_DOWNLOAD_DEFAULT_LIMIT,
} from '../util/constants';

import { makeFacilityDetailLink } from '../util/util';

import COLOURS from '../util/COLOURS';

import { filterSidebarStyles } from '../util/styles';
import BadgeClaimed from './BadgeClaimed';
import CopyLinkIcon from './CopyLinkIcon';
import { useResultListHeight } from '../util/useHeightSubtract';

const makeFacilitiesTabStyles = theme => ({
    noResultsTextStyles: Object.freeze({
        margin: '30px !important',
        fontFamily: theme.typography.fontFamily,
    }),
    linkStyles: Object.freeze({
        color: '#191919',
        flexDirection: 'column',
        display: 'flex',
        textDecoration: 'none',
        fontFamily: theme.typography.fontFamily,
    }),
    listItemStyles: Object.freeze({
        wordWrap: 'anywhere',
        flexDirection: 'column',
        alignItems: 'start',
        maxWidth: '750px',
        minWidth: '310px',
        fontFamily: theme.typography.fontFamily,
    }),
    listHeaderStyles: Object.freeze({
        backgroundColor: COLOURS.WHITE,
        padding: '0.25rem',
        display: 'flex',
        maxHeight: '130px',
    }),
    titleRowStyles: Object.freeze({
        display: 'flex',
        alignItems: 'center',
        padding: '6px 1rem',
        justifyContent: 'space-around',
    }),
    listHeaderButtonStyles: Object.freeze({
        height: '45px',
        margin: '5px 0',
    }),
    downloadLabelStyles: Object.freeze({
        margin: '5px 0',
    }),
    closureRibbon: Object.freeze({
        background: 'rgb(255, 218, 162)',
        borderRadius: '4px',
        border: '1px solid rgb(134, 65, 15)',
        color: 'rgb(85, 43, 12)',
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '0 5px',
        marginTop: '5px',
        fontFamily: theme.typography.fontFamily,
    }),
});

function FilterSidebarFacilitiesTab({
    fetching,
    data,
    error,
    downloadingCSV,
    downloadData,
    returnToSearchTab,
    fetchNextPage,
    isInfiniteLoading,
    history: {
        location: { search },
    },
    handleScroll,
    scrollTop,
    classes,
}) {
    const [loginRequiredDialogIsOpen, setLoginRequiredDialogIsOpen] = useState(
        false,
    );

    const [hasScrolled, setHasScrolled] = useState(false);
    const scrollElements = Array.from(
        document.getElementsByClassName('infinite-scroll'),
    );
    if (!hasScrolled && scrollElements.length) {
        setHasScrolled(true);
        // The timeout allows persisted data to be restored before scroll is attemped
        setTimeout(() => {
            scrollElements.forEach(x => {
                x.scrollTo(0, scrollTop);
            });
        }, 100);
    }

    const resultListHeight = useResultListHeight();

    if (fetching) {
        return (
            <div
                className="control-panel__content"
                style={filterSidebarStyles.controlPanelContentStyles}
            >
                <div className="control-panel__body">
                    <CircularProgress />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="control-panel__content"
                style={filterSidebarStyles.controlPanelContentStyles}
            >
                <div className="control-panel__body">
                    <Typography
                        variant="body1"
                        className={classes.noResultsTextStyles}
                        align="center"
                    >
                        An error prevented fetching facilities
                    </Typography>
                    <Typography
                        variant="body1"
                        className={classes.noResultsTextStyles}
                        align="center"
                    >
                        <Button
                            onClick={returnToSearchTab}
                            variant="outlined"
                            color="secondary"
                        >
                            Try another search
                        </Button>
                    </Typography>
                </div>
            </div>
        );
    }

    const facilities = get(data, 'features', []);

    if (!facilities.length) {
        return (
            <div
                className="control-panel__content"
                style={filterSidebarStyles.controlPanelContentStyles}
            >
                <div className="control-panel__body">
                    <Typography
                        variant="body1"
                        className={classes.noResultsTextStyles}
                        align="center"
                    >
                        No facilities matching this search
                    </Typography>
                </div>
            </div>
        );
    }

    const facilitiesCount = get(data, 'count', null);

    const LoginLink = props => <Link to={authLoginFormRoute} {...props} />;
    const RegisterLink = props => (
        <Link to={authRegisterFormRoute} {...props} />
    );

    const progress = facilitiesCount
        ? (get(downloadData, 'results.rows', []).length * 100) / facilitiesCount
        : 0;

    const listHeaderInsetComponent = (
        <div className={`${classes.listHeaderStyles} results-height-subtract`}>
            <Typography variant="subheading" align="center">
                <div className={classes.titleRowStyles}>
                    {downloadingCSV ? (
                        <div className={classes.listHeaderButtonStyles}>
                            <div className={classes.downloadLabelStyles}>
                                Downloading...
                            </div>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                            />
                        </div>
                    ) : (
                        <FeatureFlag
                            flag={ALLOW_LARGE_DOWNLOADS}
                            alternative={
                                <DownloadFacilitiesButton
                                    disabled={
                                        facilitiesCount >=
                                        FACILITIES_DOWNLOAD_DEFAULT_LIMIT
                                    }
                                    setLoginRequiredDialogIsOpen={
                                        setLoginRequiredDialogIsOpen
                                    }
                                />
                            }
                        >
                            <DownloadFacilitiesButton
                                allowLargeDownloads
                                setLoginRequiredDialogIsOpen={
                                    setLoginRequiredDialogIsOpen
                                }
                            />
                        </FeatureFlag>
                    )}
                    <CopySearch>
                        <Button
                            variant="outlined"
                            onClick={noop}
                            style={{
                                fontSize: '16px',
                                fontWeight: '900',
                                lineWeight: '20px',
                                marginLeft: '1em',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textTransform: 'none',
                                }}
                            >
                                <CopyLinkIcon />
                                Copy Link
                            </div>
                        </Button>
                    </CopySearch>
                </div>
            </Typography>
        </div>
    );

    const loadingElement = facilities.length !== facilitiesCount && (
        <Fragment>
            <Divider />
            <ListItem className={classes.listItemStyles}>
                <ListItemText primary="Loading more facilities..." />
            </ListItem>
        </Fragment>
    );

    return (
        <Fragment>
            {listHeaderInsetComponent}
            <div style={filterSidebarStyles.controlPanelContentStyles}>
                <List component="div">
                    <InfiniteAnyHeight
                        className="infinite-scroll"
                        handleScroll={e => handleScroll(e.scrollTop)}
                        containerHeight={resultListHeight}
                        infiniteLoadBeginEdgeOffset={100}
                        isInfiniteLoading={fetching || isInfiniteLoading}
                        onInfiniteLoad={() => {
                            if (!downloadingCSV) {
                                fetchNextPage();
                            }
                        }}
                        loadingSpinnerDelegate={loadingElement}
                        list={facilities.map(
                            ({
                                properties: {
                                    address,
                                    name,
                                    has_approved_claim: hasApprovedClaim,
                                    os_id: osID,
                                    is_closed: isClosed,
                                },
                            }) => (
                                <div
                                    key={osID}
                                    className={classes.listItemStyles}
                                >
                                    <Divider />
                                    <ListItem
                                        key={osID}
                                        className={classes.listItemStyles}
                                    >
                                        <Link
                                            to={{
                                                pathname: makeFacilityDetailLink(
                                                    osID,
                                                    search,
                                                ),
                                                state: {
                                                    panMapToFacilityDetails: true,
                                                },
                                            }}
                                            href={makeFacilityDetailLink(
                                                osID,
                                                search,
                                            )}
                                            className={classes.linkStyles}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: 800,
                                                    fontSize: '28px',
                                                    letterSpacing: '-0.004em',
                                                }}
                                            >
                                                {name}
                                            </span>
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontWeight: '800',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                {`OS ID: ${osID}`}
                                                {hasApprovedClaim && (
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                paddingLeft:
                                                                    '0.3em',
                                                                paddingRight:
                                                                    '0.3em',
                                                            }}
                                                        >
                                                            ⦁
                                                        </span>
                                                        <BadgeClaimed color="#4A9957" />
                                                        <span
                                                            style={{
                                                                color:
                                                                    '#4A9957',
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            Claimed
                                                        </span>
                                                    </span>
                                                )}
                                            </span>
                                            {address}
                                        </Link>
                                        {isClosed ? (
                                            <FeatureFlag
                                                flag={REPORT_A_FACILITY}
                                            >
                                                <div
                                                    className={
                                                        classes.closureRibbon
                                                    }
                                                >
                                                    Closed facility
                                                </div>
                                            </FeatureFlag>
                                        ) : null}
                                    </ListItem>
                                </div>
                            ),
                        )}
                    />
                </List>
            </div>
            <Dialog open={loginRequiredDialogIsOpen}>
                {loginRequiredDialogIsOpen ? (
                    <>
                        <DialogTitle>Log In To Download</DialogTitle>
                        <DialogContent>
                            <Typography>
                                You must log in with an Open Supply Hub account
                                before downloading your search results.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() =>
                                    setLoginRequiredDialogIsOpen(false)
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() =>
                                    setLoginRequiredDialogIsOpen(false)
                                }
                                component={RegisterLink}
                            >
                                Register
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() =>
                                    setLoginRequiredDialogIsOpen(false)
                                }
                                component={LoginLink}
                            >
                                Log In
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <div style={{ display: 'none' }} />
                )}
            </Dialog>
        </Fragment>
    );
}

FilterSidebarFacilitiesTab.defaultProps = {
    data: null,
    error: null,
};

FilterSidebarFacilitiesTab.propTypes = {
    data: facilityCollectionPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    downloadingCSV: bool.isRequired,
    returnToSearchTab: func.isRequired,
    fetchNextPage: func.isRequired,
    isInfiniteLoading: bool.isRequired,
};

function mapStateToProps({
    facilities: {
        facilities: { data, error, fetching, isInfiniteLoading },
    },
    ui: {
        facilitiesSidebarTabSearch: { filterText },
        window: { innerHeight: windowHeight },
        scrollTop,
    },
    logDownload: { fetching: downloadingCSV },
    facilitiesDownload: {
        facilities: { data: downloadData },
    },
}) {
    return {
        data,
        downloadData,
        error,
        fetching,
        filterText,
        downloadingCSV,
        windowHeight,
        isInfiniteLoading,
        scrollTop,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        returnToSearchTab: () => dispatch(toggleFilterModal()),
        fetchNextPage: () => dispatch(fetchNextPageOfFacilities()),
        handleScroll: scrollTop => dispatch(reportListScroll(scrollTop)),
    };
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(withStyles(makeFacilitiesTabStyles)(FilterSidebarFacilitiesTab)),
);
