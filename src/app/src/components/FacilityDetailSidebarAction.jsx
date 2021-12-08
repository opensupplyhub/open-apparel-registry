import React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const actionsStyles = theme =>
    Object.freeze({
        button: {
            color: theme.palette.primary.main,
            fontSize: '14px',
            fontWeight: theme.typography.fontWeightMedium,
            textTransform: 'none',
        },
        icon: {
            marginRight: '5px',
        },
    });

const FacilityDetailSidebarAction = ({
    classes,
    link,
    href,
    onClick,
    iconName,
    text,
}) => (
    <Button
        className={classes.button}
        as={link ? 'a' : null}
        href={href}
        target={link ? '_blank' : null}
        rel={link ? 'noreferrer' : null}
        onClick={() => {
            if (link) return;
            onClick();
        }}
    >
        <i className={`${classes.icon} far fa-fw fa-${iconName}`} />
        {text}
    </Button>
);

export default withStyles(actionsStyles)(FacilityDetailSidebarAction);
