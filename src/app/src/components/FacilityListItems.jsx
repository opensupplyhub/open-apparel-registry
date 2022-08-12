import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import FacilityListItemsEmpty from './FacilityListItemsEmpty';
import FacilityListItemsTable from './FacilityListItemsTable';

import {
    fetchFacilityList,
    fetchFacilityListItems,
    resetFacilityListItems,
    assembleAndDownloadFacilityListCSV,
} from '../actions/facilityListDetails';

import {
    OARFont,
    listsRoute,
    facilityListItemsRoute,
    facilityListItemStatusChoicesEnum,
    authLoginFormRoute,
    dashboardListsRoute,
    matchResponsibilityEnum,
} from '../util/constants';

import { facilityListPropType } from '../util/propTypes';

import {
    createPaginationOptionsFromQueryString,
    createParamsFromQueryString,
} from '../util/util';

const facilityListItemsStyles = Object.freeze({
    headerStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        marginTop: '60px',
        alignContent: 'center',
        alignItems: 'center',
    }),
    titleStyles: Object.freeze({
        overflowWrap: 'anywhere',
    }),
    subheadStyles: Object.freeze({
        padding: '0.5rem',
        textAlign: 'left',
    }),
    tableStyles: Object.freeze({
        minWidth: '85%',
        width: '90%',
    }),
    tableTitleStyles: Object.freeze({
        fontFamily: OARFont,
        fontWeight: 'normal',
        fontSize: '32px',
    }),
    descriptionStyles: Object.freeze({
        marginBottm: '30px',
    }),
    buttonStyles: Object.freeze({
        marginLeft: '20px',
    }),
    buttonGroupStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }),
    buttonGroupWithErrorStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
    }),
});

class FacilityListItems extends Component {
    componentDidMount() {
        this.props.fetchList();
        this.props.fetchListItems();
    }

    componentWillUnmount() {
        return this.props.clearListItems();
    }

    render() {
        const {
            list,
            fetchingList,
            error,
            downloadCSV,
            downloadingCSV,
            csvDownloadingError,
            userHasSignedIn,
            isAdminUser,
            readOnly,
            adminSearch,
        } = this.props;

        if (fetchingList) {
            return (
                <AppGrid title="">
                    <CircularProgress />
                </AppGrid>
            );
        }

        if (error && error.length) {
            if (!userHasSignedIn) {
                return (
                    <AppGrid title="Unable to retrieve that list">
                        <Link to={authLoginFormRoute} href={authLoginFormRoute}>
                            Sign in to view your Open Supply Hub lists
                        </Link>
                    </AppGrid>
                );
            }

            return (
                <AppGrid title="Unable to retrieve that list">
                    <ul>
                        {error.map(err => (
                            <li key={err}>{err}</li>
                        ))}
                    </ul>
                </AppGrid>
            );
        }

        if (!list) {
            return (
                <AppGrid title="No list was found for that ID">
                    <div />
                </AppGrid>
            );
        }

        const csvDownloadErrorMessage =
            csvDownloadingError && csvDownloadingError.length ? (
                <p style={{ color: 'red', textAlign: 'right' }}>
                    An error prevented downloading the CSV.
                </p>
            ) : null;

        const awaitingModerationMessage = readOnly ? (
            <p style={{ color: 'red' }}>
                This list has matches awaiting moderation from the{' '}
                {isAdminUser ? 'contributor' : 'OS Hub admins'}.
            </p>
        ) : null;

        const csvDownloadButton = downloadingCSV ? (
            <div>
                <CircularProgress size={25} />
            </div>
        ) : (
            <Button
                variant="outlined"
                color="primary"
                style={facilityListItemsStyles.buttonStyles}
                onClick={downloadCSV}
                disabled={downloadingCSV}
            >
                Download CSV
            </Button>
        );

        const backRoute = isAdminUser
            ? `${dashboardListsRoute}${adminSearch || ''}`
            : listsRoute;

        return (
            <AppOverflow>
                <Grid container justify="center">
                    <Grid item style={facilityListItemsStyles.tableStyles}>
                        <div style={facilityListItemsStyles.headerStyles}>
                            <div>
                                <h2 style={facilityListItemsStyles.titleStyles}>
                                    {list.name || list.id}
                                </h2>
                                <Typography
                                    variant="subheading"
                                    style={
                                        facilityListItemsStyles.descriptionStyles
                                    }
                                >
                                    {list.description || ''}
                                </Typography>
                            </div>
                            <div
                                style={
                                    facilityListItemsStyles.buttonGroupWithErrorStyles
                                }
                            >
                                {csvDownloadErrorMessage}
                                <div
                                    style={
                                        facilityListItemsStyles.buttonGroupStyles
                                    }
                                >
                                    {csvDownloadButton}
                                    <Button
                                        variant="outlined"
                                        component={Link}
                                        to={backRoute}
                                        href={backRoute}
                                        style={
                                            facilityListItemsStyles.buttonStyles
                                        }
                                    >
                                        Back to lists
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div style={facilityListItemsStyles.subheadStyles}>
                            The processing time may be longer for lists that
                            include additional data points beyond facility name
                            and address. You will receive an email when your
                            list has finished processing.
                            {awaitingModerationMessage}
                        </div>
                        {list.item_count ? (
                            <Route
                                path={facilityListItemsRoute}
                                component={FacilityListItemsTable}
                            />
                        ) : (
                            <FacilityListItemsEmpty />
                        )}
                    </Grid>
                </Grid>
            </AppOverflow>
        );
    }
}

FacilityListItems.defaultProps = {
    list: null,
    error: null,
    csvDownloadingError: null,
    adminSearch: null,
};

FacilityListItems.propTypes = {
    list: facilityListPropType,
    fetchingList: bool.isRequired,
    error: arrayOf(string),
    fetchList: func.isRequired,
    fetchListItems: func.isRequired,
    clearListItems: func.isRequired,
    downloadCSV: func.isRequired,
    downloadingCSV: bool.isRequired,
    csvDownloadingError: arrayOf(string),
    userHasSignedIn: bool.isRequired,
    isAdminUser: bool.isRequired,
    readOnly: bool.isRequired,
    adminSearch: string,
};

function mapStateToProps({
    facilityListDetails: {
        list: { data: list, fetching: fetchingList, error: listError },
        items: { data: items, error: itemsError },
        downloadCSV: { fetching: downloadingCSV, error: csvDownloadingError },
    },
    auth: {
        user: { user },
    },
}) {
    const isAdminUser =
        !!user &&
        user.is_superuser &&
        list &&
        user.contributor_id !== list.contributor_id;
    const hasPendingItems =
        !!items &&
        items.some(
            item =>
                item.status ===
                facilityListItemStatusChoicesEnum.POTENTIAL_MATCH,
        );
    const readOnly =
        !!list &&
        hasPendingItems &&
        ((list.match_responsibility === matchResponsibilityEnum.CONTRIBUTOR &&
            isAdminUser) ||
            (list.match_responsibility === matchResponsibilityEnum.MODERATOR &&
                !isAdminUser));
    return {
        list,
        fetchingList,
        error: listError || itemsError,
        downloadingCSV,
        csvDownloadingError,
        userHasSignedIn: !!user,
        isAdminUser,
        readOnly,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { listID },
        },
        history: {
            location: { search, state: { search: adminSearch } = {} },
        },
    },
) {
    const { page, rowsPerPage } = createPaginationOptionsFromQueryString(
        search,
    );

    const params = createParamsFromQueryString(search);

    return {
        fetchList: () => dispatch(fetchFacilityList(listID)),
        fetchListItems: () =>
            dispatch(fetchFacilityListItems(listID, page, rowsPerPage, params)),
        clearListItems: () => dispatch(resetFacilityListItems()),
        downloadCSV: () => dispatch(assembleAndDownloadFacilityListCSV()),
        adminSearch,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityListItems);
