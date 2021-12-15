import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import FacilityDetailSidebarDetail from './FacilityDetailSidebarDetail';

const detailsSidebarStyles = () =>
    Object.freeze({
        item: {
            paddingTop: '16px',
        },
        label: {
            padding: '12px 24px 4px 24px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 'bold',
        },
    });

const FacilityDetailSidebarItem = ({
    additionalContent,
    label,
    primary,
    secondary,
    classes,
    embed,
    href,
    link,
}) => {
    const hasAdditionalContent = !!additionalContent?.length;

    return (
        <div className={classes.item}>
            <Typography className={classes.label}>{label}</Typography>
            <FacilityDetailSidebarDetail
                hasAdditionalContent={!embed && hasAdditionalContent}
                additionalContentCount={additionalContent?.length}
                primary={primary}
                secondary={secondary}
                onClick={() => {}}
                link={link}
                href={href}
            />
        </div>
    );
};

export default withStyles(detailsSidebarStyles)(FacilityDetailSidebarItem);
