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
    className,
}) => (
    <>
        <TableRow
            hover={hover}
            onClick={handleSelectRow}
            style={{ verticalAlign: 'top' }}
            className={className}
        >
            <TableCell
                align="center"
                padding="default"
                style={listTableCellStyles.rowIndexStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={rowIndex}
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
                    stringIsHidden
                    data={errors}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.nameCellStyles}
                colSpan={2}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={name}
                    stringIsHidden
                    data={errors}
                    hasActions={false}
                    errorState
                />
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.addressCellStyles}
                colSpan={2}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={address}
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
                    stringIsHidden
                    data={errors}
                    hasActions={false}
                />
            </TableCell>
        </TableRow>
        <TableRow
            hover={hover}
            onClick={handleSelectRow}
            style={{ verticalAlign: 'top' }}
            className={`${className} STATUS_ERROR_EXPANDED--SUB-ROW`}
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
                {errors ? (
                    <>
                        <b>Errors</b><br />
                        <div style={{ color: 'red' }}>
                            {errors}
                        </div>
                    </>
                ) : ''}
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.addressCellStyles}
                colSpan={2}
            />
            <TableCell
                padding="default"
                style={listTableCellStyles.statusCellStyles}
            />
        </TableRow>
    </>
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
