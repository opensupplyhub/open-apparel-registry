import React, { useState } from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';

import ShowOnly from './ShowOnly';
import FeatureFlag from './FeatureFlag';
import TextSearchFilter from './Filters/TextSearchFilter';
import ContributorFilter from './Filters/ContributorFilter';
import CountryNameFilter from './Filters/CountryNameFilter';
import SectorFilter from './Filters/SectorFilter';
import FilterSidebarExtendedSearch from './FilterSidebarExtendedSearch';

import {
    updateContributorTypeFilter,
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

import COLOURS from '../util/COLOURS';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    facilityTypeOptionsPropType,
    processingTypeOptionsPropType,
    productTypeOptionsPropType,
    numberOfWorkerOptionsPropType,
    facilityCollectionPropType,
} from '../util/propTypes';

import { filterSidebarStyles } from '../util/styles';

import { getValueFromEvent } from '../util/util';

import {
    FACILITIES_REQUEST_PAGE_SIZE,
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

const checkIfAnyFieldSelected = fields => fields.some(f => f.length !== 0);

function FilterSidebarSearchTab({
    resetFilters,
    facilityFreeTextQuery,
    contributors,
    contributorTypes,
    countries,
    sectors,
    parentCompany,
    facilityType,
    processingType,
    productType,
    numberOfWorkers,
    fetchingFacilities,
    searchForFacilities,
    facilities,
    fetchingOptions,
    vectorTileFlagIsActive,
    embed,
    classes,
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
        sectors,
    ]);

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
            className={classes.font}
            style={{
                boxShadow: 'none',
                backgroundColor: COLOURS.NAVIGATION,
                color: COLOURS.NEAR_BLACK,
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
                        Search the Open Supply Hub
                        <div>
                            <a
                                className={classes.helpSubheadStyle}
                                target="blank"
                                href="https://info.openapparel.org/stories-resources/how-to-search-the-open-apparel-registry"
                            >
                                Need tips for searching the OS Hub?
                            </a>
                        </div>
                    </div>
                    <TextSearchFilter
                        searchForFacilities={searchForFacilities}
                    />
                </div>
                <ContributorFilter />
                <CountryNameFilter />
                <SectorFilter />
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
    resetFilters: func.isRequired,
    facilityFreeTextQuery: string.isRequired,
    contributors: contributorOptionsPropType.isRequired,
    contributorTypes: contributorTypeOptionsPropType.isRequired,
    parentCompany: contributorOptionsPropType.isRequired,
    facilityType: facilityTypeOptionsPropType.isRequired,
    processingType: processingTypeOptionsPropType.isRequired,
    productType: productTypeOptionsPropType.isRequired,
    numberOfWorkers: numberOfWorkerOptionsPropType.isRequired,
    fetchingFacilities: bool.isRequired,
    searchForFacilities: func.isRequired,
    facilities: facilityCollectionPropType,
    fetchingOptions: bool.isRequired,
    vectorTileFlagIsActive: bool.isRequired,
};

function mapStateToProps({
    filterOptions: {
        contributors: { fetching: fetchingContributors },
        countries: { fetching: fetchingCountries },
    },
    filters: {
        facilityFreeTextQuery,
        contributors,
        contributorTypes,
        countries,
        sectors,
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
        facilityFreeTextQuery,
        contributors,
        contributorTypes,
        countries,
        sectors,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
        fetchingFacilities,
        facilities,
        boundary,
        fetchingOptions: fetchingContributors || fetchingCountries,
        embed: !!embed,
        embedExtendedFields: config.extended_fields,
    };
}

function mapDispatchToProps(dispatch, { history: { push } }) {
    return {
        updateContributorType: v => dispatch(updateContributorTypeFilter(v)),
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
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterSidebarSearchTabStyles)(FilterSidebarSearchTab));
