import React from 'react';
import { arrayOf, func, shape } from 'prop-types';
import { withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import sum from 'lodash/sum';

import FacilityListsTooltipTableCell from './FacilityListsTooltipTableCell';

import { facilityListPropType } from '../util/propTypes';
import { makeFacilityListItemsDetailLink } from '../util/util';
import { facilitiesListTableTooltipTitles } from '../util/constants';

const facilityListsTableStyles = Object.freeze({
    inactiveListStyles: Object.freeze({
        cursor: 'pointer',
    }),
    activeListStyles: Object.freeze({
        backgroundColor: '#f3fafe',
        outlineWidth: '0.75px',
        outlineStyle: 'solid',
        outlineColor: '#1a9fe3',
        cursor: 'pointer',
    }),
});

function FacilityListsTable({
    facilityLists,
    history: {
        push,
    },
}) {
    return (
        <Paper style={{ width: '100%' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Name
                        </TableCell>
                        <TableCell>
                            Description
                        </TableCell>
                        <TableCell>
                            File Name
                        </TableCell>
                        <TableCell padding="dense">
                            Total
                        </TableCell>
                        <TableCell padding="dense">
                            Uploaded
                        </TableCell>
                        <TableCell padding="dense">
                            Parsed
                        </TableCell>
                        <TableCell padding="dense">
                            Geocoded
                        </TableCell>
                        <TableCell padding="dense">
                            Matched
                        </TableCell>
                        <TableCell padding="dense">
                            Error
                        </TableCell>
                        <TableCell padding="dense">
                            Potential Match
                        </TableCell>
                        <TableCell padding="dense">
                            Deleted
                        </TableCell>
                        <TableCell padding="dense">
                            Active
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        facilityLists
                            .map(list => (
                                <TableRow
                                    key={list.id}
                                    hover
                                    onClick={() => push(makeFacilityListItemsDetailLink(list.id))}
                                    style={
                                        list.is_active
                                            ? facilityListsTableStyles.activeListStyles
                                            : facilityListsTableStyles.inactiveListStyles
                                    }
                                >
                                    <TableCell>
                                        {list.name}
                                    </TableCell>
                                    <TableCell>
                                        {list.description}
                                    </TableCell>
                                    <TableCell>
                                        {list.file_name}
                                    </TableCell>
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={facilitiesListTableTooltipTitles.total}
                                        tableCellText={list.item_count}
                                    />
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={facilitiesListTableTooltipTitles.uploaded}
                                        tableCellText={list.status_counts.UPLOADED}
                                    />
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={facilitiesListTableTooltipTitles.parsed}
                                        tableCellText={list.status_counts.PARSED}
                                    />
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={facilitiesListTableTooltipTitles.geocoded}
                                        tableCellText={
                                            sum([
                                                list.status_counts.GEOCODED,
                                                list.status_counts.GEOCODED_NO_RESULTS,
                                            ])
                                        }
                                    />
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={facilitiesListTableTooltipTitles.matched}
                                        tableCellText={
                                            sum([
                                                list.status_counts.MATCHED,
                                                list.status_counts.CONFIRMED_MATCH,
                                            ])
                                        }
                                    />
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={facilitiesListTableTooltipTitles.error}
                                        tableCellText={
                                            sum([
                                                list.status_counts.ERROR,
                                                list.status_counts.ERROR_PARSING,
                                                list.status_counts.ERROR_GEOCODING,
                                                list.status_counts.ERROR_MATCHING,
                                            ])
                                        }
                                    />
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={
                                            facilitiesListTableTooltipTitles.potentialMatch
                                        }
                                        tableCellText={list.status_counts.POTENTIAL_MATCH}
                                    />
                                    <FacilityListsTooltipTableCell
                                        tooltipTitle={
                                            facilitiesListTableTooltipTitles.deleted
                                        }
                                        tableCellText={list.status_counts.DELETED}
                                    />
                                    <TableCell padding="dense">
                                        {list.is_active ? 'Active' : 'Inactive'}
                                    </TableCell>
                                </TableRow>))
                    }
                </TableBody>
            </Table>
        </Paper>
    );
}

FacilityListsTable.propTypes = {
    facilityLists: arrayOf(facilityListPropType).isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
};

export default withRouter(FacilityListsTable);
