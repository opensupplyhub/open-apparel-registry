import React from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';

import {
    updateClaimAFacilityContactPerson,
    updateClaimAFacilityEmail,
    updateClaimAFacilityPhoneNumber,
} from '../actions/claimFacility.js';

import { getValueFromEvent } from '../util/util';

import { claimAFacilityFormStyles } from '../util/styles';

import { claimAFacilityFormFields } from '../util/constants';

const { contactName, contactEmail, contactPhone } = claimAFacilityFormFields;

function ClaimFacilityContactInfoStep({
    contactPerson,
    updateContactPerson,
    email,
    updateEmail,
    phoneNumber,
    updatePhoneNumber,
    fetching,
}) {
    return (
        <>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={contactName.id}>
                    <Typography variant="title">{contactName.label}</Typography>
                </InputLabel>
                <TextField
                    id={contactName.id}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={contactPerson}
                    onChange={updateContactPerson}
                    disabled={fetching}
                />
            </div>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={contactEmail.id}>
                    <Typography variant="title">
                        {contactEmail.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={contactEmail.id}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={email}
                    onChange={updateEmail}
                    disabled={fetching}
                />
                <Typography variant="subheading">
                    Email on your account will be used by default
                </Typography>
            </div>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={contactPhone.id}>
                    <Typography variant="title">
                        {contactPhone.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={contactPhone.id}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={phoneNumber}
                    onChange={updatePhoneNumber}
                    disabled={fetching}
                />
            </div>
        </>
    );
}

ClaimFacilityContactInfoStep.propTypes = {
    contactPerson: string.isRequired,
    email: string.isRequired,
    phoneNumber: string.isRequired,
    fetching: bool.isRequired,
    updateContactPerson: func.isRequired,
    updateEmail: func.isRequired,
    updatePhoneNumber: func.isRequired,
};

function mapStateToProps({
    claimFacility: {
        claimData: {
            formData: { contactPerson, email, phoneNumber },
            fetching,
        },
    },
}) {
    return {
        contactPerson,
        email,
        phoneNumber,
        fetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateContactPerson: e =>
            dispatch(updateClaimAFacilityContactPerson(getValueFromEvent(e))),
        updateEmail: e =>
            dispatch(updateClaimAFacilityEmail(getValueFromEvent(e))),
        updatePhoneNumber: e =>
            dispatch(updateClaimAFacilityPhoneNumber(getValueFromEvent(e))),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimFacilityContactInfoStep);
