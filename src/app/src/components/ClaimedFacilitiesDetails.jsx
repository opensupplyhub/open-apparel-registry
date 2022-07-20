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
import map from 'lodash/map';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isNull from 'lodash/isNull';
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { isEmail, isInt } from 'validator';
import { toast } from 'react-toastify';

import ClaimedFacilitiesDetailsSidebar from './ClaimedFacilitiesDetailsSidebar';
import ShowOnly from './ShowOnly';
import CreatableInputOnly from './CreatableInputOnly';

import COLOURS from '../util/COLOURS';

import {
    fetchClaimedFacilityDetails,
    clearClaimedFacilityDetails,
    updateClaimedFacilityNameEnglish,
    updateClaimedFacilityNameNativeLanguage,
    updateClaimedFacilityWorkersCount,
    updateClaimedFacilityFemaleWorkersPercentage,
    updateClaimedFacilityAffiliations,
    updateClaimedFacilityCertifications,
    updateClaimedFacilityProductTypes,
    updateClaimedFacilityProductionTypes,
    updateClaimedFacilityAddress,
    updateClaimedSector,
    updateClaimedFacilityPhone,
    updateClaimedFacilityPhoneVisibility,
    updateClaimedFacilityParentCompany,
    updateClaimedFacilityWebsite,
    updateClaimedFacilityWebsiteVisibility,
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
    fetchParentCompanyOptions,
    fetchSectorOptions,
} from '../actions/filterOptions';

import {
    approvedFacilityClaimPropType,
    parentCompanyOptionsPropType,
    sectorOptionsPropType,
} from '../util/propTypes';

import {
    getValueFromEvent,
    getCheckedFromEvent,
    mapDjangoChoiceTuplesToSelectOptions,
    isValidFacilityURL,
} from '../util/util';

import { claimAFacilityFormFields } from '../util/constants';

const {
    parentCompany: { aside: parentCompanyAside },
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
    isMultiSelect = false,
    isCreatable = false,
    selectOptions = null,
    hasValidationErrorFn = stubFalse,
    aside = null,
    selectPlaceholder = 'Select...',
}) => {
    let SelectComponent = null;

    const asideNode = (
        <ShowOnly when={!isNull(aside)}>
            <aside style={claimedFacilitiesDetailsStyles.asideStyles}>
                {aside}
            </aside>
        </ShowOnly>
    );

    if (isSelect) {
        const selectValue = (() => {
            if (!isCreatable && !isMultiSelect) {
                return find(selectOptions, ['value', value]);
            }

            if (!isCreatable && isMultiSelect) {
                return filter(selectOptions, ({ value: option }) =>
                    includes(value, option),
                );
            }

            if (isCreatable && isMultiSelect) {
                return map(value, s => ({ value: s, label: s }));
            }

            // isCreatable && !isMultiSelect creates an option object from the value
            return {
                value,
                label: value,
            };
        })();

        if (isCreatable) {
            SelectComponent = selectOptions ? Creatable : CreatableInputOnly;
        } else {
            SelectComponent = Select;
        }

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
                <SelectComponent
                    onChange={onChange}
                    value={selectValue}
                    options={selectOptions}
                    disabled={disabled}
                    styles={selectStyles}
                    isMulti={isMultiSelect}
                    placeholder={selectPlaceholder}
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
    updateFacilityNameEnglish,
    updateFacilityNameNativeLanguage,
    updateFacilityAddress,
    updateSector,
    updateFacilityPhone,
    updateFacilityWebsite,
    updateFacilityWebsiteVisibility,
    updateFacilityDescription,
    updateFacilityMinimumOrder,
    updateFacilityAverageLeadTime,
    updateFacilityWorkersCount,
    updateFacilityFemaleWorkersPercentage,
    updateFacilityAffiliations,
    updateFacilityCertifications,
    updateFacilityProductTypes,
    updateFacilityProductionTypes,
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
    sectorOptions,
    parentCompanyOptions,
    fetchSectors,
    fetchParentCompanies,
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
    useEffect(() => {
        if (!parentCompanyOptions) {
            fetchParentCompanies();
        }
    }, [parentCompanyOptions, fetchParentCompanies]);
    useEffect(() => {
        if (!sectorOptions) {
            fetchSectors();
        }
    }, [sectorOptions, fetchSectors]);

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
                    label="Facility name (English language)"
                    value={data.facility_name_english}
                    onChange={updateFacilityNameEnglish}
                    disabled={updating}
                />
                <InputSection
                    label="Facility name (native language)"
                    value={data.facility_name_native_language}
                    onChange={updateFacilityNameNativeLanguage}
                    disabled={updating}
                />
                <InputSection
                    label="Address"
                    value={data.facility_address}
                    onChange={updateFacilityAddress}
                    disabled={updating}
                />
                <InputSection
                    label="Sector"
                    value={get(data, 'sector', [])}
                    onChange={updateSector}
                    disabled={updating}
                    isSelect
                    isMultiSelect
                    isCreatable
                    selectOptions={sectorOptions || []}
                    selectPlaceholder="e.g. Apparel - Use <Enter> or <Tab> to add multiple values"
                />
                <InputSection label="Product Types" />
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
                    hasValidationErrorFn={() => {
                        if (isEmpty(data.facility_website)) {
                            return false;
                        }

                        return !isValidFacilityURL(data.facility_website);
                    }}
                    hasSwitch
                    switchValue={data.facility_website_publicly_visible}
                    onSwitchChange={updateFacilityWebsiteVisibility}
                />
                <InputSection
                    label="Description"
                    value={data.facility_description}
                    multiline
                    onChange={updateFacilityDescription}
                    disabled={updating}
                />
                <ShowOnly when={!isEmpty(parentCompanyOptions)}>
                    <InputSection
                        label="Parent Company / Supplier Group"
                        aside={parentCompanyAside}
                        value={get(data, 'facility_parent_company.id', null)}
                        onChange={updateParentCompany}
                        disabled={updating}
                        isSelect
                        selectOptions={parentCompanyOptions}
                    />
                </ShowOnly>
                <ShowOnly when={!parentCompanyOptions}>
                    <Typography>Parent Company / Supplier Group</Typography>
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
                <InputSection
                    label="Number of workers"
                    value={data.facility_workers_count}
                    onChange={updateFacilityWorkersCount}
                    disabled={updating}
                    hasValidationErrorFn={() => {
                        if (isEmpty(data.facility_workers_count)) {
                            return false;
                        }

                        return !isInt(data.facility_workers_count, { min: 0 });
                    }}
                />
                <InputSection
                    label="Percentage of female workers"
                    value={data.facility_female_workers_percentage}
                    onChange={updateFacilityFemaleWorkersPercentage}
                    disabled={updating}
                    hasValidationErrorFn={() => {
                        if (isEmpty(data.facility_female_workers_percentage)) {
                            return false;
                        }

                        return !isInt(data.facility_female_workers_percentage, {
                            min: 0,
                            max: 100,
                        });
                    }}
                />
                <InputSection
                    label="Affiliations"
                    value={get(data, 'facility_affiliations', [])}
                    onChange={updateFacilityAffiliations}
                    disabled={updating}
                    isSelect
                    isMultiSelect
                    selectOptions={mapDjangoChoiceTuplesToSelectOptions(
                        data.affiliation_choices,
                    )}
                />
                <InputSection
                    label="Certifications/Standards/Regulations"
                    value={get(data, 'facility_certifications', [])}
                    onChange={updateFacilityCertifications}
                    disabled={updating}
                    isSelect
                    isMultiSelect
                    selectOptions={mapDjangoChoiceTuplesToSelectOptions(
                        data.certification_choices,
                    )}
                />
                <InputSection
                    label="Facility / Processing Types"
                    value={get(data, 'facility_production_types', [])}
                    onChange={updateFacilityProductionTypes}
                    disabled={updating}
                    isSelect
                    isMultiSelect
                    selectOptions={mapDjangoChoiceTuplesToSelectOptions(
                        data.production_type_choices,
                    )}
                />
                <InputSection
                    label="Product Types"
                    value={get(data, 'facility_product_types', [])}
                    onChange={updateFacilityProductTypes}
                    disabled={updating}
                    isSelect
                    isMultiSelect
                    isCreatable
                    selectPlaceholder="e.g. Jackets - Use <Enter> or <Tab> to add multiple values"
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
                    hasValidationErrorFn={() => {
                        if (isEmpty(data.point_of_contact_email)) {
                            return false;
                        }

                        return !isEmail(data.point_of_contact_email);
                    }}
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
                <aside style={claimedFacilitiesDetailsStyles.asideStyles}>
                    If different from facility address
                </aside>
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
                    selectOptions={countryOptions || []}
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
                            updating ||
                            (!isEmpty(data.point_of_contact_email) &&
                                !isEmail(data.point_of_contact_email)) ||
                            (!isEmpty(data.facility_website) &&
                                !isValidFacilityURL(data.facility_website))
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
    sectorOptions: null,
    parentCompanyOptions: null,
};

ClaimedFacilitiesDetails.propTypes = {
    fetching: bool.isRequired,
    error: arrayOf(string),
    data: approvedFacilityClaimPropType,
    getDetails: func.isRequired,
    clearDetails: func.isRequired,
    updateFacilityNameEnglish: func.isRequired,
    updateFacilityNameNativeLanguage: func.isRequired,
    updateFacilityWorkersCount: func.isRequired,
    updateFacilityFemaleWorkersPercentage: func.isRequired,
    updateFacilityAddress: func.isRequired,
    updateFacilityPhone: func.isRequired,
    updateFacilityWebsite: func.isRequired,
    updateFacilityWebsiteVisibility: func.isRequired,
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
    sectorOptions: sectorOptionsPropType,
    parentCompanyOptions: parentCompanyOptionsPropType,
    fetchSectors: func.isRequired,
};

function mapStateToProps({
    claimedFacilityDetails: {
        retrieveData: { fetching: fetchingData, error },
        updateData: { fetching: updating, error: errorUpdating },
        data,
    },
    filterOptions: {
        sectors: { data: sectorOptions, fetching: fetchingSectors },
        parentCompanies: {
            data: parentCompanyOptions,
            fetching: fetchingParentCompanies,
        },
    },
}) {
    return {
        fetching: fetchingData || fetchingSectors || fetchingParentCompanies,
        data,
        error,
        updating,
        errorUpdating,
        sectorOptions,
        parentCompanyOptions,
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
        flow(getValueFromEvent, updateFn, dispatch);

    const makeDispatchCheckedFn = updateFn =>
        flow(getCheckedFromEvent, updateFn, dispatch);

    const makeDispatchMultiSelectFn = updateFn =>
        flow(selection => map(selection, 'value'), updateFn, dispatch);

    return {
        getDetails: () => dispatch(fetchClaimedFacilityDetails(claimID)),
        clearDetails: () => dispatch(clearClaimedFacilityDetails()),
        updateFacilityNameEnglish: makeDispatchValueFn(
            updateClaimedFacilityNameEnglish,
        ),
        updateFacilityNameNativeLanguage: makeDispatchValueFn(
            updateClaimedFacilityNameNativeLanguage,
        ),
        updateFacilityAddress: makeDispatchValueFn(
            updateClaimedFacilityAddress,
        ),
        updateSector: makeDispatchMultiSelectFn(updateClaimedSector),
        updateFacilityPhone: makeDispatchValueFn(updateClaimedFacilityPhone),
        updateFacilityPhoneVisibility: makeDispatchCheckedFn(
            updateClaimedFacilityPhoneVisibility,
        ),
        updateParentCompany: ({ label, value }) =>
            dispatch(
                updateClaimedFacilityParentCompany({
                    id: value,
                    name: label,
                }),
            ),
        updateContactVisibility: makeDispatchCheckedFn(
            updateClaimedFacilityPointOfContactVisibility,
        ),
        updateOfficeVisibility: makeDispatchCheckedFn(
            updateClaimedFacilityOfficeVisibility,
        ),
        updateFacilityWebsite: makeDispatchValueFn(
            updateClaimedFacilityWebsite,
        ),
        updateFacilityWebsiteVisibility: makeDispatchCheckedFn(
            updateClaimedFacilityWebsiteVisibility,
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
        updateFacilityWorkersCount: makeDispatchValueFn(
            updateClaimedFacilityWorkersCount,
        ),
        updateFacilityFemaleWorkersPercentage: makeDispatchValueFn(
            updateClaimedFacilityFemaleWorkersPercentage,
        ),
        updateFacilityAffiliations: makeDispatchMultiSelectFn(
            updateClaimedFacilityAffiliations,
        ),
        updateFacilityCertifications: makeDispatchMultiSelectFn(
            updateClaimedFacilityCertifications,
        ),
        updateFacilityProductTypes: makeDispatchMultiSelectFn(
            updateClaimedFacilityProductTypes,
        ),
        updateFacilityProductionTypes: makeDispatchMultiSelectFn(
            updateClaimedFacilityProductionTypes,
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
        fetchSectors: () => dispatch(fetchSectorOptions()),
        fetchParentCompanies: () => dispatch(fetchParentCompanyOptions()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimedFacilitiesDetails);
