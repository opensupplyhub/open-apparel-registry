import React from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';

import ShowOnly from './ShowOnly';
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
} from '../util/propTypes';

import { filterSidebarStyles } from '../util/styles';
import { getValueFromEvent } from '../util/util';
import { useFilterListHeight } from '../util/useHeightSubtract';

import {
    FACILITIES_REQUEST_PAGE_SIZE,
    EXTENDED_FIELDS_EXPLANATORY_TEXT,
} from '../util/constants';

const filterSidebarSearchTabStyles = theme =>
    Object.freeze({
        sidebarDiv: Object.freeze({
            display: 'flex',
            flexDirection: 'column',
        }),
        bottomSidebarDiv: Object.freeze({
            paddingBottom: '16px',
            paddingLeft: '24px',
            paddingRight: '24px',
        }),
        filtersDiv: Object.freeze({
            overflowY: 'scroll',
            paddingRight: '24px',
            paddingLeft: '24px',
        }),
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
    fetchingOptions,
    vectorTileFlagIsActive,
    embed,
    classes,
    embedExtendedFields,
}) {
    const filterListHeight = useFilterListHeight();

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

    if (fetchingOptions) {
        return (
            <div className="control-panel__content">
                <CircularProgress />
            </div>
        );
    }

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
        <div className="control-panel__content">
            <div
                className={classes.sidebarDiv}
                style={{ height: filterListHeight }}
            >
                <div className={classes.filtersDiv}>
                    <TextSearchFilter
                        searchForFacilities={searchForFacilities}
                    />
                    <ContributorFilter />
                    <CountryNameFilter />
                    <SectorFilter />
                    <FilterSidebarExtendedSearch />
                </div>
            </div>

            <div
                className={`${classes.sidebarDiv} ${classes.bottomSidebarDiv} filter-list-subtract`}
            >
                <div className="form__action" style={{ marginBottom: '40px' }}>
                    {searchResetButtonGroup()}
                </div>
                <ShowOnly when={!embed || embedExtendedFields.length}>
                    <div className="form__field">
                        <ShowOnly when={!embed}>
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
            </div>

            <div
                className="form__report filter-list-subtract"
                style={{
                    flex: 1,
                    alignItems: 'flex-end',
                    display: 'flex',
                }}
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
        </div>
    );
}

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
        facilities: { fetching: fetchingFacilities },
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

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(withStyles(filterSidebarSearchTabStyles)(FilterSidebarSearchTab)),
);
