import React from 'react';
import { bool, func } from 'prop-types';
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
    fetching,
    readOnly,
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
        <TableRow hover={false} style={{ background: '#e0e0e0', verticalAlign: 'top' }}>
            <TableCell
                align="center"
                padding="default"
                style={listTableCellStyles.rowIndexStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.row_index}
                    subtitle=" "
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
                    subtitle=" "
                    stringIsHidden
                    data={matchIDs}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.nameCellStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.name || ' '}
                    subtitle="Matched Name"
                    stringisHidden={false}
                    data={matchNames}
                    hasActions={false}
                    linkURLs={matchOARIDs.map(makeFacilityDetailLink)}
                />
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.addressCellStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={item.address || ' '}
                    subtitle="Matched Address"
                    stringIsHidden={false}
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
                    subtitle="Actions"
                    stringIsHidden={false}
                    data={matchConfirmOrRejectFunctions}
                    hasActions
                    fetching={fetching}
                    readOnly={readOnly}
                />
            </TableCell>
        </TableRow>
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
