import React, { useEffect } from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactSelect from 'react-select';
import Creatable from 'react-select/creatable';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import uniq from 'lodash/uniq';

import ShowOnly from './ShowOnly';

import {
    updateContributorTypeFilter,
    updateParentCompanyFilter,
    updateFacilityTypeFilter,
    updateProcessingTypeFilter,
    updateProductTypeFilter,
    updateNumberofWorkersFilter,
    updateNativeLanguageNameFilter,
    updateBoundaryFilter,
} from '../actions/filters';

import {
    fetchContributorTypeOptions,
    fetchFacilityProcessingTypeOptions,
    fetchProductTypeOptions,
    fetchNumberOfWorkersOptions,
} from '../actions/filterOptions';

import { fetchFacilities } from '../actions/facilities';

import { showDrawFilter } from '../actions/ui';

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

const filterSidebarSearchTabStyles = theme =>
    Object.freeze({
        formStyle: Object.freeze({
            width: '100%',
            marginBottom: '32px',
        }),
        inputLabelStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            fontSize: '16px',
            fontWeight: 500,
            color: '#000',
            transform: 'translate(0, -8px) scale(1)',
            paddingBottom: '0.5rem',
        }),
        helpSubheadStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            ontSize: '12px',
            fontWeight: 500,
            color: '#000',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
        }),
        selectStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
        }),
        font: Object.freeze({
            fontFamily: `${theme.typography.fontFamily} !important`,
        }),
        reset: Object.freeze({
            marginLeft: '16px',
            minWidth: '36px',
            minHeight: '36px',
        }),
        ...filterSidebarStyles,
    });

const CONTRIBUTORS = 'CONTRIBUTORS';
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

function FilterSidebarSearchTab({
    contributorOptions,
    contributorTypeOptions,
    facilityProcessingTypeOptions,
    productTypeOptions,
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
    activateDrawFilter,
    clearDrawFilter,
    boundary,
    embed,
    classes,
    fetchContributorTypes,
    fetchFacilityProcessingType,
    fetchProductType,
    fetchNumberOfWorkers,
}) {
    useEffect(() => {
        if (!contributorTypeOptions.length) {
            fetchContributorTypes();
        }

        if (!facilityProcessingTypeOptions.length) {
            fetchFacilityProcessingType();
        }

        if (!productTypeOptions.length) {
            fetchProductType();
        }

        if (!numberOfWorkersOptions.length) {
            fetchNumberOfWorkers();
        }
    }, []);

    if (fetchingExtendedOptions) {
        return (
            <div className="control-panel__content">
                <CircularProgress />
            </div>
        );
    }

    const boundaryButton =
        boundary == null ? (
            <Button
                variant="outlined"
                onClick={activateDrawFilter}
                disableRipple
                color="primary"
                fullWidth
            >
                DRAW AREA
            </Button>
        ) : (
            <Button
                variant="outlined"
                onClick={clearDrawFilter}
                disableRipple
                color="primary"
                fullWidth
            >
                REMOVE AREA
            </Button>
        );

    return (
        <>
            <div className="form__field">
                <ShowOnly when={!embed}>
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
                </ShowOnly>
            </div>
            <div className="form__field">
                <InputLabel
                    shrink={false}
                    htmlFor={CONTRIBUTORS}
                    className={classes.inputLabelStyle}
                >
                    Area
                </InputLabel>
                {boundaryButton}
            </div>
            <div className="form__field">
                <Divider />
                <div
                    className="form__info"
                    style={{ color: 'rgba(0, 0, 0, 0.8)' }}
                >
                    The following filters are new to the OAR and may not return
                    complete results until we have more data
                </div>
            </div>
            <div className="form__field">
                <InputLabel
                    shrink={false}
                    htmlFor={PARENT_COMPANY}
                    className={classes.inputLabelStyle}
                >
                    Parent Company
                </InputLabel>
                <Creatable
                    isMulti
                    id={PARENT_COMPANY}
                    name={PARENT_COMPANY}
                    className={`basic-multi-select ${classes.selectStyle}`}
                    classNamePrefix="select"
                    options={contributorOptions}
                    value={parentCompany}
                    onChange={updateParentCompany}
                    disabled={fetchingExtendedOptions || fetchingFacilities}
                />
            </div>
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
            <div className="form__field">
                <InputLabel
                    shrink={false}
                    htmlFor={PRODUCT_TYPE}
                    className={classes.inputLabelStyle}
                >
                    Product Type
                </InputLabel>
                <Creatable
                    isMulti
                    id={PRODUCT_TYPE}
                    name={PRODUCT_TYPE}
                    className={`basic-multi-select ${classes.selectStyle}`}
                    classNamePrefix="select"
                    options={productTypeOptions}
                    value={productType}
                    onChange={updateProductType}
                    disabled={fetchingExtendedOptions || fetchingFacilities}
                />
            </div>
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
        </>
    );
}

FilterSidebarSearchTab.propTypes = {
    contributorOptions: contributorOptionsPropType.isRequired,
    contributorTypeOptions: contributorTypeOptionsPropType.isRequired,
    facilityProcessingTypeOptions:
        facilityProcessingTypeOptionsPropType.isRequired,
    productTypeOptions: productTypeOptionsPropType.isRequired,
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
        contributors: {
            data: contributorOptions,
            fetching: fetchingContributors,
        },
        contributorTypes: {
            data: contributorTypeOptions,
            fetching: fetchingContributorTypes,
        },
        facilityProcessingType: {
            data: facilityProcessingTypeOptions,
            fetching: fetchingFacilityProcessingType,
        },
        productType: {
            data: productTypeOptions,
            fetching: fetchingProductType,
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
        boundary,
    },
    facilities: {
        facilities: { data: facilities, fetching: fetchingFacilities },
    },
    embeddedMap: { embed },
}) {
    return {
        contributorOptions,
        contributorTypeOptions,
        facilityProcessingTypeOptions,
        productTypeOptions,
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
        boundary,
        fetchingExtendedOptions:
            fetchingContributors ||
            fetchingContributorTypes ||
            fetchingFacilityProcessingType ||
            fetchingProductType ||
            fetchingNumberofWorkers,
        embed: !!embed,
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
        activateDrawFilter: () => dispatch(showDrawFilter(true)),
        clearDrawFilter: () => {
            dispatch(showDrawFilter(false));
            dispatch(updateBoundaryFilter(null));
            return dispatch(fetchFacilities({}));
        },
        fetchContributorTypes: () => dispatch(fetchContributorTypeOptions()),
        fetchFacilityProcessingType: () =>
            dispatch(fetchFacilityProcessingTypeOptions()),
        fetchProductType: () => dispatch(fetchProductTypeOptions()),
        fetchNumberOfWorkers: () => dispatch(fetchNumberOfWorkersOptions()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterSidebarSearchTabStyles)(FilterSidebarSearchTab));
