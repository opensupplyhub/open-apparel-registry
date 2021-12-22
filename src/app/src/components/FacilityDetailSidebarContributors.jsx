import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import FacilityDetailSidebarDetail from './FacilityDetailSidebarDetail';

import { makeProfileRouteLink } from '../util/util';

const detailsSidebarStyles = theme =>
    Object.freeze({
        item: {
            paddingTop: '12px',
        },
        label: {
            padding: '12px 24px 6px 24px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: theme.typography.fontWeightMedium,
        },
        secondaryText: {
            color: 'rgba(0, 0, 0, 0.54)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            justify: 'flex-end',
        },
        divider: {
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
        },
    });

const FacilityDetailSidebarContributors = ({ classes, contributors, push }) => {
    const visibleContributors = contributors.filter(c => !!c.contributor_name);

    if (!visibleContributors.length) return null;

    return (
        <div className={classes.item}>
            <Typography className={classes.label}>Contributors</Typography>
            <Divider className={classes.divider} />
            {contributors.map(contributor => (
                <FacilityDetailSidebarDetail
                    primary={contributor.contributor_name}
                    secondary={contributor.list_name}
                    hasAdditionalContent={!!contributor.id}
                    hideTopDivider
                    additionalContentCount=""
                    onClick={() => push(makeProfileRouteLink(contributor.id))}
                    key={contributor.id}
                    verified={contributor.is_verified}
                />
            ))}
        </div>
    );
};
export default withStyles(detailsSidebarStyles)(
    FacilityDetailSidebarContributors,
);
