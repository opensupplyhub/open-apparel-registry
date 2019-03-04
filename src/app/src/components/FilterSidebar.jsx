import React, { Component } from 'react';
import { func, oneOf } from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FilterSidebarGuideTab from './FilterSidebarGuideTab';
import FilterSidebarSearchTab from './FilterSidebarSearchTab';
import FilterSidebarFacilitiesTab from './FilterSidebarFacilitiesTab';

import {
    filterSidebarTabsEnum,
    filterSidebarTabs,
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
        } = this.props;

        const header = (
            <div className="panel-header">
                <h3 className="panel-header__title">
                    Open Apparel Registry
                </h3>
                <p className="panel-header__subheading">
                    The open map of global apparel facilities.
                </p>
            </div>);

        const activeTabIndex = filterSidebarTabs
            .findIndex(({ tab }) => tab === activeFilterSidebarTab);

        const handleTabChange = (_, value) => {
            const changeTab = [
                makeGuideTabActive,
                makeSearchTabActive,
                makeFacilitiesTabActive,
            ][value];

            return changeTab();
        };

        const tabBar = (
            <AppBar position="static">
                <Tabs
                    value={activeTabIndex}
                    onChange={handleTabChange}
                    classes={{
                        root: 'tabs',
                        indicator: 'tabs-indicator-color',
                    }}
                >
                    {
                        filterSidebarTabs
                            .map(sidebarTab => (
                                <Tab
                                    key={sidebarTab.tab}
                                    label={sidebarTab.tab}
                                    className="tab-minwidth"
                                />))
                    }
                </Tabs>
            </AppBar>);

        const insetComponent = (() => {
            switch (activeFilterSidebarTab) {
                case filterSidebarTabsEnum.guide:
                    return <FilterSidebarGuideTab />;
                case filterSidebarTabsEnum.search:
                    return <FilterSidebarSearchTab />;
                case filterSidebarTabsEnum.facilities:
                    return <FilterSidebarFacilitiesTab />;
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
}) {
    return {
        activeFilterSidebarTab,
        contributorsData,
        contributorTypesData,
        countriesData,
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
