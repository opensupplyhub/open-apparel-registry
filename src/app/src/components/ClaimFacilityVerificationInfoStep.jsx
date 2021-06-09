import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from 'react-select';
import isEmpty from 'lodash/isEmpty';
import { isURL } from 'validator';

import RequiredAsterisk from './RequiredAsterisk';

import {
    updateClaimAFacilityVerificationMethod,
    updateClaimAFacilityPreferredContactMethod,
    updateClaimAFacilityLinkedinProfile,
} from '../actions/claimFacility';

import { getValueFromEvent } from '../util/util';

import { claimAFacilityFormStyles } from '../util/styles';

import {
    claimAFacilityPreferredContactOptions,
    claimAFacilityFormFields,
} from '../util/constants';

const {
    verificationMethod: verificationMethodFormField,
    preferredContactMethod: preferredContactMethodFormField,
    linkedinProfile: linkedinProfileFormField,
} = claimAFacilityFormFields;

const selectStyles = Object.freeze({
    input: provided =>
        Object.freeze({
            ...provided,
            padding: '10px',
        }),
    menu: provided =>
        Object.freeze({
            ...provided,
            zIndex: '2',
        }),
});

function ClaimFacilityVerificationInfoStep({
    verificationMethod,
    updateVerification,
    preferredContactMethod,
    updateContactPreference,
    fetching,
    linkedinProfile,
    updateLinkedinProfile,
}) {
    return (
        <>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={preferredContactMethodFormField.id}>
                    <Typography variant="title">
                        {preferredContactMethodFormField.label}
                        <RequiredAsterisk />
                    </Typography>
                </InputLabel>
                <div style={claimAFacilityFormStyles.textFieldStyles}>
                    <Select
                        autoFocus
                        options={claimAFacilityPreferredContactOptions}
                        id={preferredContactMethodFormField.id}
                        value={preferredContactMethod}
                        onChange={updateContactPreference}
                        disabled={fetching}
                        styles={selectStyles}
                    />
                </div>
            </div>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={linkedinProfileFormField.id}>
                    <Typography variant="title">
                        {linkedinProfileFormField.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={linkedinProfileFormField.id}
                    error={!isEmpty(linkedinProfile) && !isURL(linkedinProfile)}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={linkedinProfile}
                    onChange={updateLinkedinProfile}
                    disabled={fetching}
                />
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
                <Typography style={{ marginRight: '20px' }}>
                    If you do not have a website or LinkedIn page for your
                    facility, or if those pages do not list the address of the
                    facility you wish to claim, please email{' '}
                    <a href="mailto:info@openapparel.org">
                        info@openapparel.org
                    </a>{' '}
                    with documentation confirming the address of your facility,
                    to assist the OAR team in verifying your claim.
                </Typography>
            </div>
        </>
    );
}

ClaimFacilityVerificationInfoStep.defaultProps = {
    preferredContactMethod: null,
};

ClaimFacilityVerificationInfoStep.propTypes = {
    verificationMethod: string.isRequired,
    preferredContactMethod: shape({
        value: string.isRequired,
        label: string.isRequired,
    }),
    fetching: bool.isRequired,
    updateVerification: func.isRequired,
    updateContactPreference: func.isRequired,
    linkedinProfile: string.isRequired,
    updateLinkedinProfile: func.isRequired,
};

function mapStateToProps({
    claimFacility: {
        claimData: {
            formData: {
                verificationMethod,
                preferredContactMethod,
                linkedinProfile,
            },
            fetching,
        },
    },
}) {
    return {
        verificationMethod,
        preferredContactMethod,
        fetching,
        linkedinProfile,
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
        updateLinkedinProfile: e =>
            dispatch(updateClaimAFacilityLinkedinProfile(getValueFromEvent(e))),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimFacilityVerificationInfoStep);
