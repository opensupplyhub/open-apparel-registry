import React from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import FacilityListItemsDetailedTableRowCell from './FacilityListItemsDetailedTableRowCell';
import CellElement from './CellElement';
import ShowOnly from './ShowOnly';

import {
    confirmFacilityListItemMatch,
    rejectFacilityListItemMatch,
} from '../actions/facilityListDetails';

import { facilityListItemPropType } from '../util/propTypes';

import { listTableCellStyles } from '../util/styles';

import { makeFacilityDetailLink } from '../util/util';

function FacilityListItemsConfirmationTableRow({
    item,
    makeConfirmMatchFunction,
    makeRejectMatchFunction,
    fetching,
    readOnly,
    className,
}) {
    return (
        <>
            <TableRow
                hover={false}
                style={{
                    background: '#dcfbff',
                    verticalAlign: 'top',
                    borderTop: '1px solid #e0e0e0',
                }}
                className={className}
            >
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.rowIndexStyles}
                >
                    <CellElement
                        item={item.row_index}
                    />
                </TableCell>
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.countryNameStyles}
                >
                    <CellElement
                        item={item.country_name || ' '}
                    />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.nameCellStyles}
                    colSpan={2}
                >
                    <CellElement
                        item={item.name || ' '}
                    />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.addressCellStyles}
                    colSpan={2}
                >
                    <CellElement
                        item={item.address || ' '}
                    />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.statusCellStyles}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title={item.status}
                        stringIsHidden
                        hasActions={false}
                        fetching={fetching}
                        readOnly={readOnly}
                        data={[]}
                    />
                </TableCell>
            </TableRow>
            <TableRow
                hover={false}
                style={{ background: '#dcfbff', verticalAlign: 'top', border: 0 }}
                className={className}
            >
                <TableCell
                    padding="default"
                    variant="head"
                    colSpan={2}
                />
                <TableCell
                    padding="default"
                    variant="head"
                    colSpan={2}
                    style={listTableCellStyles.headerCellStyles}
                >
                    <b>Facility Match Name</b>
                </TableCell>
                <TableCell
                    padding="default"
                    variant="head"
                    style={listTableCellStyles.headerCellStyles}
                    colSpan={2}
                >
                    <b>Facility Match Address</b>
                </TableCell>
                <TableCell
                    padding="default"
                    variant="head"
                    style={listTableCellStyles.headerCellStyles}
                >
                    <b>Actions</b>
                </TableCell>
            </TableRow>
            {item.matches.map(({
                id, status, address, oar_id, name, // eslint-disable-line camelcase
            }) => (
                <TableRow
                    hover={false}
                    style={{ background: '#dcfbff', verticalAlign: 'top' }}
                    className={className}
                    key={id}
                >
                    <TableCell
                        padding="default"
                        variant="head"
                        colSpan={2}
                    />
                    <TableCell
                        padding="default"
                        colSpan={2}
                        style={listTableCellStyles.nameCellStyles}
                    >
                        <CellElement
                            item={name}
                            linkURL={makeFacilityDetailLink(oar_id)}
                        />
                    </TableCell>
                    <TableCell
                        padding="default"
                        style={listTableCellStyles.addressCellStyles}
                        colSpan={2}
                    >
                        <CellElement
                            item={address}
                        />
                    </TableCell>
                    <TableCell
                        padding="default"
                        variant="head"
                        style={listTableCellStyles.headerCellStyles}
                    >
                        <ShowOnly when={!readOnly}>
                            {
                                <CellElement
                                    item={{
                                        confirmMatch: makeConfirmMatchFunction(id),
                                        rejectMatch: makeRejectMatchFunction(id),
                                        id,
                                        status,
                                        matchName: name,
                                        matchAddress: address,
                                        itemName: item.name,
                                        itemAddress: item.address,
                                    }}
                                    fetching={fetching}
                                    hasActions
                                    stringIsHidden
                                />
                            }
                        </ShowOnly>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

FacilityListItemsConfirmationTableRow.defaultProps = {
    readOnly: true,
};

FacilityListItemsConfirmationTableRow.propTypes = {
    item: facilityListItemPropType.isRequired,
    makeConfirmMatchFunction: func.isRequired,
    makeRejectMatchFunction: func.isRequired,
    fetching: bool.isRequired,
    readOnly: bool,
};

function mapStateToProps({
    facilityListDetails: {
        confirmOrRejectMatchOrRemoveItem: {
            fetching,
        },
    },
}) {
    return {
        fetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        makeConfirmMatchFunction: matchID =>
            () => dispatch(confirmFacilityListItemMatch(matchID)),
        makeRejectMatchFunction: matchID =>
            () => dispatch(rejectFacilityListItemMatch(matchID)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityListItemsConfirmationTableRow);
