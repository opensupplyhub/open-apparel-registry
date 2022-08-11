import React, { useEffect } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import ReactSelect from 'react-select';
import { connect } from 'react-redux';

import sum from 'lodash/sum';
import moment from 'moment';

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import FacilityListsTooltipTableCell from './FacilityListsTooltipTableCell';
import ShowOnly from './ShowOnly';

import {
    fetchDashboardListContributors,
    fetchDashboardFacilityLists,
    setDashboardListContributor,
} from '../actions/dashboardLists';

import {
    DEFAULT_PAGE,
    facilitiesListTableTooltipTitles,
    matchResponsibilityChoices,
    rowsPerPageOptions,
    facilityListStatusChoices,
} from '../util/constants';

import {
    contributorOptionPropType,
    contributorOptionsPropType,
    facilityListPropType,
} from '../util/propTypes';

import {
    makeDashboardContributorListLink,
    makeFacilityListItemsDetailLink,
    createPaginationOptionsFromQueryString,
    getDashboardListParamsFromQueryString,
} from '../util/util';

const CONTRIBUTORS = 'CONTRIBUTORS';
const RESPONSIBILITY = 'RESPONSIBILITY';
const ALL_CONTRIBUTORS = { label: 'All', value: '' };
const STATUS = 'STATUS';

const styles = {
    container: {
        marginBottom: '60px',
        width: '100%',
    },
    filterRow: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    filter: {
        flex: 1,
    },
    inactiveList: {
        cursor: 'pointer',
    },
    activeList: {
        backgroundColor: '#f3fafe',
        outlineWidth: '0.75px',
        outlineStyle: 'solid',
        outlineColor: '#1a9fe3',
        cursor: 'pointer',
    },
};

const getSelectTheme = theme => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary: '#00319D',
    },
});

const selectStyles = {
    control: provided => ({
        ...provided,
        height: '56px',
    }),
};

function DashboardLists({
    dashboardLists: {
        contributor,
        contributors,
        facilityLists,
        facilityListsCount,
    },
    history: {
        location: { search },
        push,
        replace,
    },
    fetchContributors,
    setContributor,
    fetchLists,
}) {
    const {
        contributor: contributorID,
        matchResponsibility,
        status,
    } = getDashboardListParamsFromQueryString(search);

    const { page, rowsPerPage } = createPaginationOptionsFromQueryString(
        search,
    );

    useEffect(() => {
        // If contributors have not been initialized, fetch them
        if (!contributors.data.length && !contributors.fetching) {
            fetchContributors();
        }

        if (
            contributorID &&
            !contributor &&
            contributors.data.length &&
            !contributors.fetching
        ) {
            // If contributor is not set, but an ID is present in the URL,
            // e.g. when following a link or refreshing the page after
            // selecting a contributor, set the contributor and fetch its lists
            setContributor(
                contributors.data.find(c => c.value === contributorID),
            );
        }
    }, [
        contributor,
        contributorID,
        contributors.data,
        contributors.fetching,
        fetchContributors,
        setContributor,
    ]);

    // Fetch lists when on page load or when form data changes
    useEffect(() => {
        if (!contributors.fetching) {
            fetchLists({
                contributorID: contributor?.value || undefined,
                matchResponsibility,
                status,
                page,
                pageSize: rowsPerPage,
            });
        }
    }, [
        contributor,
        contributors.fetching,
        matchResponsibility,
        status,
        page,
        rowsPerPage,
        fetchLists,
    ]);

    const onContributorUpdate = c => {
        replace(
            makeDashboardContributorListLink({
                contributorID: c.value,
                matchResponsibility,
                status,
                page: DEFAULT_PAGE,
                rowsPerPage,
            }),
        );
        setContributor(c);
    };

    const onMatchResponsibilityUpdate = opt => {
        replace(
            makeDashboardContributorListLink({
                contributorID,
                matchResponsibility: opt.value,
                status,
                page: DEFAULT_PAGE,
                rowsPerPage,
            }),
        );
    };

    const onStatusUpdate = s => {
        replace(
            makeDashboardContributorListLink({
                contributorID,
                matchResponsibility,
                status: s.value,
                page: DEFAULT_PAGE,
                rowsPerPage,
            }),
        );
    };

    const onPageChange = (_, newPage) => {
        replace(
            makeDashboardContributorListLink({
                contributorID,
                matchResponsibility,
                status,
                page: newPage + 1,
                rowsPerPage,
            }),
        );
    };

    const onPageSizeChange = e => {
        replace(
            makeDashboardContributorListLink({
                contributorID,
                matchResponsibility,
                status,
                page: DEFAULT_PAGE,
                rowsPerPage: e.target.value,
            }),
        );
    };

    const when = {
        initialLoad: facilityLists.data === null,
        contributorHasNoLists:
            contributor !== null &&
            !facilityLists.fetching &&
            facilityLists.data?.length === 0,
    };

    const fetchingData = contributors.fetching || facilityLists.fetching;

    return (
        <Paper style={styles.container}>
            <div style={styles.filterRow}>
                <div style={styles.filter}>
                    <label htmlFor={CONTRIBUTORS}>Contributor</label>
                    <ReactSelect
                        id={CONTRIBUTORS}
                        name={CONTRIBUTORS}
                        classNamePrefix="select"
                        options={[ALL_CONTRIBUTORS, ...contributors.data]}
                        value={contributorID ? contributor : ALL_CONTRIBUTORS}
                        placeholder=""
                        onChange={onContributorUpdate}
                        disabled={fetchingData}
                        styles={selectStyles}
                        theme={getSelectTheme}
                    />
                </div>
                <div style={styles.filter}>
                    <label htmlFor={RESPONSIBILITY}>Match responsibility</label>
                    <ReactSelect
                        id={RESPONSIBILITY}
                        name={RESPONSIBILITY}
                        classNamePrefix="select"
                        options={matchResponsibilityChoices}
                        value={matchResponsibilityChoices.find(
                            m => m.value === matchResponsibility,
                        )}
                        onChange={onMatchResponsibilityUpdate}
                        disabled={fetchingData}
                        styles={selectStyles}
                        theme={getSelectTheme}
                    />
                </div>
                <div style={styles.filter}>
                    <label htmlFor={STATUS}>List Status</label>
                    <ReactSelect
                        id={STATUS}
                        name={STATUS}
                        classNamePrefix="select"
                        options={facilityListStatusChoices}
                        value={facilityListStatusChoices.find(
                            s => s.value === status,
                        )}
                        onChange={onStatusUpdate}
                        disabled={fetchingData}
                        styles={selectStyles}
                        theme={getSelectTheme}
                    />
                </div>
            </div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Date Created</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>File Name</TableCell>
                        <TableCell padding="dense">Total</TableCell>
                        <TableCell padding="dense">Matched</TableCell>
                        <TableCell padding="dense">Error</TableCell>
                        <TableCell padding="dense">Potential Match</TableCell>
                        <TableCell padding="dense">Active</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {facilityLists.data?.map(list => (
                        <TableRow
                            key={list.id}
                            hover
                            onClick={() =>
                                push(makeFacilityListItemsDetailLink(list.id), {
                                    search,
                                })
                            }
                            style={
                                list.is_active
                                    ? styles.activeList
                                    : styles.inactiveList
                            }
                        >
                            <TableCell>
                                {moment(list.created_at).format('L')}
                            </TableCell>
                            <TableCell>{list.name}</TableCell>
                            <TableCell>{list.description}</TableCell>
                            <TableCell>{list.file_name}</TableCell>
                            <FacilityListsTooltipTableCell
                                tooltipTitle={
                                    facilitiesListTableTooltipTitles.total
                                }
                                tableCellText={list.item_count}
                            />
                            <FacilityListsTooltipTableCell
                                tooltipTitle={
                                    facilitiesListTableTooltipTitles.matched
                                }
                                tableCellText={sum([
                                    list.status_counts.MATCHED,
                                    list.status_counts.CONFIRMED_MATCH,
                                ])}
                            />
                            <FacilityListsTooltipTableCell
                                tooltipTitle={
                                    facilitiesListTableTooltipTitles.error
                                }
                                tableCellText={sum([
                                    list.status_counts.ERROR,
                                    list.status_counts.ERROR_PARSING,
                                    list.status_counts.ERROR_GEOCODING,
                                    list.status_counts.ERROR_MATCHING,
                                ])}
                            />
                            <FacilityListsTooltipTableCell
                                tooltipTitle={
                                    facilitiesListTableTooltipTitles.potentialMatch
                                }
                                tableCellText={
                                    list.status_counts.POTENTIAL_MATCH
                                }
                            />
                            <TableCell padding="dense">
                                {list.is_active ? 'Active' : 'Inactive'}
                            </TableCell>
                        </TableRow>
                    ))}
                    <ShowOnly when={when.contributorHasNoLists}>
                        <TableRow>
                            <TableCell
                                colSpan={12}
                                style={{ textAlign: 'center' }}
                            >
                                This contributor has no lists.
                            </TableCell>
                        </TableRow>
                    </ShowOnly>
                </TableBody>
                <ShowOnly when={facilityListsCount}>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={facilityListsCount}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageOptions={rowsPerPageOptions}
                                onChangeRowsPerPage={onPageSizeChange}
                                page={page - 1}
                                onChangePage={onPageChange}
                            />
                        </TableRow>
                    </TableFooter>
                </ShowOnly>
            </Table>
        </Paper>
    );
}

DashboardLists.propTypes = {
    dashboardLists: shape({
        contributor: contributorOptionPropType,
        contributors: shape({
            data: contributorOptionsPropType.isRequired,
            fetching: bool.isRequired,
            error: string,
        }).isRequired,
        facilityListsCount: number,
        facilityLists: shape({
            data: arrayOf(facilityListPropType),
            fetching: bool.isRequired,
            error: string,
        }).isRequired,
    }).isRequired,
    history: shape({
        replace: func.isRequired,
    }).isRequired,
    fetchContributors: func.isRequired,
    setContributor: func.isRequired,
    fetchLists: func.isRequired,
};

function mapStateToProps({ dashboardLists }) {
    return { dashboardLists };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchContributors: () => dispatch(fetchDashboardListContributors()),
        setContributor: c => dispatch(setDashboardListContributor(c)),
        fetchLists: (opts = {}) => dispatch(fetchDashboardFacilityLists(opts)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardLists);
