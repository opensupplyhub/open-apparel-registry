import React from 'react';
import { arrayOf, func, shape } from 'prop-types';
import { withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import { facilityListPropType } from '../util/propTypes';
import { makeFacilityListItemsDetailLink } from '../util/util';

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
                        <TableCell>
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
                                    <TableCell>
                                        {list.is_active ? 'True' : 'False'}
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
