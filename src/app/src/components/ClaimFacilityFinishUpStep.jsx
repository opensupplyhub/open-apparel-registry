import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckIcon from '@material-ui/icons/Check';
import Select from 'react-select';

import {
    updateClaimAFacilityVerificationMethod,
    updateClaimAFacilityPreferredContactMethod,
} from '../actions/claimFacility';

import { getValueFromEvent } from '../util/util';

import { claimAFacilityFormStyles } from '../util/styles';

import {
    claimAFacilitySelectOptions,
    claimAFacilityFormFields,
} from '../util/constants';

const {
    verificationMethod: verificationMethodFormField,
    preferredContactMethod: preferredContactMethodFormField,
} = claimAFacilityFormFields;

const checkIconStyles = Object.freeze({
    color: '#0427a4',
});

function ClaimFacilityFinishUpStep({
    verificationMethod,
    updateVerification,
    preferredContactMethod,
    updateContactPreference,
    fetching,
}) {
    return (
        <>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <Typography variant="headline">
                    To manage your facility, you&#39;ll need to verify your
                    connection with the facility. Once verified you will be able
                    to:
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
                                Manage more facility and office information
                            </Typography>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckIcon style={checkIconStyles} />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="headline">
                                Highlight order minimums and average lead time
                            </Typography>
                        </ListItemText>
                    </ListItem>
                </List>
            </div>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={verificationMethodFormField.id}>
                    <Typography variant="title">
                        {verificationMethodFormField.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={verificationMethodFormField.id}
                    variant="outlined"
                    multiline
                    rows={4}
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={verificationMethod}
                    onChange={updateVerification}
                    disabled={fetching}
                />
            </div>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={preferredContactMethodFormField.id}>
                    <Typography variant="title">
                        {preferredContactMethodFormField.label}
                    </Typography>
                </InputLabel>
                <div style={claimAFacilityFormStyles.textFieldStyles}>
                    <Select
                        options={claimAFacilitySelectOptions}
                        id={preferredContactMethodFormField.id}
                        value={preferredContactMethod}
                        onChange={updateContactPreference}
                        disabled={fetching}
                    />
                </div>
            </div>
        </>
    );
}

ClaimFacilityFinishUpStep.defaultProps = {
    preferredContactMethod: null,
};

ClaimFacilityFinishUpStep.propTypes = {
    verificationMethod: string.isRequired,
    preferredContactMethod: shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
    fetching: bool.isRequired,
    updateVerification: func.isRequired,
    updateContactPreference: func.isRequired,
};

function mapStateToProps({
    claimFacility: {
        claimData: {
            formData: { verificationMethod, preferredContactMethod },
            fetching,
        },
    },
}) {
    return {
        verificationMethod,
        preferredContactMethod,
        fetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateVerification: e =>
            dispatch(
                updateClaimAFacilityVerificationMethod(getValueFromEvent(e)),
            ),
        updateContactPreference: v =>
            dispatch(updateClaimAFacilityPreferredContactMethod(v)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimFacilityFinishUpStep);
