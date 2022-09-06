import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import ShowOnly from './ShowOnly';
import BadgeVerified from './BadgeVerified';
import GroupIcon from './GroupIcon';
import TitledDrawer from './TitledDrawer';

import { makeProfileRouteLink } from '../util/util';

const detailsSidebarStyles = theme =>
    Object.freeze({
        root: {
            color: '#191919',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '2px solid #F9F7F7',
            paddingTop: theme.spacing.unit * 3,
        },
        contentContainer: {
            width: '100%',
            maxWidth: '1072px',
            paddingLeft: theme.spacing.unit * 3,
        },
        button: {
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '21px',
            textTransform: 'none',
            padding: 0,
        },
        buttonText: {
            paddingLeft: theme.spacing.unit,
        },
        primaryText: {
            wordWrap: 'break-word',
        },
        link: {
            color: theme.palette.primary.main,
            textDecoration: 'none',
        },
        secondaryText: {
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '21px',
            color: '#010204',
            paddingTop: theme.spacing.unit,
        },
        icon: {
            color: 'rgb(106, 106, 106)',
            fontSize: '24px',
            fontWeight: 300,
            textAlign: 'center',
        },
        contributor: {
            boxShadow: '0px 1px 0px 0px rgb(240, 240, 240)',
            paddingTop: theme.spacing.unit,
            paddingBottom: theme.spacing.unit,
        },
    });

const FacilityDetailSidebarContributors = ({ classes, contributors }) => {
    const [isOpen, setIsOpen] = useState(false);

    const visibleContributors = contributors.filter(
        c => !!c.contributor_name || !!c.name,
    );

    if (!visibleContributors.length) return null;

    return (
        <div className={classes.root}>
            <div className={classes.contentContainer}>
                <Button
                    color="primary"
                    className={classes.button}
                    onClick={() => setIsOpen(true)}
                >
                    <GroupIcon />{' '}
                    <span className={classes.buttonText}>
                        {visibleContributors.length}{' '}
                        {visibleContributors.length === 1
                            ? 'organization has'
                            : 'organizations have'}{' '}
                        contributed data for this facility
                    </span>
                </Button>
            </div>
            <TitledDrawer
                title={
                    <>
                        <GroupIcon />{' '}
                        <span className={classes.buttonText}>
                            Contributors ({visibleContributors.length})
                        </span>
                    </>
                }
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >
                {visibleContributors.map(contributor => (
                    <div
                        key={`${contributor.id} ${contributor.list_name}`}
                        className={classes.contributor}
                    >
                        <ShowOnly when={contributor.is_verified}>
                            <BadgeVerified />
                        </ShowOnly>
                        {contributor.id ? (
                            <Link
                                to={makeProfileRouteLink(contributor.id)}
                                className={`${classes.primaryText} ${classes.link}`}
                            >
                                {contributor.contributor_name ||
                                    contributor.name}
                            </Link>
                        ) : (
                            <Typography className={classes.primaryText}>
                                {contributor.contributor_name ||
                                    contributor.name}
                            </Typography>
                        )}
                        <Typography>{contributor.list_name}</Typography>
                    </div>
                ))}
            </TitledDrawer>
        </div>
    );
};
export default withStyles(detailsSidebarStyles)(
    FacilityDetailSidebarContributors,
);
