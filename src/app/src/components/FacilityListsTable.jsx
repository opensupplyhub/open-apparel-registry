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
import {
    facilitiesListTableTooltipTitles,
    matchResponsibilityEnum,
} from '../util/constants';

const facilityListsTableStyles = Object.freeze({
    inactiveListStyles: Object.freeze({
        cursor: 'pointer',
    }),
    activeListStyles: Object.freeze({
        backgroundColor: '#f3fafe',
        cursor: 'pointer',
    }),
    activeCellStyles: Object.freeze({
        borderColor: '#d1e1e9',
    }),
    wrappedTextStyle: Object.freeze({
        overflowWrap: 'anywhere',
    }),
});

function FacilityListsTable({ facilityLists, history: { push } }) {
    return (
        <Paper style={{ width: '100%' }}>
            <div className="TABLE_WRAPPER" style={{ overflowX: 'auto' }}>
                <Table style={{ tableLayout: 'fixed', minWidth: '1200px' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2}>Name</TableCell>
                            <TableCell colSpan={2}>Description</TableCell>
                            <TableCell colSpan={2}>File Name</TableCell>
                            <TableCell padding="dense">Uploaded</TableCell>
                            <TableCell padding="dense">Duplicates</TableCell>
                            <TableCell padding="dense">Errors</TableCell>
                            <TableCell padding="dense" colSpan={2}>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facilityLists.map(list => (
                            <TableRow
                                key={list.id}
                                hover
                                onClick={() =>
                                    push(
                                        makeFacilityListItemsDetailLink(
                                            list.id,
                                        ),
                                    )
                                }
                                style={
                                    list.is_active
                                        ? facilityListsTableStyles.activeListStyles
                                        : facilityListsTableStyles.inactiveListStyles
                                }
                            >
                                <TableCell
                                    colSpan={2}
                                    style={
                                        list.is_active
                                            ? {
                                                  ...facilityListsTableStyles.wrappedTextStyle,
                                                  ...facilityListsTableStyles.activeCellStyles,
                                              }
                                            : facilityListsTableStyles.wrappedTextStyle
                                    }
                                >
                                    {list.name}
                                </TableCell>
                                <TableCell
                                    colSpan={2}
                                    style={
                                        list.is_active
                                            ? facilityListsTableStyles.activeCellStyles
                                            : null
                                    }
                                >
                                    {list.description}
                                </TableCell>
                                <TableCell
                                    colSpan={2}
                                    style={
                                        list.is_active
                                            ? {
                                                  ...facilityListsTableStyles.wrappedTextStyle,
                                                  ...facilityListsTableStyles.activeCellStyles,
                                              }
                                            : facilityListsTableStyles.wrappedTextStyle
                                    }
                                >
                                    {list.file_name}
                                </TableCell>
                                <FacilityListsTooltipTableCell
                                    tooltipTitle={
                                        facilitiesListTableTooltipTitles.uploaded
                                    }
                                    tableCellText={list.item_count}
                                />
                                <FacilityListsTooltipTableCell
                                    tooltipTitle={
                                        facilitiesListTableTooltipTitles.duplicates
                                    }
                                    tableCellText={sum([
                                        list.status_counts.DUPLICATE,
                                    ])}
                                />
                                <FacilityListsTooltipTableCell
                                    tooltipTitle={
                                        facilitiesListTableTooltipTitles.errors
                                    }
                                    tableCellText={sum([
                                        list.status_counts.ERROR,
                                        list.status_counts.ERROR_PARSING,
                                        list.status_counts.ERROR_GEOCODING,
                                        list.status_counts.ERROR_MATCHING,
                                    ])}
                                />
                                {/* Status derivation:
                                    Pending approval: the list status == PENDING
                                    Rejected: the list status == REJECTED
                                    Processing: If the list status is APPROVED and any of the UPLOADED, PARSED, or GEOCODED counts are > 0
                                    Action Required: If not processing and match_resposibility == contributor
                                    Pending Moderation: If not processing and match_resposibility == moderator
                                    Approved: if list status is APPROVED and there are no items in UPLOADED, PARSED, GEOCODED, or POTENTIAL_MATCH
                                */}
                                <FacilityListsTooltipTableCell
                                    colSpan={2}
                                    tooltipTitle={
                                        facilitiesListTableTooltipTitles.status
                                    }
                                    tableCellText={(() => {
                                        let status;
                                        if (list.status === 'PENDING') {
                                            if (
                                                list.item_count ===
                                                list.status_counts.UPLOADED
                                            ) {
                                                status = 'Processing';
                                            } else {
                                                status = 'Pending approval';
                                            }
                                        } else if (list.status === 'REJECTED') {
                                            status = 'Rejected';
                                        } else if (list.status === 'REPLACED') {
                                            status = 'Replaced';
                                        } else if (list.status === 'APPROVED') {
                                            if (
                                                sum([
                                                    list.status_counts.UPLOADED,
                                                    list.status_counts.PARSED,
                                                    list.status_counts.GEOCODED,
                                                ]) > 0
                                            ) {
                                                status = 'Processing';
                                            } else if (
                                                list.status_counts
                                                    .POTENTIAL_MATCH === 0
                                            ) {
                                                return 'Approved';
                                            } else if (
                                                list.match_responsibility ===
                                                matchResponsibilityEnum.CONTRIBUTOR
                                            ) {
                                                status = 'Action required';
                                            } else if (
                                                list.match_responsibility ===
                                                matchResponsibilityEnum.MODERATOR
                                            ) {
                                                status = 'Pending moderation';
                                            }
                                        }
                                        return status;
                                    })()}
                                />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
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
