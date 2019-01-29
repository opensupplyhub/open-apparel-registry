import React from 'react';
import { arrayOf } from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import { facilityListPropType } from '../util/propTypes';

export default function FacilityListsTable({
    facilityLists,
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
                        <TableCell>
                            Public
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        facilityLists
                            .map(list => (
                                <TableRow key={list.id}>
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
                                    <TableCell>
                                        {list.is_public ? 'True' : 'False'}
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
};
