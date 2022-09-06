import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

const titledDrawerStyles = () =>
    Object.freeze({
        drawerHeader: Object.freeze({
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
        }),
        closeButton: Object.freeze({}),
        drawerTitle: Object.freeze({
            fontWeight: 900,
            fontSize: '2rem',
        }),
        drawerSubtitle: Object.freeze({
            fontWeight: 600,
            fontSize: '1rem',
            marginBottom: '2rem',
        }),
        drawer: Object.freeze({
            padding: '1rem 4.5rem',
            maxWidth: '560px',
            minWidth: '33%',
        }),
    });

const TitledDrawer = ({
    open,
    onClose,
    title,
    subtitle,
    children,
    classes,
}) => (
    <Drawer anchor="right" open={open} onClose={onClose}>
        <div className={classes.drawer}>
            <div className={classes.drawerHeader}>
                <IconButton
                    aria-label="Close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            <Typography className={classes.drawerTitle}>{title}</Typography>
            <Typography className={classes.drawerSubtitle}>
                {subtitle}
            </Typography>
            {children}
        </div>
    </Drawer>
);

export default withStyles(titledDrawerStyles)(TitledDrawer);
