import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

import ShowOnly from './ShowOnly';
import BadgeVerified from './BadgeVerified';
import FeatureFlag from './FeatureFlag';

import { CLAIM_A_FACILITY } from '../util/constants';

const detailsSidebarStyles = () =>
    Object.freeze({
        primaryText: {
            wordWrap: 'break-word',
        },
        item: {
            boxShadow: '0px -1px 0px 0px rgb(240, 240, 240)',
        },
    });

const CLAIM_EXPLANATORY_TEXT =
    'Please note: The OS Hub team has only verified that the person claiming a ' +
    'facility profile is connected to that facility. The OS Hub team has not ' +
    'verified any additional details added to a facility profile, e.g. ' +
    'certifications, production capabilities etc. Users interested in those ' +
    'details will need to carry out their own due diligence checks.';

const FacilityDetailSidebarDetail = ({
    primary,
    secondary,
    isVerified,
    isFromClaim,
    classes,
}) => (
    <ListItem className={classes.item}>
        <ShowOnly when={isVerified && !isFromClaim}>
            <BadgeVerified />
        </ShowOnly>
        <FeatureFlag flag={CLAIM_A_FACILITY}>
            <ShowOnly when={isFromClaim}>
                <Tooltip title={CLAIM_EXPLANATORY_TEXT}>
                    <BadgeVerified />
                </Tooltip>
            </ShowOnly>
        </FeatureFlag>
        <ListItemText
            primary={primary}
            secondary={secondary}
            classes={{ primary: classes.primaryText }}
        />
    </ListItem>
);

export default withStyles(detailsSidebarStyles)(FacilityDetailSidebarDetail);
