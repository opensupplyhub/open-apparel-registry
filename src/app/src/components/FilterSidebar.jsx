import React, { Component } from 'react';
import { bool, func, oneOf } from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Route } from 'react-router-dom';
import get from 'lodash/get';

import FilterSidebarGuideTab from './FilterSidebarGuideTab';
import FilterSidebarSearchTab from './FilterSidebarSearchTab';
import FilterSidebarFacilitiesTab from './FilterSidebarFacilitiesTab';
import NonVectorTileFilterSidebarFacilitiesTab from './NonVectorTileFilterSidebarFacilitiesTab';
import FeatureFlag from './FeatureFlag';

import {
    filterSidebarTabsEnum,
    filterSidebarTabs,
    VECTOR_TILE,
} from '../util/constants';

import {
    makeSidebarGuideTabActive,
    makeSidebarSearchTabActive,
    makeSidebarFacilitiesTabActive,
} from '../actions/ui';

import {
    fetchContributorOptions,
    fetchListOptions,
    fetchContributorTypeOptions,
    fetchCountryOptions,
    fetchFacilityProcessingTypeOptions,
    fetchProductTypeOptions,
    fetchNumberOfWorkersOptions,
    fetchAllFilterOptions,
} from '../actions/filterOptions';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    countryOptionsPropType,
    facilityProcessingTypeOptionsPropType,
    productTypeOptionsPropType,
    numberOfWorkerOptionsPropType,
} from '../util/propTypes';

import { allListsAreEmpty } from '../util/util';

const controlPanelStyles = Object.freeze({
    height: 'inherit',
    width: 'inherit',
});

const filterSidebarStyles = theme =>
    Object.freeze({
        searchTab: Object.freeze({
            '*': {
                fontFamily: theme.typography.fontFamily,
            },
        }),
    });

class FilterSidebar extends Component {
    componentDidMount() {
        const {
            contributorsData,
            contributorTypesData,
            countriesData,
            facilityProcessingTypeData,
            productTypeData,
            numberOfWorkersData,
            fetchFilterOptions,
            fetchContributors,
            fetchLists,
            fetchContributorTypes,
            fetchCountries,
            fetchFacilityProcessingType,
            fetchProductType,
            fetchNumberOfWorkers,
            contributors,
        } = this.props;

        if (
            allListsAreEmpty(
                contributorsData,
                contributorTypesData,
                countriesData,
                facilityProcessingTypeData,
                productTypeData,
                numberOfWorkersData,
            )
        ) {
            return fetchFilterOptions();
        }

        if (!contributorsData.length) {
            fetchContributors();
        }

        if (!contributorTypesData.length) {
            fetchContributorTypes();
        }

        if (!countriesData.length) {
            fetchCountries();
        }

        if (!facilityProcessingTypeData.length) {
            fetchFacilityProcessingType();
        }

        if (!productTypeData.length) {
            fetchProductType();
        }

        if (!numberOfWorkersData.length) {
            fetchNumberOfWorkers();
        }

        if (contributors && contributors.length) {
            fetchLists();
        }

        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.contributors !== prevProps.contributors) {
            this.props.fetchLists();
        }
    }

    render() {
        const {
            activeFilterSidebarTab,
            makeGuideTabActive,
            makeSearchTabActive,
            makeFacilitiesTabActive,
            vectorTileFeatureIsActive,
            fetchingFeatureFlags,
            embed,
            facilitiesCount,
            classes,
        } = this.props;

        if (fetchingFeatureFlags) {
            return <CircularProgress />;
        }

        let orderedTabsForSidebar = vectorTileFeatureIsActive
            ? filterSidebarTabs.slice().reverse()
            : filterSidebarTabs;

        if (embed) {
            orderedTabsForSidebar = orderedTabsForSidebar.filter(
                ({ tab }) => tab !== 'guide',
            );
        }

        const activeTabIndex = orderedTabsForSidebar.findIndex(
            ({ tab }) => tab === activeFilterSidebarTab,
        );

        const handleTabChange = (_, value) => {
            const changeTabFunctionsList = vectorTileFeatureIsActive
                ? [
                      makeSearchTabActive,
                      makeFacilitiesTabActive,
                      makeGuideTabActive,
                  ]
                : [
                      makeGuideTabActive,
                      makeFacilitiesTabActive,
                      makeSearchTabActive,
                  ];

            const changeTab = changeTabFunctionsList[value];

            return changeTab();
        };

        const tabBar = (
            <AppBar
                position="static"
                className="results-height-subtract filter-sidebar-tabgroup"
                color="default"
            >
                <Tabs
                    value={activeTabIndex}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                >
                    {orderedTabsForSidebar.map(({ tab }) => {
                        const label =
                            tab === filterSidebarTabsEnum.facilities &&
                            facilitiesCount &&
                            facilitiesCount > -1
                                ? `${tab} (${facilitiesCount})`
                                : tab;
                        return (
                            <Tab
                                key={tab}
                                label={label}
                                className={`search-tab ${classes.searchTab}`}
                            />
                        );
                    })}
                </Tabs>
            </AppBar>
        );

        const insetComponent = (() => {
            switch (activeFilterSidebarTab) {
                case filterSidebarTabsEnum.guide:
                    return (
                        <FeatureFlag
                            flag={VECTOR_TILE}
                            alternative={<FilterSidebarGuideTab />}
                        >
                            <FilterSidebarGuideTab vectorTile />
                        </FeatureFlag>
                    );
                case filterSidebarTabsEnum.search:
                    // We wrap this component in a `Route` to give it access to `history.push`
                    // in its `mapDispatchToProps` function.
                    return <Route component={FilterSidebarSearchTab} />;
                case filterSidebarTabsEnum.facilities:
                    return (
                        <FeatureFlag
                            flag={VECTOR_TILE}
                            alternative={
                                <NonVectorTileFilterSidebarFacilitiesTab />
                            }
                        >
                            <FilterSidebarFacilitiesTab />
                        </FeatureFlag>
                    );
                default:
                    window.console.warn(
                        'invalid tab selection',
                        activeFilterSidebarTab,
                    );
                    return null;
            }
        })();

        return (
            <div className="control-panel" style={controlPanelStyles}>
                {tabBar}
                {insetComponent}
            </div>
        );
    }
}

FilterSidebar.propTypes = {
    activeFilterSidebarTab: oneOf(Object.values(filterSidebarTabsEnum))
        .isRequired,
    makeGuideTabActive: func.isRequired,
    makeSearchTabActive: func.isRequired,
    makeFacilitiesTabActive: func.isRequired,
    fetchFilterOptions: func.isRequired,
    fetchContributors: func.isRequired,
    fetchContributorTypes: func.isRequired,
    fetchCountries: func.isRequired,
    fetchFacilityProcessingType: func.isRequired,
    fetchProductType: func.isRequired,
    fetchNumberOfWorkers: func.isRequired,
    contributorsData: contributorOptionsPropType.isRequired,
    contributorTypesData: contributorTypeOptionsPropType.isRequired,
    countriesData: countryOptionsPropType.isRequired,
    facilityProcessingTypeData:
        facilityProcessingTypeOptionsPropType.isRequired,
    productTypeData: productTypeOptionsPropType.isRequired,
    numberOfWorkersData: numberOfWorkerOptionsPropType.isRequired,
    vectorTileFeatureIsActive: bool.isRequired,
    fetchingFeatureFlags: bool.isRequired,
};

function mapStateToProps({
    ui: { activeFilterSidebarTab },
    filterOptions: {
        contributors: { data: contributorsData },
        lists: { data: listsData },
        contributorTypes: { data: contributorTypesData },
        countries: { data: countriesData },
        facilityProcessingType: { data: facilityProcessingTypeData },
        productType: { data: productTypeData },
        numberOfWorkers: { data: numberOfWorkersData },
    },
    featureFlags: { flags, fetching: fetchingFeatureFlags },
    embeddedMap: { embed },
    filters: { contributors },
    facilities: {
        facilities: { data: facilities },
    },
}) {
    return {
        activeFilterSidebarTab,
        contributorsData,
        contributorTypesData,
        countriesData,
        facilityProcessingTypeData,
        productTypeData,
        numberOfWorkersData,
        listsData,
        vectorTileFeatureIsActive: get(flags, 'vector_tile', false),
        fetchingFeatureFlags,
        embed,
        contributors,
        facilitiesCount: get(facilities, 'count', null),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        makeGuideTabActive: () => dispatch(makeSidebarGuideTabActive()),
        makeSearchTabActive: () => dispatch(makeSidebarSearchTabActive()),
        makeFacilitiesTabActive: () =>
            dispatch(makeSidebarFacilitiesTabActive()),
        fetchFilterOptions: () => dispatch(fetchAllFilterOptions()),
        fetchContributors: () => dispatch(fetchContributorOptions()),
        fetchLists: () => dispatch(fetchListOptions()),
        fetchContributorTypes: () => dispatch(fetchContributorTypeOptions()),
        fetchCountries: () => dispatch(fetchCountryOptions()),
        fetchFacilityProcessingType: () =>
            dispatch(fetchFacilityProcessingTypeOptions()),
        fetchProductType: () => dispatch(fetchProductTypeOptions()),
        fetchNumberOfWorkers: () => dispatch(fetchNumberOfWorkersOptions()),
    };
}

export default withStyles(filterSidebarStyles)(
    connect(mapStateToProps, mapDispatchToProps)(FilterSidebar),
);
