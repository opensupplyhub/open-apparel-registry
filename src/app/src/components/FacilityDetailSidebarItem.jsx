import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import FacilityDetailSidebarDetail from './FacilityDetailSidebarDetail';
import ShowOnly from './ShowOnly';

const detailsSidebarStyles = () =>
    Object.freeze({
        item: {
            paddingTop: '16px',
        },
        label: {
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 'bold',
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
        divider: {
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
        },
        icon: {
            color: 'rgb(106, 106, 106)',
            fontSize: '24px',
            fontWeight: 300,
            textAlign: 'center',
        },
    });

const FacilityDetailSidebarItem = ({
    additionalContent,
    label,
    primary,
    secondary,
    classes,
    embed,
    verified,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasAdditionalContent = !embed && !!additionalContent?.length;
    const additionalContentCount = additionalContent?.length;

    return (
        <div className={classes.item}>
            <ListItem
                button={hasAdditionalContent}
                onClick={() => {
                    if (!hasAdditionalContent) return;
                    setIsOpen(!isOpen);
                }}
            >
                <ListItemText
                    primary={label}
                    classes={{ primary: classes.label }}
                />
                <ShowOnly when={hasAdditionalContent}>
                    <div className={classes.secondaryText}>
                        <ListItemText secondary={additionalContentCount + 1} />
                        <i
                            className={`${classes.icon} far fa-fw fa-${
                                isOpen ? 'angle-up' : 'angle-down'
                            }`}
                        />
                    </div>
                </ShowOnly>
            </ListItem>
            <FacilityDetailSidebarDetail
                primary={primary}
                secondary={secondary}
                verified={verified}
            />
            {isOpen &&
                additionalContent.map(item => (
                    <FacilityDetailSidebarDetail {...item} />
                ))}
        </div>
    );
};

export default withStyles(detailsSidebarStyles)(FacilityDetailSidebarItem);
