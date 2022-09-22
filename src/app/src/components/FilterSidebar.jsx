import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import {
    Grid,
    Hidden,
    IconButton,
    Modal,
    Tab,
    Tabs,
    withStyles,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import get from 'lodash/get';

import Button from './Button';
import FacilityIcon from './FacilityIcon';
import FilterIcon from './FilterIcon';
import FeatureFlag from './FeatureFlag';
import FilterSidebarSearchTab from './FilterSidebarSearchTab';
import FilterSidebarFacilitiesTab from './FilterSidebarFacilitiesTab';
import Map from './Map';
import NonVectorTileFilterSidebarFacilitiesTab from './NonVectorTileFilterSidebarFacilitiesTab';

import { VECTOR_TILE } from '../util/constants';

import { setSidebarTabActive, toggleFilterModal } from '../actions/ui';

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
import MapIcon from './MapIcon';
import FacilitiesIcon from './FacilitiesIcon';

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
            sectorsData,
            fetchFilterOptions,
            fetchContributors,
            fetchLists,
            fetchCountries,
            contributors,
        } = this.props;

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

        return (
            <>
                <Hidden lgUp>
                    <Grid
                        item
                        style={{
                            alignItems: 'center',
                            display: 'flex',
                            width: '100%',
                            flexDirection: 'column',
                        }}
                    >
                        <Tabs
                            value={this.props.activeFilterSidebarTab}
                            onChange={(_, v) => {
                                this.props.setTabActive(v);
                            }}
                            classes={{
                                root: 'tabs results-height-subtract',
                                indicator: 'tabs-indicator-color',
                            }}
                        >
                            <Tab
                                label={
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <FacilitiesIcon />
                                        LIST
                                    </div>
                                }
                                style={{
                                    backgroundColor:
                                        this.props.activeFilterSidebarTab === 0
                                            ? '#FFA6D0'
                                            : '#fff',
                                    borderColor: '#000',
                                    borderStyle: 'solid',
                                    borderWidth: 1,
                                    // omit shared border
                                    borderRightWidth: 0,
                                    fontWeight: 800,
                                }}
                            />
                            <Tab
                                label={
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <MapIcon />
                                        MAP
                                    </div>
                                }
                                style={{
                                    backgroundColor:
                                        this.props.activeFilterSidebarTab === 1
                                            ? '#FFA6D0'
                                            : '#fff',
                                    borderColor: '#000',
                                    borderStyle: 'solid',
                                    borderWidth: 1,
                                    fontWeight: 800,
                                }}
                            />
                            <div style={{ padding: '10px' }} />
                            <Button
                                Icon={FilterIcon}
                                onClick={() =>
                                    this.props.toggleFilterModal(true)
                                }
                                style={{
                                    backgroundColor: '#FFCF3F',
                                    color: '#000',
                                    fontWeight: 900,
                                }}
                                text="FILTERS"
                            />
                        </Tabs>
                        {this.props.activeFilterSidebarTab === 0 && (
                            <Grid item sm={12} md={3}>
                                {this.props.facilitiesCount > 0 && (
                                    <div
                                        className="results-height-subtract"
                                        style={{
                                            padding: '24px',
                                        }}
                                    >
                                        <h1
                                            style={{
                                                fontWeight: 900,
                                                fontSize: '44px',
                                                margin: 0,
                                                lineHeight: '48px',
                                            }}
                                        >
                                            <FacilityIcon /> Facilities
                                        </h1>
                                        {`${this.props.facilitiesCount} results`}
                                    </div>
                                )}
                                <FeatureFlag
                                    flag={VECTOR_TILE}
                                    alternative={
                                        <NonVectorTileFilterSidebarFacilitiesTab />
                                    }
                                >
                                    <FilterSidebarFacilitiesTab />
                                </FeatureFlag>
                            </Grid>
                        )}
                        {this.props.activeFilterSidebarTab === 1 && (
                            <div
                                style={{
                                    height: '100%',
                                    marginTop: '1em',
                                    width: '100%',
                                }}
                            >
                                <Map />
                            </div>
                        )}
                    </Grid>
                </Hidden>
                <Hidden mdDown>
                    <Grid item md={3} style={{ height: '100%' }}>
                        <FilterSidebarSearchTab />
                    </Grid>
                </Hidden>
                <Hidden mdDown>
                    <Grid item sm={12} md={4}>
                        {this.props.facilitiesCount > 0 && (
                            <div
                                className="results-height-subtract"
                                style={{
                                    padding: '24px',
                                }}
                            >
                                <h1
                                    style={{
                                        fontWeight: 900,
                                        fontSize: '44px',
                                        margin: 0,
                                        lineHeight: '48px',
                                    }}
                                >
                                    <FacilityIcon /> Facilities
                                </h1>
                                {`${this.props.facilitiesCount} results`}
                            </div>
                        )}
                        <FeatureFlag
                            flag={VECTOR_TILE}
                            alternative={
                                <NonVectorTileFilterSidebarFacilitiesTab />
                            }
                        >
                            <FilterSidebarFacilitiesTab />
                        </FeatureFlag>
                    </Grid>
                </Hidden>
                <Modal
                    open={this.props.filterModalOpen}
                    onClose={() => this.props.toggleFilterModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                alignItems: 'center',
                                paddingLeft: '1em',
                                paddingRight: '1em',
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <h1>Filters</h1>
                            <IconButton
                                onClick={() =>
                                    this.props.toggleFilterModal(false)
                                }
                            >
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <FilterSidebarSearchTab />
                    </div>
                </Modal>
            </>
        );
    }
}
FilterSidebar.defaultProps = {
    contributorsData: null,
    countriesData: null,
    sectorsData: null,
};

FilterSidebar.propTypes = {
    fetchFilterOptions: func.isRequired,
    fetchContributors: func.isRequired,
    fetchCountries: func.isRequired,
    contributorsData: contributorOptionsPropType,
    countriesData: countryOptionsPropType,
    sectorsData: sectorOptionsPropType,
    fetchingFeatureFlags: bool.isRequired,
};

function mapStateToProps({
    ui: { activeFilterSidebarTab, filterModalOpen },
    filterOptions: {
        contributors: { data: contributorsData },
        countries: { data: countriesData },
        sectors: { data: sectorsData },
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
        filterModalOpen,
        contributorsData,
        countriesData,
        sectorsData,
        vectorTileFeatureIsActive: get(flags, 'vector_tile', false),
        fetchingFeatureFlags,
        embed,
        contributors,
        facilitiesCount: get(facilities, 'count', null),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        toggleFilterModal: () => dispatch(toggleFilterModal()),
        setTabActive: value => dispatch(setSidebarTabActive(value)),
        fetchFilterOptions: () => dispatch(fetchAllPrimaryFilterOptions()),
        fetchContributors: () => dispatch(fetchContributorOptions()),
        fetchLists: () => dispatch(fetchListOptions()),
        fetchCountries: () => dispatch(fetchCountryOptions()),
    };
}

export default withStyles(filterSidebarStyles)(
    connect(mapStateToProps, mapDispatchToProps)(FilterSidebar),
);
