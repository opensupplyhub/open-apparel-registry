import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, string } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import flow from 'lodash/flow';
import noop from 'lodash/noop';
import memoize from 'lodash/memoize';
import find from 'lodash/find';
import stubFalse from 'lodash/stubFalse';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import isNull from 'lodash/isNull';
import Select from 'react-select';
import { isEmail } from 'validator';
import { toast } from 'react-toastify';

import ClaimedFacilitiesDetailsSidebar from './ClaimedFacilitiesDetailsSidebar';
import ShowOnly from './ShowOnly';

import COLOURS from '../util/COLOURS';

import {
    fetchClaimedFacilityDetails,
    clearClaimedFacilityDetails,
    updateClaimedFacilityName,
    updateClaimedFacilityAddress,
    updateClaimedFacilityPhone,
    updateClaimedFacilityPhoneVisibility,
    updateClaimedFacilityParentCompany,
    updateClaimedFacilityWebsite,
    updateClaimedFacilityDescription,
    updateClaimedFacilityMinimumOrder,
    updateClaimedFacilityAverageLeadTime,
    updateClaimedFacilityContactPersonName,
    updateClaimedFacilityContactEmail,
    updateClaimedFacilityPointOfContactVisibility,
    updateClaimedFacilityOfficeVisibility,
    updateClaimedFacilityOfficeName,
    updateClaimedFacilityOfficeAddress,
    updateClaimedFacilityOfficeCountry,
    updateClaimedFacilityOfficePhone,
    submitClaimedFacilityDetailsUpdate,
} from '../actions/claimedFacilityDetails';

import {
    approvedFacilityClaimPropType,
    contributorOptionsPropType,
} from '../util/propTypes';

import {
    getValueFromEvent,
    getCheckedFromEvent,
    mapDjangoChoiceTuplesToSelectOptions,
} from '../util/util';

import { claimAFacilityFormFields } from '../util/constants';

const {
    parentCompany: {
        aside: parentCompanyAside,
    },
} = claimAFacilityFormFields;

const claimedFacilitiesDetailsStyles = Object.freeze({
    containerStyles: Object.freeze({
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: '100px',
    }),
    formStyles: Object.freeze({
        width: '60%',
    }),
    headingStyles: Object.freeze({
        padding: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    inputSectionStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 0',
    }),
    inputSectionLabelStyles: Object.freeze({
        fontSize: '18px',
        fontWeight: '400',
        padding: '10px 0',
        color: '#000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    inputSectionFieldStyles: Object.freeze({
        width: '100%',
    }),
    switchSectionStyles: Object.freeze({
        fontSize: '15px',
        fontWeight: '400',
        display: 'flex',
        alignItems: 'center',
        color: COLOURS.DARK_GREY,
    }),
    controlStyles: Object.freeze({
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
    }),
    errorStyles: Object.freeze({
        width: '100%',
        padding: '10px 0',
        color: 'red',
    }),
    asideStyles: Object.freeze({
        padding: '5px 20px 20px 0',
    }),
});

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

const InputSection = ({
    label,
    value,
    multiline,
    onChange,
    hasSwitch = false,
    switchValue = null,
    onSwitchChange = noop,
    disabled = false,
    isSelect = false,
    selectOptions = null,
    hasValidationErrorFn = stubFalse,
    aside = null,
}) => {
    const asideNode = (
        <ShowOnly when={!isNull(aside)}>
            <aside style={claimedFacilitiesDetailsStyles.asideStyles}>
                {aside}
            </aside>
        </ShowOnly>
    );

    if (isSelect) {
        return (
            <div style={claimedFacilitiesDetailsStyles.inputSectionStyles}>
                <InputLabel
                    style={
                        claimedFacilitiesDetailsStyles.inputSectionLabelStyles
                    }
                >
                    {label}
                </InputLabel>
                {asideNode}
                <Select
                    onChange={onChange}
                    value={find(selectOptions, ['value', value])}
                    options={selectOptions}
                    disabled={disabled}
                    styles={selectStyles}
                />
            </div>
        );
    }

    return (
        <div style={claimedFacilitiesDetailsStyles.inputSectionStyles}>
            <InputLabel
                style={claimedFacilitiesDetailsStyles.inputSectionLabelStyles}
            >
                {label}
                {hasSwitch ? (
                    <span
                        style={
                            claimedFacilitiesDetailsStyles.switchSectionStyles
                        }
                    >
                        <Switch
                            color="primary"
                            onChange={onSwitchChange}
                            checked={switchValue}
                            style={{ zIndex: 1 }}
                        />
                        Publicly visible
                    </span>
                ) : null}
            </InputLabel>
            {asideNode}
            <TextField
                variant="outlined"
                style={claimedFacilitiesDetailsStyles.inputSectionFieldStyles}
                value={value}
                multiline={multiline}
                rows={6}
                onChange={onChange}
                disabled={disabled}
                error={hasValidationErrorFn()}
            />
        </div>
    );
};

const createCountrySelectOptions = memoize(
    mapDjangoChoiceTuplesToSelectOptions,
);

function ClaimedFacilitiesDetails({
    fetching,
    error,
    data,
    getDetails,
    clearDetails,
    updateFacilityName,
    updateFacilityAddress,
    updateFacilityPhone,
    updateFacilityWebsite,
    updateFacilityDescription,
    updateFacilityMinimumOrder,
    updateFacilityAverageLeadTime,
    updateContactPerson,
    updateContactEmail,
    updateOfficeName,
    updateOfficeAddress,
    updateOfficeCountry,
    updateOfficePhone,
    submitUpdate,
    updating,
    updateFacilityPhoneVisibility,
    updateContactVisibility,
    updateOfficeVisibility,
    errorUpdating,
    updateParentCompany,
    contributorOptions,
}) {
    /* eslint-disable react-hooks/exhaustive-deps */
    // disabled because we want to use this as just
    // componentDidMount and componentWillUpdate and declaring the
    // methods in the array here caused an infinite loop for some reason
    useEffect(() => {
        getDetails();

        return clearDetails;
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    const [isSavingForm, setIsSavingForm] = useState(false);

    useEffect(() => {
        if (updating || errorUpdating) {
            noop();
        }

        if (!updating && isSavingForm) {
            setIsSavingForm(false);

            if (!errorUpdating) {
                toast('Claimed facility profile was saved');
            }
        }
    }, [isSavingForm, setIsSavingForm, updating, errorUpdating]);

    const saveForm = () => {
        submitUpdate();
        setIsSavingForm(true);
    };

    if (fetching) {
        return <CircularProgress />;
    }

    if (error) {
        return (
            <Typography variant="body1">
                An error prevented fetching that facility claim.
            </Typography>
        );
    }

    if (!data) {
        return null;
    }

    const countryOptions = createCountrySelectOptions(data.countries);

    return (
        <div style={claimedFacilitiesDetailsStyles.containerStyles}>
            <div style={claimedFacilitiesDetailsStyles.formStyles}>
                <Typography
                    variant="title"
                    style={claimedFacilitiesDetailsStyles.headingStyles}
                >
                    Facility Details
                </Typography>
                <InputSection
                    label="Facility name"
                    value={data.facility_name}
                    onChange={updateFacilityName}
                    disabled={updating}
                />
                <InputSection
                    label="Address"
                    value={data.facility_address}
                    onChange={updateFacilityAddress}
                    disabled={updating}
                />
                <InputSection
                    label="Phone Number"
                    value={data.facility_phone_number}
                    onChange={updateFacilityPhone}
                    disabled={updating}
                    hasSwitch
                    switchValue={data.facility_phone_number_publicly_visible}
                    onSwitchChange={updateFacilityPhoneVisibility}
                />
                <InputSection
                    label="Website"
                    value={data.facility_website}
                    onChange={updateFacilityWebsite}
                    disabled={updating}
                />
                <InputSection
                    label="Description"
                    value={data.facility_description}
                    multiline
                    onChange={updateFacilityDescription}
                    disabled={updating}
                />
                <ShowOnly when={!isEmpty(contributorOptions)}>
                    <InputSection
                        label="Parent Company"
                        aside={parentCompanyAside}
                        value={get(data, 'facility_parent_company.id', null)}
                        onChange={updateParentCompany}
                        disabled={updating}
                        isSelect
                        selectOptions={contributorOptions}
                    />
                </ShowOnly>
                <ShowOnly when={!contributorOptions}>
                    <Typography>
                        Parent Company
                    </Typography>
                    <Typography>
                        {get(data, 'facility_parent_company.name', null)}
                    </Typography>
                </ShowOnly>
                <InputSection
                    label="Minimum order quantity"
                    value={data.facility_minimum_order_quantity}
                    onChange={updateFacilityMinimumOrder}
                    disabled={updating}
                />
                <InputSection
                    label="Average lead time"
                    value={data.facility_average_lead_time}
                    onChange={updateFacilityAverageLeadTime}
                    disabled={updating}
                />
                <Typography
                    variant="title"
                    style={claimedFacilitiesDetailsStyles.headingStyles}
                >
                    Point of contact
                    <span
                        style={
                            claimedFacilitiesDetailsStyles.switchSectionStyles
                        }
                    >
                        <Switch
                            color="primary"
                            onChange={updateContactVisibility}
                            checked={data.point_of_contact_publicly_visible}
                        />
                        Publicly visible
                    </span>
                </Typography>
                <InputSection
                    label="Contact person name"
                    value={data.point_of_contact_person_name}
                    onChange={updateContactPerson}
                    disabled={updating}
                />
                <InputSection
                    label="Email"
                    value={data.point_of_contact_email}
                    onChange={updateContactEmail}
                    disabled={updating}
                    hasValidationErrorFn={
                        () => {
                            if (isEmpty(data.point_of_contact_email)) {
                                return false;
                            }

                            return !isEmail(data.point_of_contact_email);
                        }
                    }
                />
                <Typography
                    variant="headline"
                    style={claimedFacilitiesDetailsStyles.headingStyles}
                >
                    Office information
                    <span
                        style={
                            claimedFacilitiesDetailsStyles.switchSectionStyles
                        }
                    >
                        <Switch
                            color="primary"
                            onChange={updateOfficeVisibility}
                            checked={data.office_info_publicly_visible}
                        />
                        Publicly visible
                    </span>
                </Typography>
                <InputSection
                    label="Office name"
                    value={data.office_official_name}
                    onChange={updateOfficeName}
                    disabled={updating}
                />
                <InputSection
                    label="Address"
                    value={data.office_address}
                    onChange={updateOfficeAddress}
                    disabled={updating}
                />
                <InputSection
                    label="Country"
                    value={data.office_country_code}
                    onChange={updateOfficeCountry}
                    disabled={updating}
                    isSelect
                    selectOptions={countryOptions}
                />
                <InputSection
                    label="Phone number"
                    value={data.office_phone_number}
                    onChange={updateOfficePhone}
                    disabled={updating}
                />
                {errorUpdating && (
                    <div style={claimedFacilitiesDetailsStyles.errorStyles}>
                        <Typography variant="body1">
                            <span style={{ color: 'red' }}>
                                The following errors prevented updating the
                                facility claim:
                            </span>
                        </Typography>
                        <ul>
                            {errorUpdating.map(err => (
                                <li key={err}>
                                    <span style={{ color: 'red' }}>{err}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div style={claimedFacilitiesDetailsStyles.controlStyles}>
                    <Button
                        onClick={saveForm}
                        variant="contained"
                        color="primary"
                        disabled={
                            updating || (!isEmpty(data.point_of_contact_email)
                                         && !isEmail(data.point_of_contact_email))
                        }
                    >
                        Save
                    </Button>
                    {updating && <CircularProgress />}
                </div>
            </div>
            <ClaimedFacilitiesDetailsSidebar facilityDetails={data.facility} />
        </div>
    );
}

ClaimedFacilitiesDetails.defaultProps = {
    error: null,
    data: null,
    errorUpdating: null,
    contributorOptions: null,
};

ClaimedFacilitiesDetails.propTypes = {
    fetching: bool.isRequired,
    error: arrayOf(string),
    data: approvedFacilityClaimPropType,
    getDetails: func.isRequired,
    clearDetails: func.isRequired,
    updateFacilityName: func.isRequired,
    updateFacilityAddress: func.isRequired,
    updateFacilityPhone: func.isRequired,
    updateFacilityWebsite: func.isRequired,
    updateFacilityDescription: func.isRequired,
    updateFacilityMinimumOrder: func.isRequired,
    updateFacilityAverageLeadTime: func.isRequired,
    updateContactPerson: func.isRequired,
    updateContactEmail: func.isRequired,
    updateOfficeName: func.isRequired,
    updateOfficeAddress: func.isRequired,
    updateOfficeCountry: func.isRequired,
    updateOfficePhone: func.isRequired,
    submitUpdate: func.isRequired,
    updating: bool.isRequired,
    errorUpdating: arrayOf(string),
    updateFacilityPhoneVisibility: func.isRequired,
    updateContactVisibility: func.isRequired,
    updateOfficeVisibility: func.isRequired,
    contributorOptions: contributorOptionsPropType,
};

function mapStateToProps({
    claimedFacilityDetails: {
        retrieveData: { fetching, error },
        updateData: { fetching: updating, error: errorUpdating },
        data,
    },
}) {
    const contributorOptions = data && data.contributors
        ? mapDjangoChoiceTuplesToSelectOptions(data.contributors)
        : null;

    return {
        fetching,
        data,
        error,
        updating,
        errorUpdating,
        contributorOptions,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { claimID },
        },
    },
) {
    const makeDispatchValueFn = updateFn =>
        flow(
            getValueFromEvent,
            updateFn,
            dispatch,
        );

    const makeDispatchCheckedFn = updateFn =>
        flow(
            getCheckedFromEvent,
            updateFn,
            dispatch,
        );

    return {
        getDetails: () => dispatch(fetchClaimedFacilityDetails(claimID)),
        clearDetails: () => dispatch(clearClaimedFacilityDetails()),
        updateFacilityName: makeDispatchValueFn(updateClaimedFacilityName),
        updateFacilityAddress: makeDispatchValueFn(
            updateClaimedFacilityAddress,
        ),
        updateFacilityPhone: makeDispatchValueFn(updateClaimedFacilityPhone),
        updateFacilityPhoneVisibility: makeDispatchCheckedFn(
            updateClaimedFacilityPhoneVisibility,
        ),
        updateParentCompany: ({ label, value }) =>
            dispatch(updateClaimedFacilityParentCompany({
                id: value,
                name: label,
            })),
        updateContactVisibility: makeDispatchCheckedFn(
            updateClaimedFacilityPointOfContactVisibility,
        ),
        updateOfficeVisibility: makeDispatchCheckedFn(
            updateClaimedFacilityOfficeVisibility,
        ),
        updateFacilityWebsite: makeDispatchValueFn(
            updateClaimedFacilityWebsite,
        ),
        updateFacilityDescription: makeDispatchValueFn(
            updateClaimedFacilityDescription,
        ),
        updateFacilityMinimumOrder: makeDispatchValueFn(
            updateClaimedFacilityMinimumOrder,
        ),
        updateFacilityAverageLeadTime: makeDispatchValueFn(
            updateClaimedFacilityAverageLeadTime,
        ),
        updateContactPerson: makeDispatchValueFn(
            updateClaimedFacilityContactPersonName,
        ),
        updateContactEmail: makeDispatchValueFn(
            updateClaimedFacilityContactEmail,
        ),
        updateOfficeName: makeDispatchValueFn(updateClaimedFacilityOfficeName),
        updateOfficeAddress: makeDispatchValueFn(
            updateClaimedFacilityOfficeAddress,
        ),
        updateOfficeCountry: ({ value }) =>
            dispatch(updateClaimedFacilityOfficeCountry(value)),
        updateOfficePhone: makeDispatchValueFn(
            updateClaimedFacilityOfficePhone,
        ),
        submitUpdate: () =>
            dispatch(submitClaimedFacilityDetailsUpdate(claimID)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimedFacilitiesDetails);
