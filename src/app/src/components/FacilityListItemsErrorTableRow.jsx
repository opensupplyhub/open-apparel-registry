import React, { memo } from 'react';
import { arrayOf, bool, func, number, oneOfType, string } from 'prop-types';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import isEqual from 'lodash/isEqual';

import FacilityListItemsDetailedTableRowCell from './FacilityListItemsDetailedTableRowCell';

import { listTableCellStyles } from '../util/styles';

import { facilityListItemStatusPropType } from '../util/propTypes';

const propsAreEqual = (prevProps, nextProps) =>
    isEqual(prevProps, nextProps)
    && isEqual(prevProps.errors, nextProps.errors);

const FacilityListItemsErrorTableRow = memo(({
    rowIndex,
    countryCode,
    name,
    address,
    status,
    hover,
    errors,
    handleSelectRow,
}) => (
    <TableRow
        hover={hover}
        onClick={handleSelectRow}
    >
        <TableCell
            align="center"
            padding="dense"
            style={listTableCellStyles.rowIndexStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={rowIndex}
                hrIsHidden
                stringIsHidden
                data={errors}
                hasActions={false}
            />
        </TableCell>
        <TableCell
            align="center"
            padding="dense"
            style={listTableCellStyles.countryCodeStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={countryCode}
                hrIsHidden
                stringIsHidden
                data={errors}
                hasActions={false}
            />
        </TableCell>
        <TableCell
            padding="none"
            style={listTableCellStyles.nameCellStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={name}
                subtitle="Errors"
                hrIsHidden={false}
                stringIsHidden={false}
                data={errors}
                hasActions={false}
                errorState
            />
        </TableCell>
        <TableCell
            padding="none"
            style={listTableCellStyles.addressCellStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={address}
                hrIsHidden
                stringIsHidden
                data={errors}
                hasActions={false}
            />
        </TableCell>
        <TableCell
            padding="none"
            style={listTableCellStyles.statusCellStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={status}
                hrIsHidden
                stringIsHidden
                data={errors}
                hasActions={false}
            />
        </TableCell>
    </TableRow>
), propsAreEqual);

FacilityListItemsErrorTableRow.defaultProps = {
    hover: false,
};

FacilityListItemsErrorTableRow.propTypes = {
    rowIndex: oneOfType([number, string]).isRequired,
    countryCode: string.isRequired,
    name: string.isRequired,
    status: facilityListItemStatusPropType.isRequired,
    hover: bool,
    errors: arrayOf(string.isRequired).isRequired,
    handleSelectRow: func.isRequired,
};

export default FacilityListItemsErrorTableRow;
