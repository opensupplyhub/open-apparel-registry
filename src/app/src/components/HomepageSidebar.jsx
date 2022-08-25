import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Route } from 'react-router-dom';

import HomepageSidebarSearch from './HomepageSidebarSearch';

import {
    fetchContributorOptions,
    fetchListOptions,
    fetchCountryOptions,
    fetchAllPrimaryFilterOptions,
} from '../actions/filterOptions';

import {
    contributorOptionsPropType,
    countryOptionsPropType,
    sectorOptionsPropType,
} from '../util/propTypes';

import { allListsAreEmpty } from '../util/util';

import { facilitiesRoute } from '../util/constants';

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

class HomepageSidebar extends Component {
    componentDidMount() {
        const {
            contributorsData,
            countriesData,
            sectorsData,
            fetchFilterOptions,
            fetchContributors,
            fetchLists,
            fetchCountries,
            contributors,
            history,
        } = this.props;

        if (history.location.search.length) {
            history.replace(`${facilitiesRoute}/${history.location.search}`);
        }

        if (allListsAreEmpty(contributorsData, countriesData, sectorsData)) {
            return fetchFilterOptions();
        }

        if (!contributorsData) {
            fetchContributors();
        }

        if (!countriesData) {
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
        const { fetchingFeatureFlags } = this.props;

        if (fetchingFeatureFlags) {
            return <CircularProgress />;
        }

        // We wrap this component in a `Route` to give it access to `history.push`
        // in its `mapDispatchToProps` function.
        const insetComponent = <Route component={HomepageSidebarSearch} />;

        return (
            <div className="control_panel" style={controlPanelStyles}>
                {insetComponent}
            </div>
        );
    }
}
HomepageSidebar.defaultProps = {
    contributorsData: null,
    countriesData: null,
    sectorsData: null,
};

HomepageSidebar.propTypes = {
    fetchFilterOptions: func.isRequired,
    fetchContributors: func.isRequired,
    fetchCountries: func.isRequired,
    contributorsData: contributorOptionsPropType,
    countriesData: countryOptionsPropType,
    sectorsData: sectorOptionsPropType,
    fetchingFeatureFlags: bool.isRequired,
};

function mapStateToProps({
    filterOptions: {
        contributors: { data: contributorsData },
        countries: { data: countriesData },
        sectors: { data: sectorsData },
    },
    featureFlags: { fetching: fetchingFeatureFlags },
    filters: { contributors },
}) {
    return {
        contributorsData,
        countriesData,
        sectorsData,
        fetchingFeatureFlags,
        contributors,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchFilterOptions: () => dispatch(fetchAllPrimaryFilterOptions()),
        fetchContributors: () => dispatch(fetchContributorOptions()),
        fetchLists: () => dispatch(fetchListOptions()),
        fetchCountries: () => dispatch(fetchCountryOptions()),
    };
}

export default withStyles(filterSidebarStyles)(
    connect(mapStateToProps, mapDispatchToProps)(HomepageSidebar),
);
