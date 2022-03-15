import React, { useState } from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';
import ReactSelect from 'react-select';
import Creatable from 'react-select/creatable';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import ShowOnly from './ShowOnly';
import FeatureFlag from './FeatureFlag';

import {
    updateFacilityFreeTextQueryFilter,
    updateContributorFilter,
    updateListFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
    updateParentCompanyFilter,
    updateFacilityTypeFilter,
    updateProcessingTypeFilter,
    updateProductTypeFilter,
    updateNumberofWorkersFilter,
    updateNativeLanguageNameFilter,
    updateCombineContributorsFilterOption,
    updateBoundaryFilter,
    updatePPEFilter,
    resetAllFilters,
} from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

import { recordSearchTabResetButtonClick, showDrawFilter } from '../actions/ui';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    countryOptionsPropType,
    facilityTypeOptionsPropType,
    processingTypeOptionsPropType,
    facilityProcessingTypeOptionsPropType,
    productTypeOptionsPropType,
    numberOfWorkerOptionsPropType,
    facilityCollectionPropType,
} from '../util/propTypes';

import { filterSidebarStyles } from '../util/styles';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
    mapDjangoChoiceTuplesValueToSelectOptions,
} from '../util/util';

import {
    FACILITIES_REQUEST_PAGE_SIZE,
    DEFAULT_SEARCH_TEXT,
} from '../util/constants';

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

const FACILITIES = 'FACILITIES';
const CONTRIBUTORS = 'CONTRIBUTORS';
const CONTRIBUTOR_TYPES = 'CONTRIBUTOR_TYPES';
const LISTS = 'LISTS';
const COUNTRIES = 'COUNTRIES';
const PARENT_COMPANY = 'PARENT_COMPANY';
const FACILITY_TYPE = 'FACILITY_TYPE';
const PROCESSING_TYPE = 'PROCESSING_TYPE';
const PRODUCT_TYPE = 'PRODUCT_TYPE';
const NUMBER_OF_WORKERS = 'NUMBER_OF_WORKERS';
const NATIVE_LANGUAGE_NAME = 'NATIVE_LANGUAGE_NAME';

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

const checkIfAnyFieldSelected = fields => fields.some(f => f.length !== 0);

function FilterSidebarSearchTab({
    contributorOptions,
    listOptions,
    contributorTypeOptions,
    countryOptions,
    facilityProcessingTypeOptions,
    productTypeOptions,
    numberOfWorkersOptions,
    resetFilters,
    facilityFreeTextQuery,
    updateFacilityFreeTextQuery,
    contributors,
    updateContributor,
    contributorTypes,
    updateContributorType,
    countries,
    updateCountry,
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
    nativeLanguageName,
    updateNativeLanguageName,
    combineContributors,
    updateCombineContributors,
    fetchingFacilities,
    searchForFacilities,
    facilities,
    fetchingOptions,
    submitFormOnEnterKeyPress,
    vectorTileFlagIsActive,
    activateDrawFilter,
    clearDrawFilter,
    boundary,
    ppe,
    updatePPE,
    embed,
    fetchingLists,
    updateList,
    lists,
    classes,
    textSearchLabel,
}) {
    const extendedFields = [
        contributorTypes,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
    ];

    const allFields = extendedFields.concat([
        facilityFreeTextQuery,
        contributors,
        countries,
    ]);

    const [
        contributorPopoverAnchorEl,
        setContributorPopoverAnchorEl,
    ] = useState(null);
    const [ppePopoverAnchorEl, setPpePopoverAnchorEl] = useState(null);
    const [expand, setExpand] = useState(
        checkIfAnyFieldSelected(extendedFields),
    );

    if (fetchingOptions) {
        return (
            <div className="control-panel__content">
                <CircularProgress />
            </div>
        );
    }

    const noFacilitiesFoundMessage = (() => {
        if (fetchingFacilities) {
            return null;
        }

        if (!facilities) {
            return null;
        }

        if (facilities.features.length) {
            return null;
        }

        return (
            <div className="form__field">
                <p style={{ color: 'red' }}>
                    No facilities were found for that search
                </p>
            </div>
        );
    })();

    const styles = {
        popover: {
            fontSize: '15px',
            padding: '10px',
            lineHeight: '22px',
            maxWidth: '320px',
            margin: '0 14px',
        },
        popoverLineItem: {
            marginBottom: '6px',
        },
        popoverHeading: {
            fontWeight: 'bold',
        },
        icon: {
            color: 'rgba(0, 0, 0, 0.38)',
        },
    };

    const contributorInfoPopoverContent = (
        <div style={styles.popover}>
            <p style={styles.popoverHeading}>
                Do you want to see only facilities which these contributors
                share? If so, tick this box.
            </p>
            <p>
                There are now two ways to filter a Contributor search on the
                OAR:
            </p>
            <ol>
                <li style={styles.popoverLineItem}>
                    You can search for all the facilities of multiple
                    contributors. This means that the results would show all of
                    the facilities contributed to the OAR by, for example, BRAC
                    University or Clarks. Some facilities might have been
                    contributed by BRAC University but not by Clarks, or
                    vice-versa.
                </li>
                <li style={styles.popoverLineItem}>
                    By checking the “Show only shared facilities” box, this
                    adjusts the search logic to “AND”. This means that your
                    results will show only facilities contributed by BOTH BRAC
                    University AND Clarks (as well as potentially other
                    contributors). In this way, you can more quickly filter to
                    show the specific Contributor overlap you are interested in.
                </li>
            </ol>
        </div>
    );

    const ppeInfoPopoverContent = (
        <div style={styles.popover}>
            <p>
                Personal protective equipment (PPE) includes masks, gloves,
                gowns, visors and other equipment.
            </p>
        </div>
    );

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

    const expandButton = expand ? (
        <Button
            variant="outlined"
            onClick={() => {
                setExpand(false);
            }}
            disableRipple
            color="primary"
            fullWidth
        >
            FEWER FILTERS
        </Button>
    ) : (
        <Button
            variant="outlined"
            onClick={() => {
                setExpand(true);
            }}
            disableRipple
            color="primary"
            fullWidth
        >
            MORE FILTERS
        </Button>
    );

    const searchButton = (
        <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.font}
            style={{
                boxShadow: 'none',
            }}
            onClick={() => searchForFacilities(vectorTileFlagIsActive)}
            disabled={fetchingOptions}
            fullWidth
        >
            Search
        </Button>
    );

    const resetButton = (
        <Button
            size="small"
            variant="outlined"
            onClick={() => resetFilters(embed)}
            disableRipple
            className={classes.reset}
            color="primary"
            disabled={fetchingOptions}
        >
            <i className={`${classes.icon} fas fa-fw fa-undo`} />
        </Button>
    );

    const searchResetButtonGroup = () => {
        if (fetchingFacilities) {
            return <CircularProgress size={30} />;
        }
        if (checkIfAnyFieldSelected(allFields)) {
            return (
                <>
                    {searchButton}
                    {resetButton}
                </>
            );
        }
        return searchButton;
    };

    return (
        <div
            className={`control-panel__content ${classes.controlPanelContentStyles}`}
        >
            <div style={{ marginBottom: '60px' }}>
                <div className="form__field" style={{ marginBottom: '10px' }}>
                    <div className={classes.inputLabelStyle}>
                        Search the Open Apparel Registry
                        <div className={classes.helpSubheadStyle}>
                            <a
                                target="blank"
                                href="https://info.openapparel.org/stories-resources/how-to-search-the-open-apparel-registry"
                            >
                                Need tips for searching the OAR?
                            </a>
                        </div>
                    </div>
                    <InputLabel htmlFor={FACILITIES} className="form__label">
                        <FeatureFlag
                            flag="ppe"
                            alternative={
                                embed ? textSearchLabel : DEFAULT_SEARCH_TEXT
                            }
                        >
                            Facility Name, OAR ID, or PPE Product Type
                        </FeatureFlag>
                    </InputLabel>
                    <TextField
                        id={FACILITIES}
                        placeholder="e.g., ABC Textiles Limited"
                        className="full-width margin-bottom-16 form__text-input"
                        value={facilityFreeTextQuery}
                        onChange={updateFacilityFreeTextQuery}
                        onKeyPress={submitFormOnEnterKeyPress}
                    />
                </div>
                <FeatureFlag flag="ppe">
                    <div
                        className="form__field"
                        style={{ marginBottom: '16px' }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!ppe}
                                    onChange={updatePPE}
                                    color="primary"
                                    value={ppe}
                                />
                            }
                            label="Show only PPE facilities"
                            style={{ marginRight: '8px' }}
                        />
                        <IconButton
                            onClick={
                                // eslint-disable-next-line no-confusing-arrow
                                e =>
                                    ppePopoverAnchorEl
                                        ? null
                                        : setPpePopoverAnchorEl(e.currentTarget)
                            }
                            style={{ padding: '4px', color: 'rgba(0,0,0,0.3)' }}
                        >
                            <InfoIcon />
                        </IconButton>
                        <Popover
                            id="ppe-info-popover"
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'left',
                            }}
                            open={!!ppePopoverAnchorEl}
                            anchorEl={ppePopoverAnchorEl}
                            onClick={() => setPpePopoverAnchorEl(null)}
                        >
                            {ppeInfoPopoverContent}
                        </Popover>
                    </div>
                </FeatureFlag>
                <div className="form__field">
                    <ShowOnly when={!embed}>
                        <InputLabel
                            shrink={false}
                            htmlFor={CONTRIBUTORS}
                            className={classes.inputLabelStyle}
                        >
                            Contributor
                        </InputLabel>
                        <ReactSelect
                            isMulti
                            id={CONTRIBUTORS}
                            name={CONTRIBUTORS}
                            className={`basic-multi-select notranslate ${classes.selectStyle}`}
                            classNamePrefix="select"
                            options={contributorOptions}
                            value={contributors}
                            onChange={updateContributor}
                            disabled={fetchingOptions || fetchingFacilities}
                        />
                        <ShowOnly
                            when={contributors && contributors.length > 1}
                        >
                            <div style={{ marginLeft: '16px' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!combineContributors}
                                            onChange={updateCombineContributors}
                                            color="primary"
                                            value={combineContributors}
                                        />
                                    }
                                    label="Show only shared facilities"
                                />
                                <IconButton
                                    onClick={
                                        // eslint-disable-next-line no-confusing-arrow
                                        e =>
                                            contributorPopoverAnchorEl
                                                ? null
                                                : setContributorPopoverAnchorEl(
                                                      e.currentTarget,
                                                  )
                                    }
                                >
                                    <InfoIcon />
                                </IconButton>
                                <Popover
                                    id="contributor-info-popover"
                                    anchorOrigin={{
                                        vertical: 'center',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'center',
                                        horizontal: 'left',
                                    }}
                                    open={!!contributorPopoverAnchorEl}
                                    anchorEl={contributorPopoverAnchorEl}
                                    onClick={() =>
                                        setContributorPopoverAnchorEl(null)
                                    }
                                >
                                    {contributorInfoPopoverContent}
                                </Popover>
                            </div>
                        </ShowOnly>
                    </ShowOnly>
                    <ShowOnly
                        when={
                            contributors &&
                            !!contributors.length &&
                            !fetchingLists
                        }
                    >
                        <div
                            style={{
                                marginLeft: embed ? 0 : '16px',
                                marginTop: '12px',
                            }}
                        >
                            <InputLabel
                                shrink={false}
                                htmlFor={LISTS}
                                className={classes.inputLabelStyle}
                            >
                                Contributor List
                            </InputLabel>
                            <ReactSelect
                                isMulti
                                id={LISTS}
                                name={LISTS}
                                className={`basic-multi-select notranslate ${classes.selectStyle}`}
                                classNamePrefix="select"
                                options={listOptions}
                                value={lists}
                                onChange={updateList}
                                disabled={fetchingLists || fetchingFacilities}
                            />
                        </div>
                    </ShowOnly>
                </div>
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={COUNTRIES}
                        className={classes.inputLabelStyle}
                    >
                        Country Name
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={COUNTRIES}
                        name={COUNTRIES}
                        className={`basic-multi-select ${classes.selectStyle}`}
                        classNamePrefix="select"
                        options={countryOptions}
                        value={countries}
                        onChange={updateCountry}
                        disabled={fetchingOptions || fetchingFacilities}
                    />
                </div>
                <ShowOnly when={expand}>
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
                                disabled={fetchingOptions || fetchingFacilities}
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
                            The following filters are new to the OAR and may not
                            return complete results until we have more data
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
                            disabled={fetchingOptions || fetchingFacilities}
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
                            disabled={fetchingOptions || fetchingFacilities}
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
                            disabled={fetchingOptions || fetchingFacilities}
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
                            disabled={fetchingOptions || fetchingFacilities}
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
                            disabled={fetchingOptions || fetchingFacilities}
                        />
                    </div>
                    <div
                        className="form__field"
                        style={{ marginBottom: '10px' }}
                    >
                        <InputLabel
                            htmlFor={NATIVE_LANGUAGE_NAME}
                            className="form__label"
                        >
                            Native Language Name
                        </InputLabel>
                        <TextField
                            id={NATIVE_LANGUAGE_NAME}
                            placeholder="Native Language Facility Name"
                            className="full-width margin-bottom-16 form__text-input"
                            value={nativeLanguageName}
                            onChange={updateNativeLanguageName}
                            onKeyPress={submitFormOnEnterKeyPress}
                        />
                    </div>
                </ShowOnly>
                <div className="form__action">{searchResetButtonGroup()}</div>
                <div className="form__field">
                    {expandButton}
                    <ShowOnly when={!expand}>
                        <div className="form__info">
                            Contributor type · Parent company · Facility type ·
                            Processing type · Product type · Number of workers{' '}
                            <Tooltip
                                title="These fields were added to the OAR in March 2022. As more data is contributed, more results will become available."
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <i
                                    className={`${classes.icon} fas fa-fw fa-info-circle`}
                                />
                            </Tooltip>
                        </div>
                    </ShowOnly>
                </div>
                <div className="form__report">
                    {!embed ? (
                        <a
                            className="control-link inherit-font"
                            href="mailto:info@openapparel.org?subject=Reporting an issue"
                        >
                            Have a suggestion? Let us know!
                        </a>
                    ) : null}
                </div>
                {noFacilitiesFoundMessage}
            </div>
        </div>
    );
}

FilterSidebarSearchTab.defaultProps = {
    facilities: null,
};

FilterSidebarSearchTab.propTypes = {
    contributorOptions: contributorOptionsPropType.isRequired,
    contributorTypeOptions: contributorTypeOptionsPropType.isRequired,
    countryOptions: countryOptionsPropType.isRequired,
    facilityProcessingTypeOptions:
        facilityProcessingTypeOptionsPropType.isRequired,
    productTypeOptions: productTypeOptionsPropType.isRequired,
    numberOfWorkersOptions: numberOfWorkerOptionsPropType.isRequired,
    resetFilters: func.isRequired,
    updateFacilityFreeTextQuery: func.isRequired,
    updateContributor: func.isRequired,
    updateContributorType: func.isRequired,
    updateCountry: func.isRequired,
    updatePPE: func.isRequired,
    updateCombineContributors: func.isRequired,
    facilityFreeTextQuery: string.isRequired,
    contributors: contributorOptionsPropType.isRequired,
    contributorTypes: contributorTypeOptionsPropType.isRequired,
    countries: countryOptionsPropType.isRequired,
    parentCompany: contributorOptionsPropType.isRequired,
    facilityType: facilityTypeOptionsPropType.isRequired,
    processingType: processingTypeOptionsPropType.isRequired,
    productType: productTypeOptionsPropType.isRequired,
    numberOfWorkers: numberOfWorkerOptionsPropType.isRequired,
    nativeLanguageName: string.isRequired,
    combineContributors: string.isRequired,
    ppe: string.isRequired,
    fetchingFacilities: bool.isRequired,
    searchForFacilities: func.isRequired,
    facilities: facilityCollectionPropType,
    fetchingOptions: bool.isRequired,
    vectorTileFlagIsActive: bool.isRequired,
};

function mapStateToProps({
    filterOptions: {
        contributors: {
            data: contributorOptions,
            fetching: fetchingContributors,
        },
        lists: { data: listOptions, fetching: fetchingLists },
        contributorTypes: {
            data: contributorTypeOptions,
            fetching: fetchingContributorTypes,
        },
        countries: { data: countryOptions, fetching: fetchingCountries },
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
        facilityFreeTextQuery,
        contributors,
        lists,
        contributorTypes,
        countries,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
        combineContributors,
        boundary,
        ppe,
    },
    facilities: {
        facilities: { data: facilities, fetching: fetchingFacilities },
    },
    featureFlags,
    embeddedMap: { embed, config },
}) {
    const vectorTileFlagIsActive = get(
        featureFlags,
        'flags.vector_tile',
        false,
    );

    return {
        vectorTileFlagIsActive,
        contributorOptions,
        listOptions,
        contributorTypeOptions,
        countryOptions,
        facilityProcessingTypeOptions,
        productTypeOptions,
        numberOfWorkersOptions,
        facilityFreeTextQuery,
        contributors,
        lists,
        contributorTypes,
        countries,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
        combineContributors,
        fetchingFacilities,
        facilities,
        boundary,
        ppe,
        fetchingOptions:
            fetchingContributors ||
            fetchingContributorTypes ||
            fetchingCountries ||
            fetchingFacilityProcessingType ||
            fetchingProductType ||
            fetchingNumberofWorkers,
        embed: !!embed,
        fetchingLists,
        textSearchLabel: config.text_search_label,
    };
}

function mapDispatchToProps(dispatch, { history: { push } }) {
    return {
        updateFacilityFreeTextQuery: e =>
            dispatch(updateFacilityFreeTextQueryFilter(getValueFromEvent(e))),
        updateContributor: v => {
            if (!v || v.length < 2) {
                dispatch(updateCombineContributorsFilterOption(''));
            }
            dispatch(updateContributorFilter(v));
        },
        updateContributorType: v => dispatch(updateContributorTypeFilter(v)),
        updateList: v => dispatch(updateListFilter(v)),
        updateCountry: v => dispatch(updateCountryFilter(v)),
        updateParentCompany: v => dispatch(updateParentCompanyFilter(v)),
        updateFacilityType: v => dispatch(updateFacilityTypeFilter(v)),
        updateProcessingType: v => dispatch(updateProcessingTypeFilter(v)),
        updateProductType: v => dispatch(updateProductTypeFilter(v)),
        updateNumberOfWorkers: v => dispatch(updateNumberofWorkersFilter(v)),
        updateNativeLanguageName: e =>
            dispatch(updateNativeLanguageNameFilter(getValueFromEvent(e))),
        updatePPE: e =>
            dispatch(updatePPEFilter(e.target.checked ? 'true' : '')),
        updateCombineContributors: e =>
            dispatch(
                updateCombineContributorsFilterOption(
                    e.target.checked ? 'AND' : '',
                ),
            ),
        resetFilters: embedded => {
            dispatch(recordSearchTabResetButtonClick());
            return dispatch(resetAllFilters(embedded));
        },
        searchForFacilities: vectorTilesAreActive =>
            dispatch(
                fetchFacilities({
                    pageSize: vectorTilesAreActive
                        ? FACILITIES_REQUEST_PAGE_SIZE
                        : 50,
                    pushNewRoute: push,
                }),
            ),
        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(() =>
            dispatch(fetchFacilities(push)),
        ),
        activateDrawFilter: () => dispatch(showDrawFilter(true)),
        clearDrawFilter: () => {
            dispatch(showDrawFilter(false));
            dispatch(updateBoundaryFilter(null));
            return dispatch(fetchFacilities({}));
        },
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterSidebarSearchTabStyles)(FilterSidebarSearchTab));
