import React from 'react';
import { arrayOf, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import FacilityListItemsTableRow from './FacilityListItemsTableRow';
import FacilityListItemsConfirmationTableRow from './FacilityListItemsConfirmationTableRow';
import FacilityListItemsErrorTableRow from './FacilityListItemsErrorTableRow';
import FacilityListItemsMatchTableRow from './FacilityListItemsMatchTableRow';

import { facilityListItemPropType } from '../util/propTypes';

import { setSelectedFacilityListItemsRowIndex } from '../actions/facilityListDetails';

import {
    makePaginatedFacilityListItemsDetailLinkWithRowCount,
    getValueFromEvent,
    makeSliceArgumentsForTablePagination,
    createPaginationOptionsFromQueryString,
} from '../util/util';

import {
    rowsPerPageOptions,
    facilityListItemStatusChoicesEnum,
} from '../util/constants';

const facilityListItemsTableStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        marginBottom: '80px',
    }),
    tableWrapperStyles: Object.freeze({
        overflowX: 'auto',
    }),
});

function FacilityListItemsTable({
    items,
    selectedFacilityListItemsRowIndex,
    makeSelectListItemTableRowFunction,
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

    const handleChangePage = (_, newPage) =>
        push(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            (newPage + 1),
            rowsPerPage,
        ));

    const handleChangeRowsPerPage = e =>
        push(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            page,
            getValueFromEvent(e),
        ));

    const paginatedItems = items
        .slice(...makeSliceArgumentsForTablePagination(page - 1, rowsPerPage));

    const paginationControlsRow = (
        <TableRow>
            <TablePagination
                count={items.length}
                rowsPerPage={Number(rowsPerPage)}
                rowsPerPageOptions={rowsPerPageOptions}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                page={page - 1}
                onChangePage={handleChangePage}
            />
        </TableRow>
    );

    const tableRows = paginatedItems
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

            if (item.row_index !== selectedFacilityListItemsRowIndex) {
                return (
                    <FacilityListItemsTableRow
                        key={item.row_index}
                        rowIndex={item.row_index}
                        countryCode={item.country_code}
                        name={item.name}
                        address={item.address}
                        status={item.status}
                        handleSelectRow={handleSelectRow}
                        hover
                    />
                );
            }

            if (item.status === facilityListItemStatusChoicesEnum.ERROR) {
                return (
                    <FacilityListItemsErrorTableRow
                        key={item.row_index}
                        rowIndex={item.row_index}
                        countryCode={item.country_code}
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
                        countryCode={item.country_code}
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
                    countryCode={item.country_code}
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
            <div style={facilityListItemsTableStyles.tableWrapperStyles}>
                <Table>
                    <TableHead>
                        {paginationControlsRow}
                        <FacilityListItemsTableRow
                            rowIndex="CSV Row Index"
                            countryCode="Country Code"
                            name="Name"
                            address="Address"
                            status="Status"
                            hover={false}
                        />
                    </TableHead>
                    <TableBody>
                        {tableRows}
                    </TableBody>
                    <TableFooter>
                        {paginationControlsRow}
                    </TableFooter>
                </Table>
            </div>
        </Paper>
    );
}

FacilityListItemsTable.propTypes = {
    items: arrayOf(facilityListItemPropType).isRequired,
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
        data: {
            items,
        },
        selectedFacilityListItemsRowIndex,
    },
}) {
    return {
        items,
        selectedFacilityListItemsRowIndex,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        makeSelectListItemTableRowFunction: rowIndex =>
            () => dispatch(setSelectedFacilityListItemsRowIndex(rowIndex)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityListItemsTable);
