import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ShowOnly from './ShowOnly';
import BadgeVerified from './BadgeVerified';

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
        primaryText: {
            wordWrap: 'break-word',
        },
        secondaryText: {
            color: 'rgba(0, 0, 0, 0.54)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            justify: 'flex-end',
        },
        icon: {
            color: 'rgb(106, 106, 106)',
            fontSize: '24px',
            fontWeight: 300,
            textAlign: 'center',
        },
        contributor: {
            boxShadow: '0px -1px 0px 0px rgb(240, 240, 240)',
        },
    });

const FacilityDetailSidebarContributors = ({ classes, contributors, push }) => {
    const visibleContributors = contributors.filter(c => !!c.contributor_name);

    if (!visibleContributors.length) return null;

    return (
        <div className={classes.item}>
            <Typography className={classes.label}>Contributors</Typography>
            {visibleContributors.map(contributor => (
                <ListItem
                    button={!!contributor.id}
                    onClick={() => {
                        if (!contributor.id) return;
                        push(makeProfileRouteLink(contributor.id));
                    }}
                    key={`${contributor.id} ${contributor.list_name}`}
                    className={classes.contributor}
                >
                    <ShowOnly when={contributor.is_verified}>
                        <BadgeVerified />
                    </ShowOnly>
                    <ListItemText
                        primary={contributor.contributor_name}
                        secondary={contributor.list_name}
                        classes={{ primary: classes.primaryText }}
                    />
                    <ShowOnly when={!!contributor.id}>
                        <i
                            className={`${classes.icon} far fa-fw fa-angle-right`}
                        />
                    </ShowOnly>
                </ListItem>
            ))}
        </div>
    );
};
export default withStyles(detailsSidebarStyles)(
    FacilityDetailSidebarContributors,
);
