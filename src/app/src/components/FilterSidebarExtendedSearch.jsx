import React, { useEffect } from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactSelect from 'react-select';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import uniq from 'lodash/uniq';

import ShowOnly from './ShowOnly';
import CreatableInputOnly from './CreatableInputOnly';

import {
    updateContributorTypeFilter,
    updateParentCompanyFilter,
    updateFacilityTypeFilter,
    updateProcessingTypeFilter,
    updateProductTypeFilter,
    updateNumberofWorkersFilter,
    updateNativeLanguageNameFilter,
} from '../actions/filters';

import {
    fetchContributorTypeOptions,
    fetchFacilityProcessingTypeOptions,
    fetchNumberOfWorkersOptions,
} from '../actions/filterOptions';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    facilityTypeOptionsPropType,
    processingTypeOptionsPropType,
    facilityProcessingTypeOptionsPropType,
    productTypeOptionsPropType,
    numberOfWorkerOptionsPropType,
} from '../util/propTypes';

import { filterSidebarStyles } from '../util/styles';

import {
    getValueFromEvent,
    mapDjangoChoiceTuplesValueToSelectOptions,
} from '../util/util';

import { EXTENDED_FIELDS_EXPLANATORY_TEXT } from '../util/constants';

const filterSidebarExtendedSearchStyles = theme =>
    Object.freeze({
        inputLabelStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            fontSize: '16px',
            fontWeight: 500,
            color: '#000',
            transform: 'translate(0, -8px) scale(1)',
            paddingBottom: '0.5rem',
        }),
        selectStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
        }),
        font: Object.freeze({
            fontFamily: `${theme.typography.fontFamily} !important`,
        }),
        ...filterSidebarStyles,
    });

const CONTRIBUTOR_TYPES = 'CONTRIBUTOR_TYPES';
const PARENT_COMPANY = 'PARENT_COMPANY';
const FACILITY_TYPE = 'FACILITY_TYPE';
const PROCESSING_TYPE = 'PROCESSING_TYPE';
const PRODUCT_TYPE = 'PRODUCT_TYPE';
const NUMBER_OF_WORKERS = 'NUMBER_OF_WORKERS';

const mapFacilityTypeOptions = (fPTypes, pTypes) => {
    let fTypes = [];
    if (pTypes.length === 0) {
        fTypes = fPTypes.map(type => type.facilityType);
    } else {
        // When there are processing types, only return the
        // facility types that have those processing types
        pTypes.forEach(pType => {
            fPTypes.forEach(fPType => {
                if (fPType.processingTypes.includes(pType.value)) {
                    fTypes = fTypes.concat(fPType.facilityType);
                }
            });
        });
    }
    return mapDjangoChoiceTuplesValueToSelectOptions(uniq(fTypes.sort()));
};

const mapProcessingTypeOptions = (fPTypes, fTypes) => {
    let pTypes = [];
    if (fTypes.length === 0) {
        pTypes = fPTypes.map(type => type.processingTypes).flat();
    } else {
        // When there are facility types, only return the
        // processing types that are under those facility types
        fTypes.forEach(fType => {
            fPTypes.forEach(fPType => {
                if (fType.value === fPType.facilityType) {
                    pTypes = pTypes.concat(fPType.processingTypes);
                }
            });
        });
    }
    return mapDjangoChoiceTuplesValueToSelectOptions(uniq(pTypes.sort()));
};

const isExtendedFieldForThisContributor = (field, extendedFields) =>
    extendedFields.includes(field.toLowerCase());

function FilterSidebarExtendedSearch({
    contributorTypeOptions,
    facilityProcessingTypeOptions,
    numberOfWorkersOptions,
    contributorTypes,
    updateContributorType,
    parentCompany,
    updateParentCompany,
    facilityType,
    updateFacilityType,
    processingType,
    updateProcessingType,
    productType,
    updateProductType,
    numberOfWorkers,
    updateNumberOfWorkers,
    fetchingFacilities,
    fetchingExtendedOptions,
    embed,
    embedExtendedFields,
    classes,
    fetchContributorTypes,
    fetchFacilityProcessingType,
    fetchNumberOfWorkers,
}) {
    useEffect(() => {
        if (!contributorTypeOptions.length) {
            fetchContributorTypes();
        }
    }, [contributorTypeOptions, fetchContributorTypes]);

    useEffect(() => {
        if (!facilityProcessingTypeOptions.length) {
            fetchFacilityProcessingType();
        }
    }, [facilityProcessingTypeOptions, fetchFacilityProcessingType]);

    useEffect(() => {
        if (!numberOfWorkersOptions.length) {
            fetchNumberOfWorkers();
        }
    }, [numberOfWorkersOptions, fetchNumberOfWorkers]);

    if (fetchingFacilities && fetchingExtendedOptions) return null;

    if (fetchingExtendedOptions) {
        return (
            <div className="control-panel__content">
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <ShowOnly when={!embed}>
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={CONTRIBUTOR_TYPES}
                        className={classes.inputLabelStyle}
                    >
                        Contributor Type
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={CONTRIBUTOR_TYPES}
                        name="contributorTypes"
                        className={`basic-multi-select notranslate ${classes.selectStyle}`}
                        classNamePrefix="select"
                        options={contributorTypeOptions}
                        value={contributorTypes}
                        onChange={updateContributorType}
                        disabled={fetchingExtendedOptions || fetchingFacilities}
                    />
                </div>
            </ShowOnly>
            <div className="form__field">
                <Divider />
                <ShowOnly when={!embed}>
                    <div
                        className="form__info"
                        style={{ color: 'rgba(0, 0, 0, 0.8)' }}
                    >
                        {EXTENDED_FIELDS_EXPLANATORY_TEXT}
                    </div>
                </ShowOnly>
            </div>
            <ShowOnly
                when={
                    !embed ||
                    isExtendedFieldForThisContributor(
                        PARENT_COMPANY,
                        embedExtendedFields,
                    )
                }
            >
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={PARENT_COMPANY}
                        className={classes.inputLabelStyle}
                    >
                        Parent Company
                    </InputLabel>
                    <CreatableInputOnly
                        isMulti
                        id={PARENT_COMPANY}
                        name={PARENT_COMPANY}
                        className={`basic-multi-select ${classes.selectStyle}`}
                        classNamePrefix="select"
                        value={parentCompany}
                        onChange={updateParentCompany}
                        disabled={fetchingFacilities}
                        placeholder="e.g. ABC Textiles Limited"
                    />
                </div>
            </ShowOnly>
            <ShowOnly
                when={
                    !embed ||
                    isExtendedFieldForThisContributor(
                        FACILITY_TYPE,
                        embedExtendedFields,
                    )
                }
            >
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={FACILITY_TYPE}
                        className={classes.inputLabelStyle}
                    >
                        Facility Type
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={FACILITY_TYPE}
                        name={FACILITY_TYPE}
                        className={`basic-multi-select ${classes.selectStyle}`}
                        classNamePrefix="select"
                        options={mapFacilityTypeOptions(
                            facilityProcessingTypeOptions,
                            processingType,
                        )}
                        value={facilityType}
                        onChange={updateFacilityType}
                        disabled={fetchingExtendedOptions || fetchingFacilities}
                    />
                </div>
            </ShowOnly>
            <ShowOnly
                when={
                    !embed ||
                    isExtendedFieldForThisContributor(
                        PROCESSING_TYPE,
                        embedExtendedFields,
                    )
                }
            >
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={PROCESSING_TYPE}
                        className={classes.inputLabelStyle}
                    >
                        Processing Type
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={PROCESSING_TYPE}
                        name={PROCESSING_TYPE}
                        className={`basic-multi-select ${classes.selectStyle}`}
                        classNamePrefix="select"
                        options={mapProcessingTypeOptions(
                            facilityProcessingTypeOptions,
                            facilityType,
                        )}
                        value={processingType}
                        onChange={updateProcessingType}
                        disabled={fetchingExtendedOptions || fetchingFacilities}
                    />
                </div>
            </ShowOnly>
            <ShowOnly
                when={
                    !embed ||
                    isExtendedFieldForThisContributor(
                        PRODUCT_TYPE,
                        embedExtendedFields,
                    )
                }
            >
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={PRODUCT_TYPE}
                        className={classes.inputLabelStyle}
                    >
                        Product Type
                    </InputLabel>
                    <CreatableInputOnly
                        isMulti
                        id={PRODUCT_TYPE}
                        name={PRODUCT_TYPE}
                        className={`basic-multi-select ${classes.selectStyle}`}
                        classNamePrefix="select"
                        value={productType}
                        onChange={updateProductType}
                        disabled={fetchingFacilities}
                        placeholder="e.g. Jackets"
                    />
                </div>
            </ShowOnly>
            <ShowOnly
                when={
                    !embed ||
                    isExtendedFieldForThisContributor(
                        NUMBER_OF_WORKERS,
                        embedExtendedFields,
                    )
                }
            >
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={NUMBER_OF_WORKERS}
                        className={classes.inputLabelStyle}
                    >
                        Number of Workers
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={NUMBER_OF_WORKERS}
                        name={NUMBER_OF_WORKERS}
                        className={`basic-multi-select ${classes.selectStyle}`}
                        classNamePrefix="select"
                        options={numberOfWorkersOptions}
                        value={numberOfWorkers}
                        onChange={updateNumberOfWorkers}
                        disabled={fetchingExtendedOptions || fetchingFacilities}
                    />
                </div>
            </ShowOnly>
        </>
    );
}

FilterSidebarExtendedSearch.propTypes = {
    contributorTypeOptions: contributorTypeOptionsPropType.isRequired,
    facilityProcessingTypeOptions:
        facilityProcessingTypeOptionsPropType.isRequired,
    numberOfWorkersOptions: numberOfWorkerOptionsPropType.isRequired,
    updateContributorType: func.isRequired,
    contributorTypes: contributorTypeOptionsPropType.isRequired,
    parentCompany: contributorOptionsPropType.isRequired,
    facilityType: facilityTypeOptionsPropType.isRequired,
    processingType: processingTypeOptionsPropType.isRequired,
    productType: productTypeOptionsPropType.isRequired,
    numberOfWorkers: numberOfWorkerOptionsPropType.isRequired,
    fetchingFacilities: bool.isRequired,
    fetchingExtendedOptions: bool.isRequired,
};

function mapStateToProps({
    filterOptions: {
        contributorTypes: {
            data: contributorTypeOptions,
            fetching: fetchingContributorTypes,
        },
        facilityProcessingType: {
            data: facilityProcessingTypeOptions,
            fetching: fetchingFacilityProcessingType,
        },
        numberOfWorkers: {
            data: numberOfWorkersOptions,
            fetching: fetchingNumberofWorkers,
        },
    },
    filters: {
        contributorTypes,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
    },
    facilities: {
        facilities: { data: facilities, fetching: fetchingFacilities },
    },
    embeddedMap: { embed, config },
}) {
    return {
        contributorTypeOptions,
        facilityProcessingTypeOptions,
        numberOfWorkersOptions,
        contributorTypes,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
        fetchingFacilities,
        facilities,
        fetchingExtendedOptions:
            fetchingContributorTypes ||
            fetchingFacilityProcessingType ||
            fetchingNumberofWorkers,
        embed: !!embed,
        embedExtendedFields: config.extended_fields,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateContributorType: v => dispatch(updateContributorTypeFilter(v)),
        updateParentCompany: v => dispatch(updateParentCompanyFilter(v)),
        updateFacilityType: v => dispatch(updateFacilityTypeFilter(v)),
        updateProcessingType: v => dispatch(updateProcessingTypeFilter(v)),
        updateProductType: v => dispatch(updateProductTypeFilter(v)),
        updateNumberOfWorkers: v => dispatch(updateNumberofWorkersFilter(v)),
        updateNativeLanguageName: e =>
            dispatch(updateNativeLanguageNameFilter(getValueFromEvent(e))),
        fetchContributorTypes: () => dispatch(fetchContributorTypeOptions()),
        fetchFacilityProcessingType: () =>
            dispatch(fetchFacilityProcessingTypeOptions()),
        fetchNumberOfWorkers: () => dispatch(fetchNumberOfWorkersOptions()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterSidebarExtendedSearchStyles)(FilterSidebarExtendedSearch));
