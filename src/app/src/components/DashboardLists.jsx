import React, { useEffect } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import ReactSelect from 'react-select';
import { connect } from 'react-redux';

import sum from 'lodash/sum';
import moment from 'moment';

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import FacilityListsTooltipTableCell from './FacilityListsTooltipTableCell';
import ShowOnly from './ShowOnly';

import {
    fetchDashboardListContributors,
    fetchDashboardFacilityLists,
    setDashboardListContributor,
} from '../actions/dashboardLists';

import {
    facilitiesListTableTooltipTitles,
} from '../util/constants';

import {
    contributorOptionPropType,
    contributorOptionsPropType,
    facilityListPropType,
} from '../util/propTypes';

import {
    getContributorFromQueryString,
    makeDashboardContributorListLink,
    makeFacilityListItemsDetailLink,
} from '../util/util';

const CONTRIBUTORS = 'CONTRIBUTORS';

const styles = {
    container: {
        marginBottom: '60px',
        width: '100%',
    },
    filterRow: {
        padding: '20px',
        display: 'flex',
    },
    filterContributors: {
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

function DashboardLists({
    dashboardLists: { contributor, contributors, facilityLists },
    history: { location: { search }, push, replace },
    fetchContributors,
    setContributor,
    fetchLists,
}) {
    useEffect(() => {
        // If contributors have not been initialized, fetch them
        if (!contributors.data.length && !contributors.fetching) {
            fetchContributors();
        }

        if (contributor) {
            // If contributor is already set, e.g. when coming back from a
            // list detail view, ensure it is reflected in URL

            replace(makeDashboardContributorListLink(contributor.value));
        } else {
            // If contributor is not set, but an ID is present in the URL,
            // e.g. when following a link or refreshing the page after
            // selecting a contributor, set the contributor and fetch its lists

            const contributorID = getContributorFromQueryString(search);

            if (contributorID && contributors.data.length && !contributors.fetching) {
                setContributor(contributors.data.find(c => c.value === contributorID));
                if (!facilityLists.fetching) {
                    fetchLists(contributorID);
                }
            }
        }
    }, [
        contributor,
        contributors.data,
        contributors.fetching,
        search,
        facilityLists.fetching,
        replace,
        fetchContributors,
        setContributor,
        fetchLists,
    ]);

    const onContributorUpdate = (c) => {
        replace(makeDashboardContributorListLink(c.value));
        setContributor(c);
        fetchLists(c.value);
    };

    const when = {
        noContributorSelected: contributor === null,
        contributorHasNoLists: contributor !== null
            && !facilityLists.fetching
            && facilityLists.data.length === 0,
    };

    return (
        <Paper style={styles.container}>
            <div style={styles.filterRow}>
                <div style={styles.filterContributors}>
                    <ReactSelect
                        id={CONTRIBUTORS}
                        name={CONTRIBUTORS}
                        classNamePrefix="select"
                        options={contributors.data}
                        placeholder="Select a contributor..."
                        value={contributor}
                        onChange={onContributorUpdate}
                        disabled={
                            contributors.fetching || facilityLists.fetching
                        }
                        styles={{
                            control: provided => ({
                                ...provided,
                                height: '56px',
                            }),
                        }}
                        theme={theme => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary: '#00319D',
                            },
                        })}
                    />
                </div>
            </div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Date Created
                        </TableCell>
                        <TableCell>
                            Name
                        </TableCell>
                        <TableCell>
                            Description
                        </TableCell>
                        <TableCell>
                            File Name
                        </TableCell>
                        <TableCell padding="dense">
                            Total
                        </TableCell>
                        <TableCell padding="dense">
                            Matched
                        </TableCell>
                        <TableCell padding="dense">
                            Error
                        </TableCell>
                        <TableCell padding="dense">
                            Potential Match
                        </TableCell>
                        <TableCell padding="dense">
                            Active
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        facilityLists.data.map(list => (
                            <TableRow
                                key={list.id}
                                hover
                                onClick={() => push(makeFacilityListItemsDetailLink(list.id))}
                                style={
                                    list.is_active
                                        ? styles.activeList
                                        : styles.inactiveList
                                }
                            >
                                <TableCell>
                                    {moment(list.created_at).format('L')}
                                </TableCell>
                                <TableCell>
                                    {list.name}
                                </TableCell>
                                <TableCell>
                                    {list.description}
                                </TableCell>
                                <TableCell>
                                    {list.file_name}
                                </TableCell>
                                <FacilityListsTooltipTableCell
                                    tooltipTitle={facilitiesListTableTooltipTitles.total}
                                    tableCellText={list.item_count}
                                />
                                <FacilityListsTooltipTableCell
                                    tooltipTitle={facilitiesListTableTooltipTitles.matched}
                                    tableCellText={
                                        sum([
                                            list.status_counts.MATCHED,
                                            list.status_counts.CONFIRMED_MATCH,
                                        ])
                                    }
                                />
                                <FacilityListsTooltipTableCell
                                    tooltipTitle={facilitiesListTableTooltipTitles.error}
                                    tableCellText={
                                        sum([
                                            list.status_counts.ERROR,
                                            list.status_counts.ERROR_PARSING,
                                            list.status_counts.ERROR_GEOCODING,
                                            list.status_counts.ERROR_MATCHING,
                                        ])
                                    }
                                />
                                <FacilityListsTooltipTableCell
                                    tooltipTitle={
                                        facilitiesListTableTooltipTitles.potentialMatch
                                    }
                                    tableCellText={list.status_counts.POTENTIAL_MATCH}
                                />
                                <TableCell padding="dense">
                                    {list.is_active ? 'Active' : 'Inactive'}
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    <ShowOnly when={when.noContributorSelected}>
                        <TableRow>
                            <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                                Select a contributor to see their lists.
                            </TableCell>
                        </TableRow>
                    </ShowOnly>
                    <ShowOnly when={when.contributorHasNoLists}>
                        <TableRow>
                            <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                                This contributor has no lists.
                            </TableCell>
                        </TableRow>
                    </ShowOnly>
                </TableBody>
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
        facilityLists: shape({
            data: arrayOf(facilityListPropType).isRequired,
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
        fetchLists: c => dispatch(fetchDashboardFacilityLists(c)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardLists);
