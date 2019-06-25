import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from 'react-select';

import RequiredAsterisk from './RequiredAsterisk';

import {
    updateClaimAFacilityVerificationMethod,
    updateClaimAFacilityPreferredContactMethod,
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
)(ClaimFacilityVerificationInfoStep);
