import React from 'react';
import { bool } from 'prop-types';
import { connect } from 'react-redux';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import FacilityListItemsDetailedTableRowCell from './FacilityListItemsDetailedTableRowCell';
import CellElement from './CellElement';

import { facilityListItemPropType } from '../util/propTypes';

import { listTableCellStyles } from '../util/styles';

import { makeFacilityDetailLink } from '../util/util';

function FacilityListItemsConfirmationTableRow({
    item,
    fetching,
    readOnly,
    className,
}) {
    return (
        <>
            <TableRow
                hover={false}
                style={{
                    background: '#dcfbff',
                    verticalAlign: 'top',
                    borderTop: '1px solid #e0e0e0',
                }}
                className={className}
            >
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.rowIndexStyles}
                >
                    <CellElement item={item.row_index} />
                </TableCell>
                <TableCell
                    align="center"
                    padding="default"
                    style={listTableCellStyles.countryNameStyles}
                >
                    <CellElement item={item.country_name || ' '} />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.nameCellStyles}
                    colSpan={2}
                >
                    <CellElement item={item.name || ' '} />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.addressCellStyles}
                    colSpan={2}
                >
                    <CellElement item={item.address || ' '} />
                </TableCell>
                <TableCell
                    padding="default"
                    style={listTableCellStyles.statusCellStyles}
                >
                    <FacilityListItemsDetailedTableRowCell
                        title={item.status}
                        stringIsHidden
                        hasActions={false}
                        fetching={fetching}
                        readOnly={readOnly}
                        data={[]}
                    />
                </TableCell>
            </TableRow>
            <TableRow
                hover={false}
                style={{
                    background: '#dcfbff',
                    verticalAlign: 'top',
                    border: 0,
                }}
                className={className}
            >
                <TableCell padding="default" variant="head" colSpan={2} />
                <TableCell
                    padding="default"
                    variant="head"
                    colSpan={2}
                    style={listTableCellStyles.headerCellStyles}
                >
                    <b>Facility Match Name</b>
                </TableCell>
                <TableCell
                    padding="default"
                    variant="head"
                    style={listTableCellStyles.headerCellStyles}
                    colSpan={2}
                >
                    <b>Facility Match Address</b>
                </TableCell>
                <TableCell
                    padding="default"
                    variant="head"
                    style={listTableCellStyles.headerCellStyles}
                />
            </TableRow>
            {item.matches.map((
                { id, address, oar_id, name }, // eslint-disable-line camelcase
            ) => (
                <TableRow
                    hover={false}
                    style={{ background: '#dcfbff', verticalAlign: 'top' }}
                    className={className}
                    key={id}
                >
                    <TableCell padding="default" variant="head" colSpan={2} />
                    <TableCell
                        padding="default"
                        colSpan={2}
                        style={listTableCellStyles.nameCellStyles}
                    >
                        <CellElement
                            item={name}
                            linkURL={makeFacilityDetailLink(oar_id)}
                        />
                    </TableCell>
                    <TableCell
                        padding="default"
                        style={listTableCellStyles.addressCellStyles}
                        colSpan={2}
                    >
                        <CellElement item={address} />
                    </TableCell>
                    <TableCell
                        padding="default"
                        variant="head"
                        style={listTableCellStyles.headerCellStyles}
                    />
                </TableRow>
            ))}
        </>
    );
}

FacilityListItemsConfirmationTableRow.defaultProps = {
    readOnly: true,
};

FacilityListItemsConfirmationTableRow.propTypes = {
    item: facilityListItemPropType.isRequired,
    fetching: bool.isRequired,
    readOnly: bool,
};

function mapStateToProps({
    facilityListDetails: {
        confirmOrRejectMatchOrRemoveItem: { fetching },
    },
}) {
    return {
        fetching,
    };
}

export default connect(mapStateToProps)(FacilityListItemsConfirmationTableRow);
