import React from 'react';
import { bool, func, number, oneOfType, string } from 'prop-types';
import { Link } from 'react-router-dom';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import isFunction from 'lodash/isFunction';

import { facilityListItemStatusPropType } from '../util/propTypes';

import { listTableCellStyles } from '../util/styles';

import { makeFacilityDetailLink } from '../util/util';

const makeTableRowStyles = ({ handleSelectRow, isRemoved }) => ({
    cursor: isFunction(handleSelectRow) ? 'pointer' : 'auto',
    opacity: isRemoved ? '0.6' : '1.0',
    textDecoration: isRemoved ? 'line-through' : 'initial',
});

const FacilityListItemsTableRow = ({
    rowIndex,
    countryName,
    name,
    address,
    status,
    hover,
    handleSelectRow,
    newFacility,
    oarID,
    isRemoved,
    className,
}) => (
    <TableRow
        hover={hover}
        onClick={handleSelectRow}
        style={makeTableRowStyles({ handleSelectRow, isRemoved })}
        className={className}
    >
        <TableCell
            align="center"
            padding="default"
            style={listTableCellStyles.rowIndexStyles}
        >
            {rowIndex}
        </TableCell>
        <TableCell
            align="center"
            padding="default"
            style={listTableCellStyles.countryNameStyles}
        >
            {countryName}
        </TableCell>
        <TableCell
            padding="default"
            style={listTableCellStyles.nameCellStyles}
            colSpan={2}
        >
            {newFacility && oarID ? (
                <Link
                    to={makeFacilityDetailLink(oarID)}
                    href={makeFacilityDetailLink(oarID)}
                >
                    {name}
                </Link>
            ) : (
                name
            )}
        </TableCell>
        <TableCell
            padding="default"
            style={listTableCellStyles.addressCellStyles}
            colSpan={2}
        >
            {address}
        </TableCell>
        <TableCell
            padding="default"
            style={listTableCellStyles.statusCellStyles}
        >
            {(() => {
                if (isRemoved) {
                    return 'REMOVED';
                }

                return newFacility ? 'NEW_FACILITY' : status;
            })()}
        </TableCell>
    </TableRow>
);

FacilityListItemsTableRow.defaultProps = {
    hover: false,
    handleSelectRow: null,
    newFacility: false,
    oarID: null,
    isRemoved: false,
};

FacilityListItemsTableRow.propTypes = {
    rowIndex: oneOfType([number, string]).isRequired,
    countryName: string.isRequired,
    name: string.isRequired,
    status: facilityListItemStatusPropType.isRequired,
    hover: bool,
    handleSelectRow: func,
    newFacility: bool,
    oarID: string,
    isRemoved: bool,
};

export default FacilityListItemsTableRow;
