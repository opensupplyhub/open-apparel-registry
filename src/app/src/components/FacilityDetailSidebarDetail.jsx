import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ArrowForwardIcon from '@material-ui/icons/ChevronRight';

import ShowOnly from './ShowOnly';
import BadgeVerified from './BadgeVerified';

const detailsSidebarStyles = () =>
    Object.freeze({
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
        divider: {
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
        },
    });

const FacilityDetailSidebarDetail = ({
    hasAdditionalContent,
    additionalContentCount,
    primary,
    secondary,
    onClick,
    hideTopDivider,
    verified,
    classes,
}) => (
    <>
        <ShowOnly when={!hideTopDivider}>
            <Divider className={classes.divider} />
        </ShowOnly>
        <ListItem
            button={hasAdditionalContent}
            onClick={() => {
                if (!hasAdditionalContent) return;
                onClick();
            }}
        >
            <ShowOnly when={verified}>
                <BadgeVerified />
            </ShowOnly>
            <ListItemText
                primary={primary}
                secondary={secondary}
                classes={{ primary: classes.primaryText }}
            />
            <ShowOnly when={hasAdditionalContent}>
                <div className={classes.secondaryText}>
                    <ListItemText secondary={additionalContentCount} />
                    <ArrowForwardIcon />
                </div>
            </ShowOnly>
        </ListItem>
        <Divider className={classes.divider} />
    </>
);

export default withStyles(detailsSidebarStyles)(FacilityDetailSidebarDetail);
