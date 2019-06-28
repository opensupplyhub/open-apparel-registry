import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckIcon from '@material-ui/icons/Check';

import { claimAFacilityFormStyles } from '../util/styles';

import COLOURS from '../util/COLOURS';

const introMessageStyles = Object.freeze({
    width: '95%',
    padding: '10px',
});

const checkIconStyles = Object.freeze({
    color: COLOURS.NAVY_BLUE,
});

export default function ClaimFacilityIntroStep() {
    return (
        <div style={claimAFacilityFormStyles.inputGroupStyles}>
            <Typography variant="headline" style={introMessageStyles}>
                Owners or senior management at facilities listed on the OAR are
                able to &quot;claim&quot; their facility&#39;s profile on the site and add
                business information to it.
            </Typography>
            <Typography variant="headline" style={introMessageStyles}>
                If you are a facility owner or senior management, please work
                your way through the following three preliminary steps to
                verify your identity. This process should take no more than 5
                minutes to complete.
            </Typography>
            <Typography variant="headline" style={introMessageStyles}>
                Once your claim has been reviewed and approved, you will be able to:
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
                            Add information about your head office and parent company
                        </Typography>
                    </ListItemText>
                </ListItem>
            </List>
            <Typography variant="title" style={introMessageStyles}>
                This information will be shown publicly on the facility details page.
            </Typography>
        </div>
    );
}
