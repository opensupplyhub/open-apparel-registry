import React from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

import { facilityListItemPropType } from '../util/propTypes';

import {
    makePaginatedFacilityListItemsDetailLinkWithRowCount,
    getValueFromEvent,
    makeSliceArgumentsForTablePagination,
    createPaginationOptionsFromQueryString,
} from '../util/util';

import { rowsPerPageOptions } from '../util/constants';

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

    return (
        <Paper style={facilityListItemsTableStyles.containerStyles}>
            <div style={facilityListItemsTableStyles.tableWrapperStyles}>
                <Table>
                    <TableHead>
                        {paginationControlsRow}
                        <TableRow>
                            <TableCell>
                                CSV Row Index
                            </TableCell>
                            <TableCell>
                                Country
                            </TableCell>
                            <TableCell>
                                Name
                            </TableCell>
                            <TableCell>
                                Address
                            </TableCell>
                            <TableCell>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            paginatedItems
                                .map(item => (
                                    <TableRow
                                        key={item.row_index}
                                        hover
                                    >
                                        <TableCell>
                                            {item.row_index}
                                        </TableCell>
                                        <TableCell>
                                            {item.country_code}
                                        </TableCell>
                                        <TableCell>
                                            {item.name}
                                        </TableCell>
                                        <TableCell>
                                            {item.address}
                                        </TableCell>
                                        <TableCell>
                                            {item.status}
                                        </TableCell>
                                    </TableRow>))
                        }
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
};

function mapStateToProps({
    facilityListDetails: {
        data: {
            items,
        },
    },
}) {
    return {
        items,
    };
}

export default connect(mapStateToProps)(FacilityListItemsTable);
