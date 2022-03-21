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
    makeSidebarSearchTabActive,
    makeSidebarFacilitiesTabActive,
} from '../actions/ui';

import {
    fetchContributorOptions,
    fetchListOptions,
    fetchCountryOptions,
    fetchAllPrimaryFilterOptions,
} from '../actions/filterOptions';

import {
    contributorOptionsPropType,
    countryOptionsPropType,
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
            countriesData,
            fetchFilterOptions,
            fetchContributors,
            fetchLists,
            fetchCountries,
            contributors,
        } = this.props;

        if (allListsAreEmpty(contributorsData, countriesData)) {
            return fetchFilterOptions();
        }

        if (!contributorsData.length) {
            fetchContributors();
        }

        if (!countriesData.length) {
            fetchCountries();
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
                ? [makeSearchTabActive, makeFacilitiesTabActive]
                : [makeFacilitiesTabActive, makeSearchTabActive];

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
    makeSearchTabActive: func.isRequired,
    makeFacilitiesTabActive: func.isRequired,
    fetchFilterOptions: func.isRequired,
    fetchContributors: func.isRequired,
    fetchCountries: func.isRequired,
    contributorsData: contributorOptionsPropType.isRequired,
    countriesData: countryOptionsPropType.isRequired,
    vectorTileFeatureIsActive: bool.isRequired,
    fetchingFeatureFlags: bool.isRequired,
};

function mapStateToProps({
    ui: { activeFilterSidebarTab },
    filterOptions: {
        contributors: { data: contributorsData },
        lists: { data: listsData },
        countries: { data: countriesData },
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
        countriesData,
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
        makeSearchTabActive: () => dispatch(makeSidebarSearchTabActive()),
        makeFacilitiesTabActive: () =>
            dispatch(makeSidebarFacilitiesTabActive()),
        fetchFilterOptions: () => dispatch(fetchAllPrimaryFilterOptions()),
        fetchContributors: () => dispatch(fetchContributorOptions()),
        fetchLists: () => dispatch(fetchListOptions()),
        fetchCountries: () => dispatch(fetchCountryOptions()),
    };
}

export default withStyles(filterSidebarStyles)(
    connect(mapStateToProps, mapDispatchToProps)(FilterSidebar),
);
