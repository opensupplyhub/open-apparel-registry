import React from 'react';
import { func, shape } from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import moment from 'moment';
import flow from 'lodash/flow';
import includes from 'lodash/includes';
import noop from 'lodash/noop';

import { facilityClaimsListPropType } from '../util/propTypes';

import {
    makeFacilityDetailLink,
    makeProfileRouteLink,
    makeFacilityClaimDetailsLink,
    getIDFromEvent,
} from '../util/util';

const dashboardClaimsListTableStyles = Object.freeze({
    containerStyles: Object.freeze({
        marginBottom: '60px',
        width: '100%',
    }),
    rowStyles: Object.freeze({
        cursor: 'pointer',
    }),
});

const FACILITY_LINK_ID = 'FACILITY_LINK_ID';
const CONTRIBUTOR_LINK_ID = 'CONTRIBUTOR_LINK_ID';

function DashboardClaimsListTable({ data, history: { push } }) {
    const makeRowClickHandler = claimID =>
        flow(getIDFromEvent, id => {
            if (includes([FACILITY_LINK_ID, CONTRIBUTOR_LINK_ID], id)) {
                return noop();
            }

            return push(makeFacilityClaimDetailsLink(claimID));
        });

    return (
        <Paper style={dashboardClaimsListTableStyles.containerStyles}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="dense">Claim ID</TableCell>
                        <TableCell>Facility Name</TableCell>
                        <TableCell>Contributor Name</TableCell>
                        <TableCell padding="dense">Created</TableCell>
                        <TableCell padding="dense">Last Updated</TableCell>
                        <TableCell padding="dense">Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(claim => (
                        <TableRow
                            hover
                            key={claim.id}
                            onClick={makeRowClickHandler(claim.id)}
                            style={dashboardClaimsListTableStyles.rowStyles}
                        >
                            <TableCell padding="dense">{claim.id}</TableCell>
                            <TableCell>
                                <Link
                                    to={makeFacilityDetailLink(claim.oar_id)}
                                    href={makeFacilityDetailLink(claim.oar_id)}
                                    id={FACILITY_LINK_ID}
                                >
                                    {claim.facility_name}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link
                                    to={makeProfileRouteLink(
                                        claim.contributor_id,
                                    )}
                                    href={makeProfileRouteLink(
                                        claim.contributor_id,
                                    )}
                                    id={CONTRIBUTOR_LINK_ID}
                                >
                                    {claim.contributor_name}
                                </Link>
                            </TableCell>
                            <TableCell padding="dense">
                                {moment(claim.created_at).format('LL')}
                            </TableCell>
                            <TableCell padding="dense">
                                {moment(claim.updated_at).format('LL')}
                            </TableCell>
                            <TableCell padding="dense">
                                {claim.status}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

DashboardClaimsListTable.propTypes = {
    data: facilityClaimsListPropType.isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
};

export default withRouter(DashboardClaimsListTable);
