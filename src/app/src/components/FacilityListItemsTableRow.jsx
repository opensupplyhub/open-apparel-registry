import React, { memo } from 'react';
import { bool, func, number, oneOfType, string } from 'prop-types';
import { Link } from 'react-router-dom';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import isEqual from 'lodash/isEqual';

import { facilityListItemStatusPropType } from '../util/propTypes';

import { listTableCellStyles } from '../util/styles';

import { makeFacilityDetailLink } from '../util/util';

import TruncateTooltip from './TruncateTooltip';

const propsAreEqual = (prevProps, nextProps) =>
    isEqual(prevProps.rowIndex, nextProps.rowIndex)
    && isEqual(prevProps.countryCode, nextProps.countryCode)
    && isEqual(prevProps.name, nextProps.name)
    && isEqual(prevProps.address, nextProps.address)
    && isEqual(prevProps.status, nextProps.status)
    && isEqual(prevProps.hover, nextProps.hover)
    && isEqual(prevProps.newFacility, nextProps.newFacility)
    && isEqual(prevProps.oarID, nextProps.oarID);

const FacilityListItemsTableRow = memo(({
    rowIndex,
    countryName,
    name,
    address,
    status,
    hover,
    handleSelectRow,
    newFacility,
    oarID,
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
        >
            {
                (newFacility && oarID)
                    ? (
                        <Link
                            to={makeFacilityDetailLink(oarID)}
                            href={makeFacilityDetailLink(oarID)}
                        >
                            {name}
                        </Link>)
                    : name
            }
        </TableCell>
        <TableCell
            padding="default"
            style={listTableCellStyles.addressCellStyles}
        >
            <TruncateTooltip truncate={address} />
        </TableCell>
        <TableCell
            padding="default"
            style={listTableCellStyles.statusCellStyles}
        >
            {
                newFacility
                    ? 'NEW_FACILITY'
                    : status
            }
        </TableCell>
    </TableRow>
), propsAreEqual);

FacilityListItemsTableRow.defaultProps = {
    hover: false,
    handleSelectRow: null,
    newFacility: false,
    oarID: null,
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
};

export default FacilityListItemsTableRow;
