import React from 'react';
import { func, shape } from 'prop-types';
import { withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import { facilityClaimsListPropType } from '../util/propTypes';

import { makeClaimedFacilityDetailsLink } from '../util/util';

const dashboardClaimsListTableStyles = Object.freeze({
    containerStyles: Object.freeze({
        marginBottom: '60px',
        width: '100%',
    }),
    rowStyles: Object.freeze({
        cursor: 'pointer',
    }),
    osIdColumnStyles: Object.freeze({
        width: '20%',
    }),
});

function ClaimedFacilitiesListTable({ data, history: { push } }) {
    const makeRowClickHandler = claimID => () =>
        push(makeClaimedFacilityDetailsLink(claimID));

    return (
        <Paper style={dashboardClaimsListTableStyles.containerStyles}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>OS ID</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Country</TableCell>
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
                            <TableCell>{claim.facility_name}</TableCell>
                            <TableCell>{claim.os_id}</TableCell>
                            <TableCell>{claim.facility_address}</TableCell>
                            <TableCell>{claim.facility_country_name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

ClaimedFacilitiesListTable.propTypes = {
    data: facilityClaimsListPropType.isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
};

export default withRouter(ClaimedFacilitiesListTable);
