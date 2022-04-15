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
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';

import ShowOnly from './ShowOnly';
import FeatureFlag from './FeatureFlag';
import FilterSidebarExtendedSearch from './FilterSidebarExtendedSearch';

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
    resetAllFilters,
} from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

import { recordSearchTabResetButtonClick } from '../actions/ui';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    countryOptionsPropType,
    facilityTypeOptionsPropType,
    processingTypeOptionsPropType,
    productTypeOptionsPropType,
    numberOfWorkerOptionsPropType,
    facilityCollectionPropType,
} from '../util/propTypes';

import { filterSidebarStyles } from '../util/styles';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import {
    FACILITIES_REQUEST_PAGE_SIZE,
    DEFAULT_SEARCH_TEXT,
    EXTENDED_PROFILE_FLAG,
    EXTENDED_FIELDS_EXPLANATORY_TEXT,
} from '../util/constants';

const filterSidebarSearchTabStyles = theme =>
    Object.freeze({
        headerStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            fontSize: '18px',
            fontWeight: 700,
            color: '#000',
            transform: 'translate(0, -8px) scale(1)',
            paddingBottom: '0.5rem',
        }),
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
            fontSize: '14px',
            fontWeight: 500,
            color: theme.palette.primary.main,
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            textDecoration: 'none',
            lineHeight: '17px',
            '&:hover': {
                textDecoration: 'underline',
            },
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
const LISTS = 'LISTS';
const COUNTRIES = 'COUNTRIES';

const checkIfAnyFieldSelected = fields => fields.some(f => f.length !== 0);

function FilterSidebarSearchTab({
    contributorOptions,
    listOptions,
    countryOptions,
    resetFilters,
    facilityFreeTextQuery,
    updateFacilityFreeTextQuery,
    contributors,
    updateContributor,
    contributorTypes,
    countries,
    updateCountry,
    parentCompany,
    facilityType,
    processingType,
    productType,
    numberOfWorkers,
    combineContributors,
    updateCombineContributors,
    fetchingFacilities,
    searchForFacilities,
    facilities,
    fetchingOptions,
    submitFormOnEnterKeyPress,
    vectorTileFlagIsActive,
    embed,
    fetchingLists,
    updateList,
    lists,
    classes,
    textSearchLabel,
    embedExtendedFields,
}) {
    const extendedFields = [
        contributorTypes,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
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
            <div
                style={{
                    marginBottom: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                <div className="form__field" style={{ marginBottom: '10px' }}>
                    <div className={classes.headerStyle}>
                        Search the Open Apparel Registry
                        <div>
                            <a
                                className={classes.helpSubheadStyle}
                                target="blank"
                                href="https://info.openapparel.org/stories-resources/how-to-search-the-open-apparel-registry"
                            >
                                Need tips for searching the OAR?
                            </a>
                        </div>
                    </div>
                    <InputLabel htmlFor={FACILITIES} className="form__label">
                        {embed ? textSearchLabel : DEFAULT_SEARCH_TEXT}
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
                <FeatureFlag flag={EXTENDED_PROFILE_FLAG}>
                    <ShowOnly when={expand}>
                        <FilterSidebarExtendedSearch />
                    </ShowOnly>
                </FeatureFlag>
                <div className="form__action" style={{ marginBottom: '40px' }}>
                    {searchResetButtonGroup()}
                </div>
                <ShowOnly when={!embed || embedExtendedFields.length}>
                    <div className="form__field">
                        {expandButton}
                        <ShowOnly when={!expand && !embed}>
                            <div className="form__info">
                                Contributor type · Parent company · Facility
                                type · Processing type · Product type · Number
                                of workers{' '}
                                <Tooltip
                                    title={EXTENDED_FIELDS_EXPLANATORY_TEXT}
                                    classes={{ tooltip: classes.tooltip }}
                                >
                                    <i
                                        className={`${classes.icon} fas fa-fw fa-info-circle`}
                                    />
                                </Tooltip>
                            </div>
                        </ShowOnly>
                    </div>
                </ShowOnly>
                <div
                    className="form__report"
                    style={{ flex: 1, alignItems: 'flex-end', display: 'flex' }}
                >
                    {!embed ? (
                        <a
                            className={`${classes.helpSubheadStyle} control-link inherit-font`}
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
    countryOptions: countryOptionsPropType.isRequired,
    resetFilters: func.isRequired,
    updateFacilityFreeTextQuery: func.isRequired,
    updateContributor: func.isRequired,
    updateCountry: func.isRequired,
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
    combineContributors: string.isRequired,
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
        countries: { data: countryOptions, fetching: fetchingCountries },
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
        countryOptions,
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
        fetchingOptions: fetchingContributors || fetchingCountries,
        embed: !!embed,
        fetchingLists,
        textSearchLabel: config.text_search_label,
        embedExtendedFields: config.extended_fields,
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
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterSidebarSearchTabStyles)(FilterSidebarSearchTab));
