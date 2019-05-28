import React from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';

import {
    updateClaimAFacilityCompany,
    updateClaimAFacilityWebsite,
    updateClaimAFacilityDescription,
} from '../actions/claimFacility';

import { getValueFromEvent } from '../util/util';

import { claimAFacilityFormStyles } from '../util/styles';

import { claimAFacilityFormFields } from '../util/constants';

const {
    companyName: companyFormField,
    website: websiteFormField,
    facilityDescription: descriptionFormField,
} = claimAFacilityFormFields;

function ClaimFacilityFacilityInfoStep({
    companyName,
    updateCompany,
    website,
    updateWebsite,
    facilityDescription,
    updateDescription,
    fetching,
}) {
    return (
        <>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={companyFormField.id}>
                    <Typography variant="title">
                        {companyFormField.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={companyFormField.id}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={companyName}
                    onChange={updateCompany}
                    disabled={fetching}
                />
            </div>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={websiteFormField.id}>
                    <Typography variant="title">
                        {websiteFormField.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={websiteFormField.id}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={website}
                    onChange={updateWebsite}
                    disabled={fetching}
                />
            </div>
            <div>
                <InputLabel htmlFor={descriptionFormField.id}>
                    <Typography variant="title">
                        {descriptionFormField.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={descriptionFormField.label}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    multiline
                    rows={4}
                    value={facilityDescription}
                    onChange={updateDescription}
                    disabled={fetching}
                />
            </div>
        </>
    );
}

ClaimFacilityFacilityInfoStep.propTypes = {
    companyName: string.isRequired,
    website: string.isRequired,
    facilityDescription: string.isRequired,
    fetching: bool.isRequired,
    updateCompany: func.isRequired,
    updateWebsite: func.isRequired,
    updateDescription: func.isRequired,
};

function mapStateToProps({
    claimFacility: {
        claimData: {
            formData: { companyName, website, facilityDescription },
            fetching,
        },
    },
}) {
    return {
        companyName,
        website,
        facilityDescription,
        fetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateCompany: e =>
            dispatch(updateClaimAFacilityCompany(getValueFromEvent(e))),
        updateWebsite: e =>
            dispatch(updateClaimAFacilityWebsite(getValueFromEvent(e))),
        updateDescription: e =>
            dispatch(updateClaimAFacilityDescription(getValueFromEvent(e))),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimFacilityFacilityInfoStep);
