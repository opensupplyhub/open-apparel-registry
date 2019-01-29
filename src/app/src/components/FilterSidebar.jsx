import React from 'react';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import FilterSidebarGuideTab from './FilterSidebarGuideTab';
import FilterSidebarSearchTab from './FilterSidebarSearchTab';

import {
    filterSidebarTabsEnum,
    filterSidebarTabs,
} from '../util/constants';

import {
    makeSidebarGuideTabActive,
    makeSidebarSearchTabActive,
} from '../actions/ui';

function FilterSidebar({
    activeFilterSidebarTab,
    makeGuideTabActive,
    makeSearchTabActive,
}) {
    const header = (
        <div className="panel-header">
            <h3 className="panel-header__title">
                Open Apparel Registry
            </h3>
            <p className="panel-header__subheading">
                The open map of global apparel factories.
            </p>
        </div>);

    const activeTabIndex = filterSidebarTabs
          .findIndex(({ tab }) => tab === activeFilterSidebarTab);

    const handleTabChange = activeFilterSidebarTab === filterSidebarTabsEnum.guide
        ? makeSearchTabActive
        : makeGuideTabActive;

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

    const insetComponent = activeFilterSidebarTab === filterSidebarTabsEnum.guide
        ? <FilterSidebarGuideTab />
        : <FilterSidebarSearchTab />;

    return (
        <div className="control-panel">
            {header}
            {tabBar}
            <Typography component="div">
                {insetComponent}
            </Typography>
        </div>
    );
}

function mapStateToProps({
    ui: {
        activeFilterSidebarTab,
    },
}) {
    return {
        activeFilterSidebarTab,
    };
}

function mapDispatchToProps(dispatch, {
    activeFilterSidebarTab,
}) {
    return {
        makeGuideTabActive: () => dispatch(makeSidebarGuideTabActive()),
        makeSearchTabActive: () => dispatch(makeSidebarSearchTabActive()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterSidebar);
