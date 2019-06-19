import React from 'react';
import { bool, func, number, oneOfType, shape, string } from 'prop-types';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import FacilityListItemsDetailedTableRowCell from './FacilityListItemsDetailedTableRowCell';

import { listTableCellStyles } from '../util/styles';

import { makeFacilityDetailLink } from '../util/util';

import { facilityListItemStatusPropType } from '../util/propTypes';

const makeTableRowStyle = (isRemoved) => {
    if (isRemoved) {
        return Object.freeze({
            opacity: '0.6',
            verticalAlign: 'top',
            cursor: 'pointer',
        });
    }

    return Object.freeze({
        verticalAlign: 'top',
        cursor: 'pointer',
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
}) => (
    <TableRow
        hover={hover}
        onClick={handleSelectRow}
        style={makeTableRowStyle(isRemoved)}
    >
        <TableCell
            align="center"
            padding="default"
            style={listTableCellStyles.rowIndexStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={rowIndex}
                subtitle=" "
                hrIsHidden
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
                subtitle=" "
                hrIsHidden
                stringIsHidden
                data={[matchedFacility.oar_id]}
                hasActions={false}
            />
        </TableCell>
        <TableCell
            padding="default"
            style={listTableCellStyles.nameCellStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={name || ' '}
                subtitle="Facility Match Name"
                hrIsHidden={false}
                stringisHidden={false}
                data={[matchedFacility.name]}
                linkURLs={[makeFacilityDetailLink(matchedFacility.oar_id)]}
                hasActions={false}
            />
        </TableCell>
        <TableCell
            padding="default"
            style={listTableCellStyles.addressCellStyles}
        >
            <FacilityListItemsDetailedTableRowCell
                title={address || ' '}
                subtitle="Facility Match Address"
                hrIsHidden={false}
                stringIsHidden={false}
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
                hrIsHidden
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
