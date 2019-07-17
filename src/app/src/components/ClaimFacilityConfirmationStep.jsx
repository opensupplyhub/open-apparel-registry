import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckIcon from '@material-ui/icons/Check';

import { claimAFacilityFormStyles } from '../util/styles';

import COLOURS from '../util/COLOURS';

const confirmationMessageStyles = Object.freeze({
    width: '95%',
});

const checkIconStyles = Object.freeze({
    color: COLOURS.NAVY_BLUE,
});

export default function ClaimFacilityConfirmationStep() {
    return (
        <div style={claimAFacilityFormStyles.inputGroupStyles}>
            <Typography variant="headline" style={confirmationMessageStyles}>
                Your request to claim the facility was submitted successfully!
                To manage the profile information for your facility, we&#39;ll
                need to verify your connection with the facility. Once verified
                you will be able to:
            </Typography>
            <List>
                <ListItem>
                    <ListItemIcon>
                        <CheckIcon style={checkIconStyles} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="headline">
                            Update facility location and address details
                        </Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <CheckIcon style={checkIconStyles} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="headline">
                            Specify production details and certifications
                        </Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <CheckIcon style={checkIconStyles} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="headline">
                            Share order minimums and average lead times
                        </Typography>
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <CheckIcon style={checkIconStyles} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="headline">
                            Add information about your head office and parent
                            company
                        </Typography>
                    </ListItemText>
                </ListItem>
            </List>
        </div>
    );
}
