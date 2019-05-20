import React, { Component } from 'react';
import { arrayOf, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import ReactSelect from 'react-select';
import ShowOnly from './ShowOnly';

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
    facilityListStatusFilterChoices,
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
    statusFilterStyles: Object.freeze({
        padding: '20px 0 0 20px',
    }),
    statusFilterSelectStyles: Object.freeze({
        display: 'inline-block',
        width: '40%',
    }),
    statusFilterMessageStyles: Object.freeze({
        padding: '0 0 0 20px',
    }),
});

const createSelectedStatusChoicesFromParams = (params) => {
    if (params && params.status) {
        return params.status.map(x => ({ label: x, value: x }));
    }
    return null;
};


class FacilityListItemsTable extends Component {
    componentDidUpdate(prevProps) {
        const {
            items,
            fetchListItems,
            match: {
                params: {
                    listID,
                },
            },
            history: {
                location: {
                    search,
                },
            },
        } = this.props;

        const params = createParamsFromQueryString(search);
        if (params.status
            && params.status.includes(facilityListItemStatusChoicesEnum.POTENTIAL_MATCH)
            && items
            && prevProps.items) {
            const previousPotentialMatchCount = prevProps
                .items
                .filter(x => x.status === facilityListItemStatusChoicesEnum.POTENTIAL_MATCH)
                .length;
            const currentPotentialMatchCount = items
                .filter(x => x.status === facilityListItemStatusChoicesEnum.POTENTIAL_MATCH)
                .length;
            if (previousPotentialMatchCount !== currentPotentialMatchCount) {
                const {
                    page,
                    rowsPerPage,
                } = createPaginationOptionsFromQueryString(search);
                fetchListItems(listID, page, rowsPerPage, params);
            }
        }
    }

    handleChangePage = (_, newPage) => {
        const {
            fetchListItems,
            match: {
                params: {
                    listID,
                },
            },
            history: {
                replace,
                location: {
                    search,
                },
            },
        } = this.props;

        const {
            rowsPerPage,
        } = createPaginationOptionsFromQueryString(search);

        const params = createParamsFromQueryString(search);

        replace(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            (newPage + 1),
            rowsPerPage,
            params,
        ));
        fetchListItems(listID, newPage + 1, rowsPerPage, params);
    }

    handleChangeRowsPerPage = (e) => {
        const {
            fetchListItems,
            match: {
                params: {
                    listID,
                },
            },
            history: {
                replace,
                location: {
                    search,
                },
            },
        } = this.props;

        const { page } = createPaginationOptionsFromQueryString(search);

        const params = createParamsFromQueryString(search);

        replace(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            page,
            getValueFromEvent(e),
            params,
        ));
        fetchListItems(listID, page, getValueFromEvent(e), params);
    }

    handleChangeStatusFilter = (selected) => {
        const {
            fetchListItems,
            match: {
                params: {
                    listID,
                },
            },
            history: {
                replace,
                location: {
                    search,
                },
            },
        } = this.props;

        const { rowsPerPage } = createPaginationOptionsFromQueryString(search);
        const params = createParamsFromQueryString(search);
        const newParams = update(params, {
            status: { $set: selected ? selected.map(x => x.value) : null },
        });

        replace(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            1,
            rowsPerPage,
            newParams,
        ));
        fetchListItems(listID, 1, rowsPerPage, newParams);
    }

    handleShowAllClicked = () => {
        const {
            fetchListItems,
            match: {
                params: {
                    listID,
                },
            },
            history: {
                replace,
                location: {
                    search,
                },
            },
        } = this.props;

        const { rowsPerPage } = createPaginationOptionsFromQueryString(search);
        const params = createParamsFromQueryString(search);

        const newParams = update(params, {
            $unset: ['status'],
        });
        replace(makePaginatedFacilityListItemsDetailLinkWithRowCount(
            listID,
            1,
            rowsPerPage,
            newParams,
        ));
        fetchListItems(listID, 1, rowsPerPage, newParams);
    }

    render() {
        const {
            list,
            items,
            filteredCount,
            fetchingItems,
            selectedFacilityListItemsRowIndex,
            makeSelectListItemTableRowFunction,
            match: {
                params: {
                    listID,
                },
            },
            history: {
                location: {
                    search,
                },
            },
        } = this.props;

        const {
            page,
            rowsPerPage,
        } = createPaginationOptionsFromQueryString(search);

        const params = createParamsFromQueryString(search);

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
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        page={page - 1}
                        onChangePage={this.handleChangePage}
                        component="div"
                    />
                </Grid>
            </Grid>
        );

        const listIsEmpty = !fetchingItems && items && items.length === 0;

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
                <div style={facilityListItemsTableStyles.statusFilterStyles}>
                    <div style={facilityListItemsTableStyles.statusFilterSelectStyles}>
                        <ReactSelect
                            isMulti
                            id="listItemStatus"
                            name="listItemStatus"
                            classNamePrefix="select"
                            options={facilityListStatusFilterChoices}
                            placeholder="Filter by item status..."
                            value={createSelectedStatusChoicesFromParams(params)}
                            onChange={this.handleChangeStatusFilter}
                        />
                    </div>
                    <ShowOnly when={!!(params && params.status)}>
                        <span style={facilityListItemsTableStyles.statusFilterMessageStyles}>
                            Showing {filteredCount} of {list.item_count} items.
                        </span>
                        <Button color="primary" onClick={this.handleShowAllClicked}>
                            Show all items
                        </Button>
                    </ShowOnly>
                </div>
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
                            <ShowOnly when={listIsEmpty}>
                                <TableRow>
                                    <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                        No matching items.
                                    </TableCell>
                                </TableRow>
                            </ShowOnly>
                        </TableBody>
                    </Table>
                </div>
                {paginationControlsRow}
            </Paper>
        );
    }
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
