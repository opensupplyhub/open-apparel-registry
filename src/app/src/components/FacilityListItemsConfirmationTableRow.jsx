import React from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import FacilityListItemsDetailedTableRowCell from './FacilityListItemsDetailedTableRowCell';

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
    const [
        matchIDs,
        matchOARIDs,
        matchNames,
        matchAddresses,
        matchConfirmOrRejectFunctions,
    ] = item.matches.reduce(
        ([ids, oarIDs, names, addresses, confirmOrRejectFunctions], {
            id,
            oar_id, // eslint-disable-line camelcase
            name,
            address,
            status,
        }) =>
            Object.freeze([
                Object.freeze(ids.concat(id)),
                Object.freeze(oarIDs.concat(oar_id)),
                Object.freeze(names.concat(name)),
                Object.freeze(addresses.concat(address)),
                Object.freeze(confirmOrRejectFunctions.concat(Object.freeze({
                    confirmMatch: makeConfirmMatchFunction(id),
                    rejectMatch: makeRejectMatchFunction(id),
                    id,
                    status,
                    matchName: name,
                    matchAddress: address,
                    itemName: item.name,
                    itemAddress: item.address,
                }))),
            ]),
        Object.freeze([
            Object.freeze([]),
            Object.freeze([]),
            Object.freeze([]),
            Object.freeze([]),
            Object.freeze([]),
        ]),
    );

    return (
        <>
            <TableRow
                hover={false}
                style={{ background: '#dcfbff', verticalAlign: 'top' }}
                className={className}
            >
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.rowIndexStyles}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title={item.row_index}
                        stringIsHidden
                        data={matchIDs}
                        hasActions={false}
                    />
                </TableCell>
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.countryNameStyles}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title={item.country_name || ' '}
                        stringIsHidden
                        data={matchIDs}
                        hasActions={false}
                    />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.nameCellStyles}
                    colSpan={2}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title={item.name || ' '}
                        stringIsHidden
                        data={matchNames}
                        hasActions={false}
                    />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.addressCellStyles}
                    colSpan={2}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title={item.address || ' '}
                        stringIsHidden
                        data={matchAddresses}
                        hasActions={false}
                    />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.statusCellStyles}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title={item.status}
                        stringIsHidden
                        data={matchConfirmOrRejectFunctions}
                        hasActions={false}
                        fetching={fetching}
                        readOnly={readOnly}
                    />
                </TableCell>
            </TableRow>
            <TableRow
                hover={false}
                style={{ background: '#dcfbff', verticalAlign: 'top' }}
                className={`${className} STATUS_POTENTIAL_MATCH--SUB-ROW`}
            >
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.rowIndexStyles}
                />
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.countryNameStyles}
                />
                <TableCell
                    padding="default"
                    style={listTableCellStyles.nameCellStyles}
                    colSpan={2}
                >
                    {matchOARIDs ? (
                        <>
                            <b>Facility Match Name</b>
                            <br />
                            <Link
                                to={makeFacilityDetailLink(matchOARIDs)}
                                href={makeFacilityDetailLink(matchOARIDs)}
                            >
                                {matchNames}
                            </Link>
                        </>
                    ) : (
                        ' '
                    )}
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.addressCellStyles}
                    colSpan={2}
                >
                    {matchAddresses ? (
                        <>
                            <b>Facility Match Address</b>
                            <br />
                            {matchAddresses}
                        </>
                    ) : (
                        ' '
                    )}
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.statusCellStyles}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title
                        stringIsHidden
                        data={matchConfirmOrRejectFunctions}
                        hasActions
                        fetching={fetching}
                        readOnly={readOnly}
                    />
                </TableCell>
            </TableRow>
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
