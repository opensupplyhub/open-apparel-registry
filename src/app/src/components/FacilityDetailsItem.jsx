import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import FacilityDetailsDetail from './FacilityDetailsDetail';
import TitledDrawer from './TitledDrawer';
import ShowOnly from './ShowOnly';

const detailssStyles = theme =>
    Object.freeze({
        item: {
            paddingTop: theme.spacing.unit * 3,
        },
        label: {
            fontSize: '14px',
            textTransform: 'uppercase',
            fontWeight: 900,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            padding: 0,
            lineHeight: '17px',
            textDecorationLine: 'underline',
        },
        itemWrapper: {
            paddingBottom: theme.spacing.unit * 3,
        },
    });

const FacilityDetailsItem = ({
    additionalContent,
    label,
    primary,
    secondary,
    classes,
    embed,
    isVerified,
    isFromClaim,
    additionalContentText = 'contribution',
    additionalContentTextPlural = 'contributions',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasAdditionalContent = !embed && !!additionalContent?.length;
    const additionalContentCount = additionalContent?.length;

    return (
        <div className={classes.item}>
            <div>
                <Typography className={classes.label}>{label}</Typography>
            </div>
            <FacilityDetailsDetail
                primary={primary}
                secondary={!embed ? secondary : null}
                isVerified={isVerified}
                isFromClaim={isFromClaim}
            />
            <ShowOnly when={hasAdditionalContent}>
                <Button
                    color="primary"
                    className={classes.button}
                    onClick={() => {
                        if (!hasAdditionalContent) return;
                        setIsOpen(!isOpen);
                    }}
                >
                    {additionalContentCount} more{' '}
                    {additionalContentCount === 1
                        ? additionalContentText
                        : additionalContentTextPlural}
                </Button>
            </ShowOnly>
            <TitledDrawer
                open={isOpen}
                anchor="right"
                onClose={() => setIsOpen(false)}
                title={label}
                subtitle={`${
                    additionalContentCount + 1
                } ${additionalContentTextPlural}`}
            >
                <div className={classes.drawer}>
                    <div className={classes.itemWrapper}>
                        <FacilityDetailsDetail
                            primary={primary}
                            secondary={!embed ? secondary : null}
                            isVerified={isVerified}
                            isFromClaim={isFromClaim}
                        />
                    </div>
                    {isOpen &&
                        additionalContent.map(item => (
                            <div className={classes.itemWrapper} key={item.id}>
                                <FacilityDetailsDetail {...item} />
                            </div>
                        ))}
                </div>
            </TitledDrawer>
        </div>
    );
};

export default withStyles(detailssStyles)(FacilityDetailsItem);
