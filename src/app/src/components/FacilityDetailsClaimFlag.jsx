import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import { withStyles } from '@material-ui/core/styles';

import BadgeClaimed from './BadgeClaimed';

import { makeClaimFacilityLink } from '../util/util';

const claimFlagBaseStyles = theme =>
    Object.freeze({
        root: {
            backgroundColor: '#FFEAEA',
            color: '#191919',
            display: 'flex',
            justifyContent: 'center',
        },
        contentContainer: {
            width: '100%',
            maxWidth: '1072px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            paddingRight: theme.spacing.unit,
            paddingBottom: theme.spacing.unit,
        },
        link: {
            color: theme.palette.primary.main,
        },
        itemPadding: {
            paddingLeft: theme.spacing.unit * 3,
            paddingTop: theme.spacing.unit,
        },
    });

const getBackgroundColor = (isClaimed, isPending) => {
    if (isClaimed) {
        return '#E0F5E3';
    }
    if (isPending) {
        return '#C7CDD5';
    }
    return '#FFEAEA';
};

const getMainText = (isClaimed, isPending) => {
    if (isClaimed) {
        return 'This facility has been claimed by an owner or manager';
    }
    if (isPending) {
        return 'A claim on this facility is pending';
    }
    return 'This facility has not been claimed';
};

const FacilityDetailsClaimFlag = ({
    classes,
    oarId,
    isClaimed,
    isPending,
    isEmbed,
}) => {
    if (isEmbed) return null;
    const backgroundColor = getBackgroundColor(isClaimed, isPending);
    const claimFacilityLink = makeClaimFacilityLink(oarId);
    return (
        <div className={classes.root} style={{ backgroundColor }}>
            <div className={classes.contentContainer}>
                <Icon className={classes.itemPadding}>
                    <BadgeClaimed />
                </Icon>
                <Typography className={classes.itemPadding}>
                    {getMainText(isClaimed, isPending)}
                </Typography>
                {!isClaimed && !isPending ? (
                    <Typography className={classes.itemPadding}>
                        <Link
                            to={claimFacilityLink}
                            href={claimFacilityLink}
                            className={classes.link}
                        >
                            Owners or managers can claim this facility
                        </Link>
                    </Typography>
                ) : null}
            </div>
        </div>
    );
};

export default withStyles(claimFlagBaseStyles)(FacilityDetailsClaimFlag);
