import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ShowOnly from './ShowOnly';
import BadgeVerified from './BadgeVerified';

const detailsSidebarStyles = () =>
    Object.freeze({
        primaryText: {
            wordWrap: 'break-word',
        },
        item: {
            boxShadow: '0px -1px 0px 0px rgb(240, 240, 240)',
        },
    });

const FacilityDetailSidebarDetail = ({
    primary,
    secondary,
    verified,
    classes,
}) => (
    <ListItem className={classes.item}>
        <ShowOnly when={verified}>
            <BadgeVerified />
        </ShowOnly>
        <ListItemText
            primary={primary}
            secondary={secondary}
            classes={{ primary: classes.primaryText }}
        />
    </ListItem>
);

export default withStyles(detailsSidebarStyles)(FacilityDetailSidebarDetail);
