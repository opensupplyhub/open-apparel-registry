import React from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
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
    listID,
    fetching,
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
                    confirmMatch: makeConfirmMatchFunction(id, listID),
                    rejectMatch: makeRejectMatchFunction(id, listID),
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
        <TableRow hover={false}>
            <TableCell
                align="center"
                padding="dense"
                style={listTableCellStyles.rowIndexStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.row_index}
                    subtitle=" "
                    hrIsHidden
                    stringIsHidden
                    data={matchIDs}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                align="center"
                padding="dense"
                style={listTableCellStyles.countryCodeStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.country_code || ' '}
                    subtitle=" "
                    hrIsHidden
                    stringIsHidden
                    data={matchIDs}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                padding="none"
                style={listTableCellStyles.nameCellStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.name || ' '}
                    subtitle="Matched Name"
                    hrIsHidden={false}
                    stringisHidden={false}
                    data={matchNames}
                    hasActions={false}
                    linkURLs={matchOARIDs.map(makeFacilityDetailLink)}
                />
            </TableCell>
            <TableCell
                padding="none"
                style={listTableCellStyles.addressCellStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.address || ' '}
                    subtitle="Matched Address"
                    hrIsHidden={false}
                    stringIsHidden={false}
                    data={matchAddresses}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                padding="none"
                style={listTableCellStyles.statusCellStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.status}
                    subtitle="Actions"
                    hrIsHidden={false}
                    stringIsHidden={false}
                    data={matchConfirmOrRejectFunctions}
                    hasActions
                    fetching={fetching}
                />
            </TableCell>
        </TableRow>
    );
}

FacilityListItemsConfirmationTableRow.propTypes = {
    item: facilityListItemPropType.isRequired,
    makeConfirmMatchFunction: func.isRequired,
    makeRejectMatchFunction: func.isRequired,
    listID: string.isRequired,
    fetching: bool.isRequired,
};

function mapStateToProps({
    facilityListDetails: {
        confirmOrRejectMatch: {
            fetching,
        },
    },
}) {
    return {
        fetching,
    };
}

function mapDispatchToProps(dispatch, {
    item: {
        id: listItemID,
    },
}) {
    return {
        makeConfirmMatchFunction: (matchID, listID) =>
            () => dispatch(confirmFacilityListItemMatch(matchID, listID, listItemID)),
        makeRejectMatchFunction: (matchID, listID) =>
            () => dispatch(rejectFacilityListItemMatch(matchID, listID, listItemID)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityListItemsConfirmationTableRow);
