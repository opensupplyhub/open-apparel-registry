import React, { useEffect, useState } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

import AppGrid from './AppGrid';
import DashboardApiBlocksTable from './DashboardApiBlocksTable';

import {
    fetchDashboardApiBlock,
    updateDashboardApiBlock,
} from '../actions/dashboardApiBlocks';

import { authLoginFormRoute, dashboardApiBlocksRoute } from '../util/constants';

import { apiBlockPropType } from '../util/propTypes';

const styles = Object.freeze({
    container: Object.freeze({
        marginBottom: '60px',
        width: '100%',
    }),
    buttonGroupStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '20px',
    }),
    saveButtonStyle: Object.freeze({
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '20px 20px 20px 0',
    }),
    textFieldStyles: Object.freeze({
        width: '95%',
        padding: '10px 0 10px',
    }),
    inputGroupStyles: Object.freeze({
        width: '100%',
        padding: '5px 0 5px',
    }),
    formStyles: Object.freeze({
        padding: '20px',
    }),
});

function DashboardApiBlock({
    apiBlock,
    error,
    fetching,
    userHasSignedIn,
    push,
    fetchApiBlock,
    updateApiBlock,
}) {
    const [graceLimit, setGraceLimit] = useState(0);
    const [graceReason, setGraceReason] = useState('');

    useEffect(() => {
        fetchApiBlock();
    }, [fetchApiBlock]);

    useEffect(() => {
        if (apiBlock) {
            let limit = apiBlock.grace_limit;
            if (!limit) {
                // The grace_limit can only be set to a number greater than
                // user's monthly limit and their actual count. The actual
                // count should always be higher than the monthly limit (in
                // order for a block to be generated), so we default the grace
                // limit to one higher than the actual count.

                limit = apiBlock.actual ? apiBlock.actual + 1 : 0;
            }
            setGraceLimit(limit);
            setGraceReason(apiBlock.grace_reason || '');
        }
    }, [apiBlock]);

    if (fetching) {
        return (
            <AppGrid title="">
                <CircularProgress />
            </AppGrid>
        );
    }

    if (error && error.length) {
        if (!userHasSignedIn) {
            return (
                <AppGrid title="Unable to retrieve that API block">
                    <Link to={authLoginFormRoute} href={authLoginFormRoute}>
                        Sign in to view Open Apparel Registry API blocks
                    </Link>
                </AppGrid>
            );
        }

        return (
            <AppGrid title="API block error">
                <ul>
                    {error.map(err => (
                        <li key={err}>{err}</li>
                    ))}
                </ul>
            </AppGrid>
        );
    }

    if (!apiBlock) {
        return (
            <AppGrid title="No API block was found for that ID">
                <div />
            </AppGrid>
        );
    }

    const updateGraceLimit = e => {
        let limit = e.target.value;
        if (limit.length) {
            limit = parseInt(limit, 10);
        } else {
            limit = '';
        }
        setGraceLimit(limit);
    };

    return (
        <Paper style={styles.container}>
            <DashboardApiBlocksTable
                title={`${apiBlock.contributor}: ${moment(
                    apiBlock.until,
                ).format('MMMM YYYY')} block`}
                apiBlocks={[apiBlock]}
                renderAdditionalContent={() => (
                    <div style={styles.buttonGroupStyles}>
                        <Button
                            variant="outlined"
                            onClick={() => push(dashboardApiBlocksRoute)}
                        >
                            Back to API blocks
                        </Button>
                    </div>
                )}
            />
            <div style={styles.formStyles}>
                <div style={styles.inputGroupStyles}>
                    <InputLabel htmlFor="grace-limit">
                        <Typography variant="title">Grace Limit</Typography>
                    </InputLabel>
                    <TextField
                        id="grace-limit"
                        error={false}
                        variant="outlined"
                        style={styles.textFieldStyles}
                        value={graceLimit}
                        onChange={updateGraceLimit}
                        disabled={fetching}
                        type="number"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="grace-reason">
                        <Typography variant="title">Grace Reason</Typography>
                    </InputLabel>
                    <TextField
                        id="grace-reason"
                        error={false}
                        variant="outlined"
                        style={styles.textFieldStyles}
                        multiline
                        rows={4}
                        value={graceReason}
                        onChange={e => setGraceReason(e.target.value)}
                        disabled={fetching}
                    />
                </div>
                <div style={styles.saveButtonStyle}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                            updateApiBlock({ graceLimit, graceReason })
                        }
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Paper>
    );
}

DashboardApiBlock.defaultProps = {
    apiBlock: null,
    error: null,
};

DashboardApiBlock.propTypes = {
    apiBlock: apiBlockPropType,
    error: arrayOf(string),
    fetchApiBlock: func.isRequired,
    userHasSignedIn: bool.isRequired,
};

function mapStateToProps({
    dashboardApiBlocks: {
        apiBlock: { data, error, fetching },
    },
    auth: {
        user: { user },
    },
}) {
    return {
        apiBlock: data,
        error,
        fetching,
        userHasSignedIn: !!user,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { blockId },
        },
        history: { push },
    },
) {
    return {
        fetchApiBlock: () => dispatch(fetchDashboardApiBlock(blockId)),
        push,
        updateApiBlock: data => dispatch(updateDashboardApiBlock(data)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApiBlock);
