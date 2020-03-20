import React, { Fragment, useState, useEffect } from 'react';
import { arrayOf, bool, func, number, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
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
import get from 'lodash/get';
import { toast } from 'react-toastify';
import InfiniteAnyHeight from 'react-infinite-any-height';

import {
    makeSidebarSearchTabActive,
} from '../actions/ui';

import { fetchNextPageOfFacilities } from '../actions/facilities';

import { logDownload } from '../actions/logDownload';

import { facilityCollectionPropType } from '../util/propTypes';

import {
    authLoginFormRoute,
    authRegisterFormRoute,
} from '../util/constants';

import {
    makeFacilityDetailLink,
} from '../util/util';

import COLOURS from '../util/COLOURS';

import { filterSidebarStyles } from '../util/styles';

const facilitiesTabStyles = Object.freeze({
    noResultsTextStyles: Object.freeze({
        margin: '30px',
    }),
    linkStyles: Object.freeze({
        display: 'flex',
        textDecoration: 'none',
    }),
    listItemStyles: Object.freeze({
        wordWrap: 'anywhere',
    }),
    listHeaderStyles: Object.freeze({
        backgroundColor: COLOURS.WHITE,
        padding: '0.25rem',
        maxHeight: '130px',
    }),
    listStyles: Object.freeze({
        /* overflowY: 'scroll',
        position: 'fixed',
        // sum heights of navbar, tab bar, panel header, and free text search control
        top: 'calc(64px + 48px + 130px + 110px)',
        bottom: '47px',
        width: '33%', */
    }),
    listBottomPaddingStyles: Object.freeze({
        height: '200px',
    }),
    titleRowStyles: Object.freeze({
        display: 'flex',
        alignItems: 'center',
        padding: '6px 1rem',
    }),
    listHeaderTextSearchStyles: Object.freeze({
        padding: '6px 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    listHeaderButtonStyles: Object.freeze({
        height: '45px',
        margin: '5px 0',
    }),
});

function FilterSidebarFacilitiesTab({
    fetching,
    data,
    error,
    windowHeight,
    logDownloadError,
    downloadingCSV,
    user,
    returnToSearchTab,
    handleDownload,
    fetchNextPage,
    isInfiniteLoading,
}) {
    const [loginRequiredDialogIsOpen, setLoginRequiredDialogIsOpen] = useState(false);
    const [requestedDownload, setRequestedDownload] = useState(false);

    useEffect(() => {
        if (requestedDownload && logDownloadError) {
            toast('A problem prevented downloading the facilities');
            setRequestedDownload(false);
        }
    }, [logDownloadError, requestedDownload]);

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
                        style={facilitiesTabStyles.noResultsTextStyles}
                        align="center"
                    >
                        An error prevented fetching facilities
                    </Typography>
                    <Typography
                        variant="body1"
                        style={facilitiesTabStyles.noResultsTextStyles}
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
                        style={facilitiesTabStyles.noResultsTextStyles}
                        align="center"
                    >
                        No facilities to display
                    </Typography>
                    <Typography
                        variant="body1"
                        style={facilitiesTabStyles.noResultsTextStyles}
                        align="center"
                    >
                        <Button
                            onClick={returnToSearchTab}
                            variant="outlined"
                            color="secondary"
                        >
                            Search for facilities
                        </Button>
                    </Typography>
                </div>
            </div>
        );
    }

    const facilitiesCount = get(data, 'count', null);

    const LoginLink = props => <Link to={authLoginFormRoute} {...props} />;
    const RegisterLink = props => <Link to={authRegisterFormRoute} {...props} />;

    const listHeaderInsetComponent = (
        <div style={facilitiesTabStyles.listHeaderStyles} className="results-height-subtract">
            <Typography
                variant="subheading"
                align="center"
            >
                <div
                    style={facilitiesTabStyles.titleRowStyles}
                >
                    {
                        downloadingCSV
                            ? (
                                <div style={facilitiesTabStyles.listHeaderButtonStyles}>
                                    <CircularProgress />
                                </div>)
                            : (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    style={facilitiesTabStyles.listHeaderButtonStyles}
                                    disabled={downloadingCSV}
                                    onClick={
                                        () => {
                                            if (user) {
                                                setRequestedDownload(true);
                                                handleDownload();
                                            } else {
                                                setLoginRequiredDialogIsOpen(true);
                                            }
                                        }
                                    }
                                >
                                    Download CSV
                                </Button>)
                    }
                </div>
            </Typography>
        </div>
    );

    const nonResultListComponentHeight = (
        Array.from(document.getElementsByClassName('results-height-subtract'))
            .reduce((sum, x) => sum + x.offsetHeight, 0)
    );

    const resultListHeight = windowHeight - nonResultListComponentHeight;

    const loadingElement = (facilities.length !== facilitiesCount) && (
        <Fragment>
            <Divider />
            <ListItem style={facilitiesTabStyles.listItemStyles}>
                <ListItemText primary="Loading more facilities..." />
            </ListItem>
        </Fragment>
    );

    return (
        <Fragment>
            {listHeaderInsetComponent}
            <div style={filterSidebarStyles.controlPanelContentStyles}>
                <List style={facilitiesTabStyles.listStyles}>
                    <InfiniteAnyHeight
                        containerHeight={resultListHeight}
                        infiniteLoadBeginEdgeOffset={100}
                        isInfiniteLoading={fetching || isInfiniteLoading}
                        onInfiniteLoad={fetchNextPage}
                        loadingSpinnerDelegate={loadingElement}
                        list={
                            facilities
                                .map(({
                                    properties: {
                                        address,
                                        name,
                                        country_name: countryName,
                                        oar_id: oarID,
                                    },
                                }) => (
                                    <Fragment key={oarID}>
                                        <Divider />
                                        <ListItem
                                            key={oarID}
                                            style={facilitiesTabStyles.listItemStyles}
                                        >
                                            <Link
                                                to={{
                                                    pathname: makeFacilityDetailLink(oarID),
                                                    state: {
                                                        panMapToFacilityDetails: true,
                                                    },
                                                }}
                                                href={makeFacilityDetailLink(oarID)}
                                                style={facilitiesTabStyles.linkStyles}
                                            >
                                                <ListItemText
                                                    primary={`${name} - ${countryName}`}
                                                    secondary={address}
                                                />
                                            </Link>
                                        </ListItem>
                                    </Fragment>))
                        }
                    />
                </List>
            </div>
            <Dialog open={loginRequiredDialogIsOpen}>
                { loginRequiredDialogIsOpen ? (
                    <>
                        <DialogTitle>
                          Log In To Download
                        </DialogTitle>
                        <DialogContent>
                            <Typography>
                              You must log in with an Open Apparel Registry
                              account before downloading your search results.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setLoginRequiredDialogIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setLoginRequiredDialogIsOpen(false)}
                                component={RegisterLink}
                            >
                                Register
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setLoginRequiredDialogIsOpen(false)}
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
    logDownloadError: null,
};

FilterSidebarFacilitiesTab.propTypes = {
    data: facilityCollectionPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    windowHeight: number.isRequired,
    logDownloadError: arrayOf(string),
    downloadingCSV: bool.isRequired,
    returnToSearchTab: func.isRequired,
    handleDownload: func.isRequired,
    fetchNextPage: func.isRequired,
    isInfiniteLoading: bool.isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
    },
    facilities: {
        facilities: {
            data,
            error,
            fetching,
            isInfiniteLoading,
        },
    },
    ui: {
        facilitiesSidebarTabSearch: {
            filterText,
        },
        window: {
            innerHeight: windowHeight,
        },
    },
    logDownload: {
        fetching: downloadingCSV,
        error: logDownloadError,
    },
}) {
    return {
        data,
        error,
        fetching,
        filterText,
        user,
        logDownloadError,
        downloadingCSV,
        windowHeight,
        isInfiniteLoading,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        returnToSearchTab: () => dispatch(makeSidebarSearchTabActive()),
        handleDownload: () => dispatch(logDownload()),
        fetchNextPage: () => dispatch(fetchNextPageOfFacilities()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterSidebarFacilitiesTab);
