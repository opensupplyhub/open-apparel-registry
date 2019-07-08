import React from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import isEmpty from 'lodash/isEmpty';
import { isURL } from 'validator';
import Select from 'react-select';

import RequiredAsterisk from './RequiredAsterisk';

import {
    updateClaimAFacilityCompany,
    updateClaimAFacilityWebsite,
    updateClaimAFacilityDescription,
    updateClaimAFacilityParentCompany,
} from '../actions/claimFacility';

import { getValueFromEvent } from '../util/util';

import { claimAFacilityFormStyles } from '../util/styles';

import { claimAFacilityFormFields } from '../util/constants';

import { contributorOptionsPropType } from '../util/propTypes';

const {
    companyName: companyFormField,
    website: websiteFormField,
    facilityDescription: descriptionFormField,
    parentCompany: parentCompanyFormField,
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

function ClaimFacilityFacilityInfoStep({
    companyName,
    updateCompany,
    website,
    updateWebsite,
    facilityDescription,
    updateDescription,
    fetching,
    contributorOptions,
    parentCompany,
    updateParentCompany,
}) {
    return (
        <>
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={companyFormField.id}>
                    <Typography variant="title">
                        {companyFormField.label}
                        <RequiredAsterisk />
                    </Typography>
                </InputLabel>
                <TextField
                    autoFocus
                    error={isEmpty(companyName)}
                    id={companyFormField.id}
                    variant="outlined"
                    style={claimAFacilityFormStyles.textFieldStyles}
                    value={companyName}
                    onChange={updateCompany}
                    disabled={fetching}
                />
            </div>
            {
                contributorOptions && (
                    <div style={claimAFacilityFormStyles.inputGroupStyles}>
                        <InputLabel htmlFor={parentCompanyFormField.id}>
                            <Typography variant="title">
                                {parentCompanyFormField.label}
                            </Typography>
                        </InputLabel>
                        <aside style={claimAFacilityFormStyles.asideStyles}>
                            {parentCompanyFormField.aside}
                        </aside>
                        <div style={claimAFacilityFormStyles.textFieldStyles}>
                            <Select
                                options={contributorOptions}
                                id={parentCompanyFormField.id}
                                value={parentCompany}
                                onChange={updateParentCompany}
                                disabled={fetching}
                                styles={selectStyles}
                            />
                        </div>
                    </div>
                )
            }
            <div style={claimAFacilityFormStyles.inputGroupStyles}>
                <InputLabel htmlFor={websiteFormField.id}>
                    <Typography variant="title">
                        {websiteFormField.label}
                    </Typography>
                </InputLabel>
                <TextField
                    id={websiteFormField.id}
                    error={!isEmpty(website) && !isURL(website)}
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

ClaimFacilityFacilityInfoStep.defaultProps = {
    contributorOptions: null,
    parentCompany: null,
};

ClaimFacilityFacilityInfoStep.propTypes = {
    companyName: string.isRequired,
    website: string.isRequired,
    facilityDescription: string.isRequired,
    fetching: bool.isRequired,
    updateCompany: func.isRequired,
    updateWebsite: func.isRequired,
    updateDescription: func.isRequired,
    contributorOptions: contributorOptionsPropType,
    parentCompany: shape({
        value: number.isRequired,
        label: string.isRequired,
    }),
    updateParentCompany: func.isRequired,
};

function mapStateToProps({
    claimFacility: {
        claimData: {
            formData: { companyName, website, facilityDescription, parentCompany },
            fetching,
        },
        parentCompanyOptions: {
            data: contributorOptions,
        },
    },
}) {
    return {
        companyName,
        website,
        facilityDescription,
        fetching,
        contributorOptions,
        parentCompany,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateCompany: e =>
            dispatch(updateClaimAFacilityCompany(getValueFromEvent(e))),
        updateParentCompany: v => dispatch(updateClaimAFacilityParentCompany(v)),
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
