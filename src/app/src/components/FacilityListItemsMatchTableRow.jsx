import React from 'react';
import { bool, func, number, oneOfType, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import FacilityListItemsDetailedTableRowCell from './FacilityListItemsDetailedTableRowCell';
import { listTableCellStyles } from '../util/styles';
import { makeFacilityDetailLink } from '../util/util';
import { facilityListItemStatusPropType } from '../util/propTypes';

const makeTableRowStyle = isRemoved => {
    if (isRemoved) {
        return Object.freeze({
            opacity: '0.6',
            verticalAlign: 'top',
            cursor: 'pointer',
            textDecoration: 'line-through',
        });
    }

    return Object.freeze({
        verticalAlign: 'top',
        cursor: 'pointer',
        background: '#f3f3f3',
        borderColor: '#f3f3f3',
    });
};

const FacilityListItemsMatchTableRow = ({
    rowIndex,
    countryName,
    name,
    address,
    status,
    hover,
    matchedFacility,
    handleSelectRow,
    isRemoved,
    handleRemoveItem,
    removeButtonDisabled,
    removeButtonID,
    className,
}) => (
    <>
        <TableRow
            hover={hover}
            onClick={handleSelectRow}
            style={makeTableRowStyle(isRemoved)}
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
                    data={[matchedFacility.oar_id]}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                align="center"
                padding="default"
                style={listTableCellStyles.countryNameStyles}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={countryName || ' '}
                    stringIsHidden
                    data={[matchedFacility.oar_id]}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.nameCellStyles}
                colSpan={2}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={name || ' '}
                    stringIsHidden
                    data={[matchedFacility.name]}
                    hasActions={false}
                />
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.addressCellStyles}
                colSpan={2}
            >
                <FacilityListItemsDetailedTableRowCell
                    title={address || ' '}
                    stringIsHidden
                    data={[matchedFacility.address]}
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
                    data={[matchedFacility.oar_id]}
                    hasActions={false}
                    isRemoved={isRemoved}
                    handleRemoveItem={handleRemoveItem}
                    removeButtonDisabled={removeButtonDisabled}
                    removeButtonID={removeButtonID}
                />
            </TableCell>
        </TableRow>
        <TableRow
            onClick={handleSelectRow}
            style={makeTableRowStyle(isRemoved)}
            className={`${className} STATUS_MATCHED_EXPANDED--SUB-ROW`}
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
                {matchedFacility ? (
                    <>
                        <b>Facility Match Name</b>
                        <br />
                        <Link
                            to={makeFacilityDetailLink(matchedFacility.oar_id)}
                            href={makeFacilityDetailLink(
                                matchedFacility.oar_id,
                            )}
                        >
                            {matchedFacility.name}
                        </Link>
                    </>
                ) : (
                    ''
                )}
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.addressCellStyles}
                colSpan={2}
            >
                {matchedFacility ? (
                    <>
                        <b>Facility Match Address</b>
                        <br />
                        {matchedFacility.address}
                    </>
                ) : (
                    ''
                )}
            </TableCell>
            <TableCell
                padding="default"
                style={listTableCellStyles.statusCellStyles}
            />
        </TableRow>
    </>
);

FacilityListItemsMatchTableRow.defaultProps = {
    hover: false,
    isRemoved: false,
    handleRemoveItem: null,
    removeButtonDisabled: true,
    removeButtonID: null,
};

FacilityListItemsMatchTableRow.propTypes = {
    rowIndex: oneOfType([number, string]).isRequired,
    countryName: string.isRequired,
    name: string.isRequired,
    status: facilityListItemStatusPropType.isRequired,
    hover: bool,
    matchedFacility: shape({
        oar_id: string.isRequired,
        address: string.isRequired,
        name: string.isRequired,
    }).isRequired,
    handleSelectRow: func.isRequired,
    isRemoved: bool,
    handleRemoveItem: func,
    removeButtonDisabled: bool,
    removeButtonID: string,
};

export default FacilityListItemsMatchTableRow;
