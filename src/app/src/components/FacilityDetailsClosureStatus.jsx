import React from 'react';
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import FeatureFlag from './FeatureFlag';
import { REPORT_A_FACILITY } from '../util/constants';
import { makeFacilityDetailLink } from '../util/util';

const styles = theme =>
    Object.freeze({
        status: {
            backgroundColor: 'rgb(40, 39, 39)',
            borderRadius: 0,
            display: 'flex',
            justifyContent: 'center',
        },
        contentContainer: {
            width: '100%',
            maxWidth: '1072px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: theme.spacing.unit,
        },
        icon: {
            fontSize: '24px',
            fontWeight: 'normal',
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 3,
        },
        textBox: {
            display: 'flex',
            flexDirection: 'column',
        },
        text: {
            color: 'rgb(255, 255, 255)',
            fontSize: '14px',
        },
    });

const FacilityDetailClosureStatus = ({ data, clearFacility, classes }) => {
    const report = get(data, 'properties.activity_reports[0]');
    const newOarId = get(data, 'properties.new_oar_id');
    const isClosed = get(data, 'properties.is_closed');
    const isPending = report?.status === 'PENDING';

    if (!report || (!isPending && !isClosed)) return null;

    let primaryText = null;
    if (isPending) {
        primaryText = (
            <Typography className={classes.text} variant="subheading">
                This facility may be {report.closure_state.toLowerCase()}
            </Typography>
        );
    } else if (isClosed && !!newOarId) {
        primaryText = (
            <Typography className={classes.text} variant="subheading">
                This facility has moved to{' '}
                <Link
                    to={{
                        pathname: makeFacilityDetailLink(newOarId),
                        state: {
                            panMapToFacilityDetails: true,
                        },
                    }}
                    className={classes.text}
                    onClick={() => clearFacility()}
                >
                    {newOarId}
                </Link>
            </Typography>
        );
    } else if (isClosed) {
        primaryText = (
            <Typography className={classes.text} variant="subheading">
                This facility is closed
            </Typography>
        );
    }

    return (
        <FeatureFlag flag={REPORT_A_FACILITY}>
            <div className={classes.status}>
                <div className={classes.contentContainer}>
                    <i
                        className={`${classes.text} ${classes.icon} far fa-fw fa-store-slash`}
                        style={{ fontSize: '24px' }}
                    />
                    <div className={classes.textBox}>
                        {primaryText}
                        {isPending && (
                            <Typography
                                className={classes.text}
                                variant="body1"
                            >
                                Status pending
                            </Typography>
                        )}
                    </div>
                </div>
            </div>
        </FeatureFlag>
    );
};

export default withStyles(styles)(FacilityDetailClosureStatus);
