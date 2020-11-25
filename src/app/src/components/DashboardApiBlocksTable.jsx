import React from 'react';
import { arrayOf, func, string, bool } from 'prop-types';

import moment from 'moment';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { apiBlockPropType } from '../util/propTypes';

const styles = {
    container: {
        marginBottom: '60px',
        width: '100%',
    },
    activeList: {
        backgroundColor: '#f3fafe',
        outlineWidth: '0.75px',
        outlineStyle: 'solid',
        outlineColor: '#1a9fe3',
    },
    clickable: {
        cursor: 'pointer',
    },
    title: {
        padding: '20px',
    },
};

function DashboardApiBlocksTable({
    apiBlocks,
    renderAdditionalContent,
    onClickRow,
    isClickable,
    title,
}) {
    const getRowStyle = (active, clickable) => {
        let style = {};
        if (active) {
            style = { ...styles.activeList };
        }
        if (clickable) {
            style = { ...style, ...styles.clickable };
        }
        return style;
    };

    return (
        <Paper style={styles.container}>
            <Typography variant="title" style={styles.title}>
                {title}
            </Typography>
            {renderAdditionalContent()}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Date Created</TableCell>
                        <TableCell>Contributor</TableCell>
                        <TableCell>In Effect Until</TableCell>
                        <TableCell padding="dense">Count Limit</TableCell>
                        <TableCell padding="dense">Actual Count</TableCell>
                        <TableCell padding="dense">Grace Limit</TableCell>
                        <TableCell>Grace Reason</TableCell>
                        <TableCell padding="dense">Active</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {apiBlocks.map(block => (
                        <TableRow
                            key={block.id}
                            hover={isClickable}
                            onClick={() => onClickRow(block)}
                            style={getRowStyle(block.active, isClickable)}
                        >
                            <TableCell>{moment(block.created_at).format('L')}</TableCell>
                            <TableCell>{block.contributor}</TableCell>
                            <TableCell>{moment(block.until).format('L')}</TableCell>
                            <TableCell>{block.limit}</TableCell>
                            <TableCell>{block.actual}</TableCell>
                            <TableCell>{block.grace_limit}</TableCell>
                            <TableCell>{block.grace_reason}</TableCell>
                            <TableCell padding="dense">
                                {block.active ? 'Active' : 'Inactive'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

DashboardApiBlocksTable.propTypes = {
    apiBlocks: arrayOf(apiBlockPropType).isRequired,
    isClickable: bool,
    onClickRow: func,
    renderAdditionalContent: func,
    title: string.isRequired,
};

DashboardApiBlocksTable.defaultProps = {
    isClickable: false,
    onClickRow: () => {},
    renderAdditionalContent: () => null,
};

export default DashboardApiBlocksTable;
