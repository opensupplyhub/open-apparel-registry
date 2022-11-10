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
    withTheme,
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
import MapWithHookedHeight from './MapWithHookedHeight';
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
        header: {
            padding: '24px',
            fontFamily: theme.typography.fontFamily,
            [theme.breakpoints.up('sm')]: {
                padding: '12px 24px',
            },
            [theme.breakpoints.up('md')]: {
                padding: '24px',
            },
        },
        headerText: {
            fontWeight: 900,
            fontSize: '44px',
            margin: 0,
            lineHeight: '48px',
            fontFamily: theme.typography.fontFamily,
        },
        resultsSpan: { fontWeight: 800 },
        filterDrawer: {
            backgroundColor: '#fff',
            height: '100%',
        },
        filterDrawerContents: {
            alignItems: 'center',
            paddingLeft: '1em',
            paddingRight: '1em',
            display: 'flex',
            justifyContent: 'space-between',
        },
        filterDrawerHeader: {
            fontFamily: theme.typography.fontFamily,
        },
        filterButton: {
            backgroundColor: theme.palette.action.main,
            '&:hover': {
                backgroundColor: theme.palette.action.dark,
            },
            color: theme.palette.secondary.contrastText,
            fontWeight: 900,
        },
        tab: {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            borderColor: '#000',
            borderStyle: 'solid',
            borderWidth: 1,
            fontWeight: 800,
        },
        searchContainer: {
            minWidth: '200px',
        },
        resultsContainer: {
            [theme.breakpoints.up('sm')]: {
                minWidth: '250px',
            },
            [theme.breakpoints.up('md')]: {
                minWidth: '320px',
            },
        },
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
        const { fetchingFeatureFlags, classes, theme } = this.props;

        const actionContrastText = theme.palette.getContrastText(
            theme.palette.action.main,
        );
        const tabContrastText = theme.palette.secondary.contrastText;

        const renderHeader = ({ multiLine }) =>
            this.props.facilitiesCount > 0 && (
                <div className={`${classes.header} results-height-subtract`}>
                    <h1 className={classes.headerText}>
                        <FacilityIcon /> Facilities
                    </h1>
                    {multiLine ? (
                        <span className={classes.resultsSpan}>
                            {`${this.props.facilitiesCount} results`}
                        </span>
                    ) : (
                        `${this.props.facilitiesCount} results`
                    )}
                </div>
            );

        if (fetchingFeatureFlags) {
            return <CircularProgress />;
        }

        return (
            <>
                <Hidden smUp>
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
                                        <FacilitiesIcon
                                            color={
                                                this.props
                                                    .activeFilterSidebarTab ===
                                                    0 && tabContrastText
                                            }
                                        />
                                        LIST
                                    </div>
                                }
                                className={classes.tab}
                                style={
                                    this.props.activeFilterSidebarTab === 0
                                        ? {
                                              // omit shared border
                                              borderRightWidth: 0,
                                          }
                                        : {
                                              backgroundColor: '#fff',
                                              color: '#000',
                                              // omit shared border
                                              borderRightWidth: 0,
                                          }
                                }
                            />
                            <Tab
                                label={
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <MapIcon
                                            color={
                                                this.props
                                                    .activeFilterSidebarTab ===
                                                    1 && tabContrastText
                                            }
                                        />
                                        MAP
                                    </div>
                                }
                                className={classes.tab}
                                style={
                                    this.props.activeFilterSidebarTab === 1
                                        ? {}
                                        : {
                                              backgroundColor: '#fff',
                                              color: '#000',
                                          }
                                }
                            />
                            <div style={{ padding: '10px' }} />
                            <Button
                                Icon={FilterIcon}
                                color={actionContrastText}
                                onClick={() =>
                                    this.props.toggleFilterModal(true)
                                }
                                className={classes.filterButton}
                                text="FILTERS"
                            />
                        </Tabs>
                        {this.props.activeFilterSidebarTab === 0 && (
                            <Grid item sm={12}>
                                {renderHeader({ multiLine: true })}

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
                                <MapWithHookedHeight />
                            </div>
                        )}
                    </Grid>
                </Hidden>
                <Hidden only="xs">
                    <Grid item sm={3} className={classes.searchContainer}>
                        <FilterSidebarSearchTab />
                    </Grid>
                </Hidden>
                <Hidden only="xs">
                    <Grid
                        item
                        xs={12}
                        sm={4}
                        className={classes.resultsContainer}
                    >
                        {renderHeader({})}
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
                    <div className={classes.filterDrawer}>
                        <div className={classes.filterDrawerContents}>
                            <h1 className={classes.filterDrawerHeader}>
                                Filters
                            </h1>
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

export default withTheme()(
    withStyles(filterSidebarStyles)(
        connect(mapStateToProps, mapDispatchToProps)(FilterSidebar),
    ),
);
