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
    countryName,
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
        style={{ verticalAlign: 'top' }}
    >
        <TableCell
            align="center"
            padding="default"
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
            padding="default"
            style={listTableCellStyles.countryNameStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={countryName}
                hrIsHidden
                stringIsHidden
                data={errors}
                hasActions={false}
            />
        </TableCell>
        <TableCell
            padding="default"
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
            padding="default"
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
            padding="default"
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
    countryName: string.isRequired,
    name: string.isRequired,
    status: facilityListItemStatusPropType.isRequired,
    hover: bool,
    errors: arrayOf(string.isRequired).isRequired,
    handleSelectRow: func.isRequired,
};

export default FacilityListItemsErrorTableRow;
