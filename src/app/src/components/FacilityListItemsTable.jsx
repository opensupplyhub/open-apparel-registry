import React from 'react';
import { arrayOf, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TablePagination from '@material-ui/core/TablePagination';

import FacilityListItemsTableRow from './FacilityListItemsTableRow';
import FacilityListItemsConfirmationTableRow from './FacilityListItemsConfirmationTableRow';
import FacilityListItemsErrorTableRow from './FacilityListItemsErrorTableRow';
import FacilityListItemsMatchTableRow from './FacilityListItemsMatchTableRow';

import { facilityListItemPropType } from '../util/propTypes';

import {
    setSelectedFacilityListItemsRowIndex,
    fetchFacilityListItems,
} from '../actions/facilityListDetails';

import {
    makePaginatedFacilityListItemsDetailLinkWithRowCount,
    getValueFromEvent,
    createPaginationOptionsFromQueryString,
    createParamsFromQueryString,
    makeFacilityListSummaryStatus,
} from '../util/util';

import {
    rowsPerPageOptions,
    facilityListItemStatusChoicesEnum,
    facilityListItemErrorStatuses,
} from '../util/constants';

const facilityListItemsTableStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        marginBottom: '80px',
    }),
    tableWrapperStyles: Object.freeze({
        overflowX: 'auto',
    }),
    summaryStatusStyles: Object.freeze({
        fontSize: '1rem',
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.87)',
        padding: '20px',
        lineHeight: '1.2',
    }),
});

function FacilityListItemsTable({
    list,
    items,
    filteredCount,
    fetchingItems,
    selectedFacilityListItemsRowIndex,
    makeSelectListItemTableRowFunction,
    fetchListItems,
    match: {
        params: {
            listID,
        },
    },
    history: {
        push,
        location: {
            search,
        },
    },
}) {
    const {
        page,
        rowsPerPage,
    } = createPaginationOptionsFromQueryString(search);

    const params = createParamsFromQueryString(search);

    const handleChangePage = (_, newPage) => {
        push(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            (newPage + 1),
            rowsPerPage,
            params,
        ));
        fetchListItems(listID, newPage + 1, rowsPerPage, params);
    };

    const handleChangeRowsPerPage = (e) => {
        push(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            page,
            getValueFromEvent(e),
            params,
        ));
        fetchListItems(listID, page, getValueFromEvent(e), params);
    };

    const paginationControlsRow = (
        <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
        >
            <Grid
                item
                sm={12}
                md={6}
                style={facilityListItemsTableStyles.summaryStatusStyles}
            >
                {makeFacilityListSummaryStatus(list.statuses)}
            </Grid>
            <Grid
                item
                sm={12}
                md={6}
            >
                <TablePagination
                    count={filteredCount}
                    rowsPerPage={Number(rowsPerPage)}
                    rowsPerPageOptions={rowsPerPageOptions}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    page={page - 1}
                    onChangePage={handleChangePage}
                    component="div"
                />
            </Grid>
        </Grid>
    );

    const tableRows = fetchingItems ? [] : items
        .map((item) => {
            const handleSelectRow = makeSelectListItemTableRowFunction(item.row_index);

            if (item.status === facilityListItemStatusChoicesEnum.POTENTIAL_MATCH) {
                return (
                    <FacilityListItemsConfirmationTableRow
                        key={item.row_index}
                        item={item}
                        listID={listID}
                    />
                );
            }

            if ((item.status === facilityListItemStatusChoicesEnum.MATCHED
                 || item.status === facilityListItemStatusChoicesEnum.CONFIRMED_MATCH)
                && item.id === item.matched_facility.created_from_id) {
                return (
                    <FacilityListItemsTableRow
                        key={item.row_index}
                        rowIndex={item.row_index}
                        countryName={item.country_name}
                        name={item.name}
                        address={item.address}
                        status={item.status}
                        handleSelectRow={handleSelectRow}
                        hover={false}
                        newFacility
                        oarID={item.matched_facility.oar_id}
                    />
                );
            }

            if (item.row_index !== selectedFacilityListItemsRowIndex) {
                return (
                    <FacilityListItemsTableRow
                        key={item.row_index}
                        rowIndex={item.row_index}
                        countryName={item.country_name}
                        name={item.name}
                        address={item.address}
                        status={item.status}
                        handleSelectRow={handleSelectRow}
                        hover
                    />
                );
            }

            if (facilityListItemErrorStatuses.includes(item.status)) {
                return (
                    <FacilityListItemsErrorTableRow
                        key={item.row_index}
                        rowIndex={item.row_index}
                        countryName={item.country_name}
                        name={item.name}
                        address={item.address}
                        status={item.status}
                        errors={item.processing_errors}
                        handleSelectRow={handleSelectRow}
                    />
                );
            }

            if (item.status === facilityListItemStatusChoicesEnum.MATCHED
                || item.status === facilityListItemStatusChoicesEnum.CONFIRMED_MATCH) {
                return (
                    <FacilityListItemsMatchTableRow
                        key={item.row_index}
                        rowIndex={item.row_index}
                        countryName={item.country_name}
                        name={item.name}
                        address={item.address}
                        status={item.status}
                        matchedFacility={item.matched_facility}
                        handleSelectRow={handleSelectRow}
                    />
                );
            }

            return (
                <FacilityListItemsTableRow
                    key={item.row_index}
                    rowIndex={item.row_index}
                    countryName={item.country_name}
                    name={item.name}
                    address={item.address}
                    status={item.status}
                    handleSelectRow={handleSelectRow}
                    hover
                />
            );
        });

    return (
        <Paper style={facilityListItemsTableStyles.containerStyles}>
            {paginationControlsRow}
            <div style={facilityListItemsTableStyles.tableWrapperStyles}>
                <Table>
                    <TableHead>
                        <FacilityListItemsTableRow
                            rowIndex="CSV Row Index"
                            countryName="Country Name"
                            name="Name"
                            address="Address"
                            status="Status"
                            hover={false}
                        />
                    </TableHead>
                    <TableBody>
                        {tableRows}
                    </TableBody>
                </Table>
            </div>
            {paginationControlsRow}
        </Paper>
    );
}

FacilityListItemsTable.defaultProps = {
    items: null,
};

FacilityListItemsTable.propTypes = {
    items: arrayOf(facilityListItemPropType),
    filteredCount: number.isRequired,
    match: shape({
        params: shape({
            listID: string.isRequired,
        }),
    }).isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
    selectedFacilityListItemsRowIndex: number.isRequired,
    makeSelectListItemTableRowFunction: func.isRequired,
};

function mapStateToProps({
    facilityListDetails: {
        items: {
            data: items,
            fetching: fetchingItems,
        },
        list: {
            data: list,
        },
        filteredCount,
        selectedFacilityListItemsRowIndex,
    },

}) {
    return {
        list,
        items,
        filteredCount,
        fetchingItems,
        selectedFacilityListItemsRowIndex,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        makeSelectListItemTableRowFunction: rowIndex =>
            () => dispatch(setSelectedFacilityListItemsRowIndex(rowIndex)),
        fetchListItems: (listID, page, rowsPerPage, params) =>
            dispatch(fetchFacilityListItems(listID, page, rowsPerPage, params)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityListItemsTable);
