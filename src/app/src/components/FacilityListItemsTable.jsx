import React, { Component } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
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
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import ReactSelect from 'react-select';
import noop from 'lodash/noop';
import get from 'lodash/get';
import includes from 'lodash/includes';

import ShowOnly from './ShowOnly';
import FacilityListItemsFilterSearch from './FacilityListItemsFilterSearch';
import FacilityListItemsTableRow from './FacilityListItemsTableRow';
import FacilityListItemsConfirmationTableRow from './FacilityListItemsConfirmationTableRow';
import FacilityListItemsErrorTableRow from './FacilityListItemsErrorTableRow';
import FacilityListItemsMatchTableRow from './FacilityListItemsMatchTableRow';

import { facilityListItemPropType } from '../util/propTypes';

import {
    setSelectedFacilityListItemsRowIndex,
    fetchFacilityListItems,
    removeFacilityListItem,
} from '../actions/facilityListDetails';

import {
    makePaginatedFacilityListItemsDetailLinkWithRowCount,
    getValueFromEvent,
    createPaginationOptionsFromQueryString,
    createParamsFromQueryString,
    makeFacilityListSummaryStatus,
    anyListItemMatchesAreInactive,
    getIDFromEvent,
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
    searchFilterStyles: Object.freeze({
        marginRight: '5px',
    }),
    statusFilterStyles: Object.freeze({
        padding: '10px 20px 0 20px',
        display: 'flex',
        alignItems: 'center',
    }),
    statusFilterSelectStyles: Object.freeze({
        flex: '2',
    }),
    statusFilterMessageStyles: Object.freeze({
        padding: '0 0 0 20px',
    }),
    dialogTextStyles: Object.freeze({
        fontSize: '20px',
    }),
});

const REMOVE_BUTTON_ID = 'REMOVE_BUTTON_ID';

const createSelectedStatusChoicesFromParams = params => {
    if (params && params.status) {
        return params.status.map(x => ({ label: x, value: x }));
    }
    return null;
};

class FacilityListItemsTable extends Component {
    state = {
        listItemToRemove: null,
    };

    componentDidUpdate(prevProps) {
        const {
            items,
            fetchListItems,
            match: {
                params: { listID },
            },
            history: {
                location: { search },
            },
            isRemovingItem,
            errorRemovingItem,
        } = this.props;

        if (!isRemovingItem && prevProps.isRemovingItem && !errorRemovingItem) {
            this.handleCloseRemoveDialog();
        }

        const params = createParamsFromQueryString(search);
        if (
            params.status &&
            params.status.includes(
                facilityListItemStatusChoicesEnum.POTENTIAL_MATCH,
            ) &&
            items &&
            prevProps.items
        ) {
            const previousPotentialMatchCount = prevProps.items.filter(
                x =>
                    x.status ===
                    facilityListItemStatusChoicesEnum.POTENTIAL_MATCH,
            ).length;
            const currentPotentialMatchCount = items.filter(
                x =>
                    x.status ===
                    facilityListItemStatusChoicesEnum.POTENTIAL_MATCH,
            ).length;
            if (previousPotentialMatchCount !== currentPotentialMatchCount) {
                const {
                    page,
                    rowsPerPage,
                } = createPaginationOptionsFromQueryString(search);
                fetchListItems(listID, page, rowsPerPage, params, true);
            }
        }
    }

    handleChangePage = (_, newPage) => {
        const {
            fetchListItems,
            match: {
                params: { listID },
            },
            history: {
                replace,
                location: { search },
            },
        } = this.props;

        const { rowsPerPage } = createPaginationOptionsFromQueryString(search);

        const params = createParamsFromQueryString(search);

        replace(
            makePaginatedFacilityListItemsDetailLinkWithRowCount(
                listID,
                newPage + 1,
                rowsPerPage,
                params,
            ),
        );
        fetchListItems(listID, newPage + 1, rowsPerPage, params);
    };

    handleChangeRowsPerPage = e => {
        const {
            fetchListItems,
            match: {
                params: { listID },
            },
            history: {
                replace,
                location: { search },
            },
        } = this.props;

        const { page } = createPaginationOptionsFromQueryString(search);

        const params = createParamsFromQueryString(search);

        replace(
            makePaginatedFacilityListItemsDetailLinkWithRowCount(
                listID,
                page,
                getValueFromEvent(e),
                params,
            ),
        );
        fetchListItems(listID, page, getValueFromEvent(e), params);
    };

    handleChangeSearchTerm = term => {
        const {
            fetchListItems,
            match: {
                params: { listID },
            },
            history: {
                replace,
                location: { search },
            },
        } = this.props;

        const { rowsPerPage } = createPaginationOptionsFromQueryString(search);
        const params = createParamsFromQueryString(search);
        const newParams = update(params, {
            search: { $set: term !== '' ? term : null },
        });

        replace(
            makePaginatedFacilityListItemsDetailLinkWithRowCount(
                listID,
                1,
                rowsPerPage,
                newParams,
            ),
        );
        fetchListItems(listID, 1, rowsPerPage, newParams);
    };

    handleChangeStatusFilter = selected => {
        const {
            fetchListItems,
            match: {
                params: { listID },
            },
            history: {
                replace,
                location: { search },
            },
        } = this.props;

        const { rowsPerPage } = createPaginationOptionsFromQueryString(search);
        const params = createParamsFromQueryString(search);
        const newParams = update(params, {
            status: { $set: selected ? selected.map(x => x.value) : null },
        });

        replace(
            makePaginatedFacilityListItemsDetailLinkWithRowCount(
                listID,
                1,
                rowsPerPage,
                newParams,
            ),
        );
        fetchListItems(listID, 1, rowsPerPage, newParams);
    };

    handleShowAllClicked = () => {
        const {
            fetchListItems,
            match: {
                params: { listID },
            },
            history: {
                replace,
                location: { search },
            },
        } = this.props;

        const { rowsPerPage } = createPaginationOptionsFromQueryString(search);
        const params = createParamsFromQueryString(search);

        const newParams = update(params, {
            $unset: ['status', 'search'],
        });
        replace(
            makePaginatedFacilityListItemsDetailLinkWithRowCount(
                listID,
                1,
                rowsPerPage,
                newParams,
            ),
        );
        fetchListItems(listID, 1, rowsPerPage, newParams);
    };

    handleRemoveButtonClick = listItemToRemove =>
        this.setState(state =>
            Object.assign({}, state, {
                listItemToRemove,
            }),
        );

    handleCloseRemoveDialog = () =>
        this.setState(state =>
            Object.assign({}, state, {
                listItemToRemove: null,
            }),
        );

    render() {
        const {
            list,
            items,
            filteredCount,
            fetchingItems,
            selectedFacilityListItemsRowIndex,
            makeSelectListItemTableRowFunction,
            makeRemoveFacilityListItemFunction,
            isRemovingItem,
            errorRemovingItem,
            match: {
                params: { listID },
            },
            history: {
                location: { search },
            },
            readOnly,
        } = this.props;

        const { listItemToRemove } = this.state;

        const { page, rowsPerPage } = createPaginationOptionsFromQueryString(
            search,
        );

        const params = createParamsFromQueryString(search);

        const paginationControlsRow = (
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                className="TABLE_PAGINATION"
            >
                <Grid
                    item
                    sm={12}
                    md={6}
                    style={facilityListItemsTableStyles.summaryStatusStyles}
                >
                    {makeFacilityListSummaryStatus(list.statuses)}
                </Grid>
                <Grid item sm={12} md={6}>
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

        const tableRows = fetchingItems
            ? []
            : items.map(item => {
                  const handleSelectRow = makeSelectListItemTableRowFunction(
                      item.row_index,
                  );

                  if (
                      item.status ===
                      facilityListItemStatusChoicesEnum.POTENTIAL_MATCH
                  ) {
                      return (
                          <FacilityListItemsConfirmationTableRow
                              key={item.row_index}
                              item={item}
                              listID={listID}
                              readOnly={readOnly}
                              isRemoved={anyListItemMatchesAreInactive(item)}
                              handleRemoveItem={() =>
                                  this.handleRemoveButtonClick(item)
                              }
                              removeButtonDisabled={isRemovingItem}
                              removeButtonID={REMOVE_BUTTON_ID}
                              className="STATUS_POTENTIAL_MATCH facility-list-row__expanded"
                          />
                      );
                  }

                  if (
                      (item.status ===
                          facilityListItemStatusChoicesEnum.MATCHED ||
                          item.status ===
                              facilityListItemStatusChoicesEnum.CONFIRMED_MATCH) &&
                      item.id === item.matched_facility.created_from_id
                  ) {
                      return (
                          <FacilityListItemsTableRow
                              key={item.row_index}
                              rowIndex={item.row_index}
                              countryName={item.country_name}
                              name={item.name}
                              address={item.address}
                              status={item.status}
                              handleSelectRow={null}
                              hover={false}
                              newFacility
                              oarID={item.matched_facility.oar_id}
                              isRemoved={anyListItemMatchesAreInactive(item)}
                              handleRemoveItem={() =>
                                  this.handleRemoveButtonClick(item)
                              }
                              removeButtonDisabled={isRemovingItem}
                              removeButtonID={REMOVE_BUTTON_ID}
                              className="STATUS_NEW_FACILITY"
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
                              isRemoved={anyListItemMatchesAreInactive(item)}
                              handleRemoveItem={() =>
                                  this.handleRemoveButtonClick(item)
                              }
                              removeButtonDisabled={isRemovingItem}
                              removeButtonID={REMOVE_BUTTON_ID}
                              className={`STATUS_MATCHED_COLLAPSED ${
                                  facilityListItemErrorStatuses.includes(
                                      item.status,
                                  )
                                      ? 'STATUS_ERROR'
                                      : ''
                              } STATUS_${item.status.toString()}`}
                          />
                      );
                  }

                  if (
                      item.status ===
                          facilityListItemStatusChoicesEnum.MATCHED ||
                      item.status ===
                          facilityListItemStatusChoicesEnum.CONFIRMED_MATCH
                  ) {
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
                              isRemoved={anyListItemMatchesAreInactive(item)}
                              handleRemoveItem={() =>
                                  this.handleRemoveButtonClick(item)
                              }
                              removeButtonDisabled={isRemovingItem}
                              removeButtonID={REMOVE_BUTTON_ID}
                              className="STATUS_MATCHED_EXPANDED facility-list-row__expanded"
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
                              className="STATUS_ERROR"
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
                          isRemoved={anyListItemMatchesAreInactive(item)}
                          className={`STATUS_${item.status}`}
                      />
                  );
              });

        return (
            <Paper style={facilityListItemsTableStyles.containerStyles}>
                <div style={facilityListItemsTableStyles.statusFilterStyles}>
                    <div
                        style={facilityListItemsTableStyles.searchFilterStyles}
                    >
                        <FacilityListItemsFilterSearch
                            currentValue={params.search || ''}
                            onSearch={this.handleChangeSearchTerm}
                        />
                    </div>
                    <div
                        style={
                            facilityListItemsTableStyles.statusFilterSelectStyles
                        }
                    >
                        <ReactSelect
                            isMulti
                            id="listItemStatus"
                            name="listItemStatus"
                            classNamePrefix="select"
                            options={facilityListStatusFilterChoices}
                            placeholder="Filter by item status..."
                            value={createSelectedStatusChoicesFromParams(
                                params,
                            )}
                            onChange={this.handleChangeStatusFilter}
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
                    <ShowOnly
                        when={!!(params && (params.status || params.search))}
                    >
                        <span
                            style={
                                facilityListItemsTableStyles.statusFilterMessageStyles
                            }
                        >
                            Showing {filteredCount} of {list.item_count} items.
                        </span>
                        <Button
                            color="primary"
                            onClick={this.handleShowAllClicked}
                        >
                            Show all items
                        </Button>
                    </ShowOnly>
                </div>
                {paginationControlsRow}
                <div
                    className="TABLE_WRAPPER"
                    style={facilityListItemsTableStyles.tableWrapperStyles}
                >
                    <Table style={{ tableLayout: 'fixed', minWidth: '1200px' }}>
                        <TableHead>
                            <FacilityListItemsTableRow
                                rowIndex="Row Index"
                                countryName="Country Name"
                                name="Name"
                                address="Address"
                                status="Status"
                                hover={false}
                                hideRemoveButton
                            />
                        </TableHead>
                        <TableBody>
                            {tableRows}
                            <ShowOnly when={listIsEmpty}>
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        style={{ textAlign: 'center' }}
                                    >
                                        No matching items.
                                    </TableCell>
                                </TableRow>
                            </ShowOnly>
                        </TableBody>
                    </Table>
                </div>
                {paginationControlsRow}
                <Dialog open={!!listItemToRemove}>
                    {listItemToRemove ? (
                        <>
                            <DialogTitle>
                                Remove {listItemToRemove.name}?
                            </DialogTitle>
                            <DialogContent>
                                <Typography
                                    style={
                                        facilityListItemsTableStyles.dialogTextStyles
                                    }
                                >
                                    Do you really want to remove this list item?
                                    The removed facility may still appear on the
                                    map, but it will no longer be associated
                                    with your contributor account.
                                </Typography>
                                <ul>
                                    <li>
                                        <Typography
                                            style={
                                                facilityListItemsTableStyles.dialogTextStyles
                                            }
                                        >
                                            Name: {listItemToRemove.name}
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography
                                            style={
                                                facilityListItemsTableStyles.dialogTextStyles
                                            }
                                        >
                                            Address: {listItemToRemove.address}
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography
                                            style={
                                                facilityListItemsTableStyles.dialogTextStyles
                                            }
                                        >
                                            Country:{' '}
                                            {listItemToRemove.country_name}
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography
                                            style={
                                                facilityListItemsTableStyles.dialogTextStyles
                                            }
                                        >
                                            Row Index:{' '}
                                            {listItemToRemove.row_index}
                                        </Typography>
                                    </li>
                                </ul>
                                {errorRemovingItem && errorRemovingItem.length && (
                                    <Typography>
                                        <span style={{ color: 'red' }}>
                                            An error prevented removing that
                                            list item.
                                        </span>
                                    </Typography>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={this.handleCloseRemoveDialog}
                                    disabled={isRemovingItem}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={makeRemoveFacilityListItemFunction(
                                        listID,
                                        listItemToRemove.id,
                                    )}
                                    disabled={isRemovingItem}
                                >
                                    Remove list item
                                </Button>
                            </DialogActions>
                        </>
                    ) : (
                        <div style={{ display: 'none' }} />
                    )}
                </Dialog>
            </Paper>
        );
    }
}

FacilityListItemsTable.defaultProps = {
    items: null,
    readOnly: false,
    errorRemovingItem: null,
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
    makeRemoveFacilityListItemFunction: func.isRequired,
    isRemovingItem: bool.isRequired,
    errorRemovingItem: arrayOf(string),
    readOnly: bool,
};

function mapStateToProps({
    facilityListDetails: {
        items: { data: items, fetching: fetchingItems },
        list: { data: list },
        filteredCount,
        selectedFacilityListItemsRowIndex,
        confirmOrRejectMatchOrRemoveItem: {
            fetching: isRemovingItem,
            error: errorRemovingItem,
        },
    },
    auth: {
        user: { user },
    },
}) {
    return {
        list,
        items,
        filteredCount,
        fetchingItems,
        isRemovingItem,
        errorRemovingItem,
        selectedFacilityListItemsRowIndex,
        readOnly:
            user &&
            user.is_superuser &&
            list &&
            user.contributor_id !== list.contributor_id,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        makeSelectListItemTableRowFunction: rowIndex => e => {
            // Quirkily, Material UI button clicks can happen on the label
            // and not only directly on the button.
            const buttonLabel = 'MuiButton-label-44';
            const clickLocationClassName = get(e, 'target.className', '');

            if (getIDFromEvent(e) === REMOVE_BUTTON_ID) {
                return noop();
            }

            if (includes(clickLocationClassName, buttonLabel)) {
                return noop();
            }

            return dispatch(setSelectedFacilityListItemsRowIndex(rowIndex));
        },
        fetchListItems: (listID, page, rowsPerPage, params, preventRefresh) =>
            dispatch(
                fetchFacilityListItems(
                    listID,
                    page,
                    rowsPerPage,
                    params,
                    preventRefresh,
                ),
            ),
        makeRemoveFacilityListItemFunction: (listID, listItemID) => () =>
            dispatch(removeFacilityListItem(listID, listItemID)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(FacilityListItemsTable);
