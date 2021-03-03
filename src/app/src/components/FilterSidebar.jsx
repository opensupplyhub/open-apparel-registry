import React, { Component } from 'react';
import { bool, func, oneOf } from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Route } from 'react-router-dom';
import get from 'lodash/get';

import FilterSidebarGuideTab from './FilterSidebarGuideTab';
import FilterSidebarSearchTab from './FilterSidebarSearchTab';
import FilterSidebarFacilitiesTab from './FilterSidebarFacilitiesTab';
import FacilitySidebarSearchTabFacilitiesCount from './FacilitySidebarSearchTabFacilitiesCount';
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
    fetchContributorTypeOptions,
    fetchCountryOptions,
    fetchAllFilterOptions,
} from '../actions/filterOptions';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    countryOptionsPropType,
} from '../util/propTypes';

import { allListsAreEmpty } from '../util/util';

const filterSidebarStyles = Object.freeze({
    controlPanelStyles: Object.freeze({
        height: 'inherit',
        width: 'inherit',
    }),
});

class FilterSidebar extends Component {
    componentDidMount() {
        const {
            contributorsData,
            contributorTypesData,
            countriesData,
            fetchFilterOptions,
            fetchContributors,
            fetchContributorTypes,
            fetchCountries,
        } = this.props;

        if (allListsAreEmpty(contributorsData, contributorTypesData, countriesData)) {
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

        return null;
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
        } = this.props;

        if (fetchingFeatureFlags) {
            return <CircularProgress />;
        }

        const header = !embed ? (
            <div className="panel-header results-height-subtract">
                <h3 className="panel-header__title">
                    Open Apparel Registry
                </h3>
                <p className="panel-header__subheading">
                    The open map of global apparel facilities.
                </p>
            </div>) : null;

        let orderedTabsForSidebar = vectorTileFeatureIsActive
            ? filterSidebarTabs.slice().reverse()
            : filterSidebarTabs;

        if (embed) {
            orderedTabsForSidebar = orderedTabsForSidebar.filter(({ tab }) => tab !== 'guide');
        }

        const activeTabIndex = orderedTabsForSidebar
            .findIndex(({ tab }) => tab === activeFilterSidebarTab);

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
            <AppBar position="static" className="results-height-subtract filter-sidebar-tabgroup">
                <Tabs
                    value={activeTabIndex}
                    onChange={handleTabChange}
                    classes={{
                        root: 'tabs',
                        indicator: 'tabs-indicator-color',
                    }}
                >
                    {
                        orderedTabsForSidebar
                            .map(sidebarTab => (
                                <Tab
                                    key={sidebarTab.tab}
                                    label={sidebarTab.tab}
                                    className="tab-minwidth"
                                />))
                    }
                    <FacilitySidebarSearchTabFacilitiesCount />
                </Tabs>
            </AppBar>);

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
                            alternative={<NonVectorTileFilterSidebarFacilitiesTab />}
                        >
                            <FilterSidebarFacilitiesTab />
                        </FeatureFlag>
                    );
                default:
                    window.console.warn('invalid tab selection', activeFilterSidebarTab);
                    return null;
            }
        })();

        return (
            <div
                className="control-panel"
                style={filterSidebarStyles.controlPanelStyles}
            >
                {header}
                {tabBar}
                {insetComponent}
            </div>
        );
    }
}

FilterSidebar.propTypes = {
    activeFilterSidebarTab: oneOf(Object.values(filterSidebarTabsEnum)).isRequired,
    makeGuideTabActive: func.isRequired,
    makeSearchTabActive: func.isRequired,
    makeFacilitiesTabActive: func.isRequired,
    fetchFilterOptions: func.isRequired,
    fetchContributors: func.isRequired,
    fetchContributorTypes: func.isRequired,
    fetchCountries: func.isRequired,
    contributorsData: contributorOptionsPropType.isRequired,
    contributorTypesData: contributorTypeOptionsPropType.isRequired,
    countriesData: countryOptionsPropType.isRequired,
    vectorTileFeatureIsActive: bool.isRequired,
    fetchingFeatureFlags: bool.isRequired,
};

function mapStateToProps({
    ui: {
        activeFilterSidebarTab,
    },
    filterOptions: {
        contributors: {
            data: contributorsData,
        },
        contributorTypes: {
            data: contributorTypesData,
        },
        countries: {
            data: countriesData,
        },
    },
    featureFlags: {
        flags,
        fetching: fetchingFeatureFlags,
    },
    embeddedMap: {
        embed,
    },
}) {
    return {
        activeFilterSidebarTab,
        contributorsData,
        contributorTypesData,
        countriesData,
        vectorTileFeatureIsActive: get(flags, 'vector_tile', false),
        fetchingFeatureFlags,
        embed,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        makeGuideTabActive: () => dispatch(makeSidebarGuideTabActive()),
        makeSearchTabActive: () => dispatch(makeSidebarSearchTabActive()),
        makeFacilitiesTabActive: () => dispatch(makeSidebarFacilitiesTabActive()),
        fetchFilterOptions: () => dispatch(fetchAllFilterOptions()),
        fetchContributors: () => dispatch(fetchContributorOptions()),
        fetchContributorTypes: () => dispatch(fetchContributorTypeOptions()),
        fetchCountries: () => dispatch(fetchCountryOptions()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterSidebar);
