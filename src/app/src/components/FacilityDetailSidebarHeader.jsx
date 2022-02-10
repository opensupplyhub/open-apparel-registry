import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForwardIos';

import BadgeClaimed from './BadgeClaimed';
import BadgeUnclaimed from './BadgeUnclaimed';

import { facilitiesRoute } from '../util/constants';
import { makeClaimFacilityLink } from '../util/util';

const headerStyles = theme =>
    Object.freeze({
        header: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: 0,
            display: 'flex',
            position: 'sticky',
            top: 0,
            zIndex: 1,
        },
        headerPrimary: {
            color: theme.palette.primary.contrastText,
            fontSize: '12px',
            fontWeight: theme.typography.fontWeightRegular,
        },
        headerSecondary: {
            color: theme.palette.primary.contrastText,
            fontSize: '18px',
            fontWeight: 'bold',
        },
        backArrow: {
            fontSize: '30px',
            color: theme.palette.primary.contrastText,
            margin: 0,
        },
        backArrowContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRight: `1px solid ${theme.palette.primary.contrastText}`,
        },
        headerInfo: {
            padding: '12px 0px 12px 24px',
        },
    });

const getContent = ({
    isEmbed,
    isClaimed,
    isPending,
    claimantName,
    embedContributor,
}) => {
    if (isEmbed) {
        return {
            primary: 'This facility was contributed by',
            secondary: embedContributor,
            icon: <BadgeClaimed />,
            style: {},
        };
    }
    if (isClaimed) {
        return {
            primary: 'This facility is claimed by',
            secondary: claimantName,
            icon: <BadgeClaimed />,
            style: {},
        };
    }
    if (isPending) {
        return {
            primary: 'Your claim on this facility is',
            secondary: 'Pending',
            icon: <BadgeUnclaimed />,
            style: {
                background: 'rgb(9, 18, 50)',
                color: 'rgb(255, 255, 255)',
            },
        };
    }
    return {
        primary: 'Are you the owner or manager?',
        secondary: 'Claim this facility',
        icon: <BadgeUnclaimed />,
        style: {
            background: 'rgb(61, 50, 138)',
            color: 'rgb(255, 255, 255)',
        },
    };
};

const FacilityDetailSidebarHeader = ({
    classes,
    isClaimed,
    isPending,
    isEmbed,
    claimantName,
    embedContributor,
    fetching,
    oarId,
    onBack,
    push,
}) => {
    const content = getContent({
        isEmbed,
        isClaimed,
        isPending,
        claimantName,
        embedContributor,
    });

    return (
        <div className={classes.header} style={content.style}>
            <div className={classes.backArrowContainer}>
                <IconButton
                    aria-label="Back"
                    disabled={fetching}
                    onClick={() => {
                        onBack();
                        push(facilitiesRoute);
                    }}
                >
                    <ListItemIcon>
                        <ArrowBackIcon className={classes.backArrow} />
                    </ListItemIcon>
                </IconButton>
            </div>
            <ListItem
                button={!isClaimed && !isPending && !isEmbed}
                onClick={() => {
                    if (isClaimed || isPending || isEmbed) return;
                    push(makeClaimFacilityLink(oarId));
                }}
                className={classes.headerInfo}
                disabled={fetching}
            >
                <ListItemIcon>{content.icon}</ListItemIcon>
                <ListItemText
                    classes={{
                        primary: classes.headerPrimary,
                        secondary: classes.headerSecondary,
                    }}
                    primary={content.primary}
                    secondary={content.secondary}
                />
                {!isClaimed && !isPending && !isEmbed ? (
                    <IconButton aria-label="Claim">
                        <ArrowForwardIcon className={classes.headerSecondary} />
                    </IconButton>
                ) : null}
            </ListItem>
        </div>
    );
};

export default withStyles(headerStyles)(FacilityDetailSidebarHeader);
