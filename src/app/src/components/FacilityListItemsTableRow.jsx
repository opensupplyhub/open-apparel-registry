import React, { memo } from 'react';
import { bool, func, number, oneOfType, string } from 'prop-types';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import isEqual from 'lodash/isEqual';

import { facilityListItemStatusPropType } from '../util/propTypes';

import { listTableCellStyles } from '../util/styles';

const propsAreEqual = (prevProps, nextProps) =>
    isEqual(prevProps.rowIndex, nextProps.rowIndex)
    && isEqual(prevProps.countryCode, nextProps.countryCode)
    && isEqual(prevProps.name, nextProps.name)
    && isEqual(prevProps.address, nextProps.address)
    && isEqual(prevProps.status, nextProps.status)
    && isEqual(prevProps.hover, nextProps.hover);

const FacilityListItemsTableRow = memo(({
    rowIndex,
    countryName,
    name,
    address,
    status,
    hover,
    handleSelectRow,
}) => (
    <TableRow
        hover={hover}
        onClick={handleSelectRow}
        style={
            handleSelectRow ?
                { cursor: 'pointer' }
                : null
        }
    >
        <TableCell
            align="center"
            padding="dense"
            style={listTableCellStyles.rowIndexStyles}
        >
            {rowIndex}
        </TableCell>
        <TableCell
            align="center"
            padding="dense"
            style={listTableCellStyles.countryNameStyles}
        >
            {countryName}
        </TableCell>
        <TableCell
            padding="none"
            style={listTableCellStyles.nameCellStyles}
        >
            {name}
        </TableCell>
        <TableCell
            padding="none"
            style={listTableCellStyles.addressCellStyles}
        >
            {address}
        </TableCell>
        <TableCell
            padding="none"
            style={listTableCellStyles.statusCellStyles}
        >
            {status}
        </TableCell>
    </TableRow>
), propsAreEqual);

FacilityListItemsTableRow.defaultProps = {
    hover: false,
    handleSelectRow: null,
};

FacilityListItemsTableRow.propTypes = {
    rowIndex: oneOfType([number, string]).isRequired,
    countryName: string.isRequired,
    name: string.isRequired,
    status: facilityListItemStatusPropType.isRequired,
    hover: bool,
    handleSelectRow: func,
};

export default FacilityListItemsTableRow;
