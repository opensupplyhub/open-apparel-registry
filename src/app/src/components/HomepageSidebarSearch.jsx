import React, { useState } from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import TuneIcon from '@material-ui/icons/Tune';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

import ShowOnly from './ShowOnly';
import FeatureFlag from './FeatureFlag';
import FilterSidebarExtendedSearch from './FilterSidebarExtendedSearch';
import TextSearchFilter from './Filters/TextSearchFilter';
import ContributorFilter from './Filters/ContributorFilter';
import CountryNameFilter from './Filters/CountryNameFilter';
import SectorFilter from './Filters/SectorFilter';

import { resetAllFilters } from '../actions/filters';

import { recordSearchTabResetButtonClick } from '../actions/ui';

import COLOURS from '../util/COLOURS';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    countryOptionsPropType,
    sectorOptionsPropType,
    facilityTypeOptionsPropType,
    processingTypeOptionsPropType,
    productTypeOptionsPropType,
    numberOfWorkerOptionsPropType,
} from '../util/propTypes';

import { filterSidebarStyles } from '../util/styles';

import { facilitiesRoute, EXTENDED_PROFILE_FLAG } from '../util/constants';

const filterSidebarSearchTabStyles = theme =>
    Object.freeze({
        headerStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            fontSize: '4.5rem',
            fontWeight: 900,
            color: '#191919',
            letterSpacing: '-0.004em',
            paddingBottom: '0.5rem',
            lineHeight: '4.5rem',
        }),
        font: Object.freeze({
            fontFamily: `${theme.typography.fontFamily} !important`,
        }),
        reset: Object.freeze({
            marginLeft: '16px',
            minWidth: '36px',
            minHeight: '36px',
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '1rem',
        }),
        searchButton: Object.freeze({
            boxShadow: 'none',
            backgroundColor: COLOURS.NAVIGATION,
            color: COLOURS.NEAR_BLACK,
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '1rem',
        }),
        buttonGroup: Object.freeze({
            marginBottom: '40px',
            marginTop: '40px',
        }),
        drawerHeader: Object.freeze({
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
        }),
        closeButton: Object.freeze({}),
        drawerTitle: Object.freeze({
            fontWeight: 900,
            fontSize: '2rem',
        }),
        drawerSubtitle: Object.freeze({
            fontWeight: 600,
            fontSize: '1rem',
            marginBottom: '2rem',
        }),
        drawer: Object.freeze({
            padding: '1rem 4.5rem',
            maxWidth: '560px',
            minWidth: '33%',
        }),
        ...filterSidebarStyles,
    });

const checkIfAnyFieldSelected = fields => fields.some(f => f.length !== 0);

const countHiddenFields = fields =>
    fields.reduce((count, f) => (f.length !== 0 ? count + 1 : count), 0);

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
    embed,
    lists,
    classes,
    embedExtendedFields,
}) {
    const hiddenFields = [
        contributorTypes,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        sectors,
    ];

    const allFields = hiddenFields.concat([
        facilityFreeTextQuery,
        contributors,
        countries,
        lists,
    ]);

    const [expand, setExpand] = useState(false);

    if (fetchingOptions) {
        return (
            <div className="control-panel__content">
                <CircularProgress />
            </div>
        );
    }

    const hiddenFieldsCount = countHiddenFields(hiddenFields);
    const expandButton = (
        <div>
            <Button
                variant="outlined"
                onClick={() => setExpand(true)}
                disableRipple
                color="primary"
                style={{
                    textTransform: 'none',
                    fontWeight: 900,
                    fontSize: '1rem',
                }}
            >
                <TuneIcon style={{ paddingRight: '0.5rem' }} />
                {hiddenFieldsCount ? `${hiddenFieldsCount} ` : ''}
                More Search Filter{hiddenFieldsCount === 1 ? '' : 's'}
            </Button>
        </div>
    );

    const searchButton = (
        <Button
            variant="contained"
            type="submit"
            className={`${classes.font} ${classes.searchButton}`}
            onClick={searchForFacilities}
            disabled={fetchingOptions}
        >
            Find Facilities
        </Button>
    );

    const applyFiltersButton = (
        <Button
            variant="contained"
            type="submit"
            className={`${classes.font} ${classes.searchButton}`}
            onClick={() => setExpand(false)}
            disabled={fetchingOptions}
        >
            Apply Filters
        </Button>
    );

    const resetButton = (
        <Button
            size="small"
            variant="outlined"
            onClick={() => resetFilters(embed)}
            className={classes.reset}
            disabled={fetchingOptions}
        >
            Reset Search
        </Button>
    );

    const resetHiddenFiltersButton = (
        <Button
            size="small"
            variant="outlined"
            onClick={() => resetFilters(embed)}
            className={classes.reset}
            disabled={fetchingOptions}
        >
            Reset
        </Button>
    );

    const searchResetButtonGroup = () => {
        if (fetchingFacilities) {
            return <CircularProgress size={30} />;
        }
        if (checkIfAnyFieldSelected(hiddenFields)) {
            return (
                <>
                    {searchButton}
                    {resetHiddenFiltersButton}
                </>
            );
        }
        return searchButton;
    };

    const getHiddenFieldsButtonGroup = () => {
        if (fetchingFacilities) {
            return <CircularProgress size={30} />;
        }
        if (checkIfAnyFieldSelected(allFields)) {
            return (
                <>
                    {applyFiltersButton}
                    {resetButton}
                </>
            );
        }
        return applyFiltersButton;
    };

    return (
        <div
            className={`control-panel__content ${classes.controlPanelContentStyles}`}
            style={{ padding: '2rem 4.5rem' }}
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
                    <Typography className={classes.headerStyle}>
                        Explore global supply chain data
                    </Typography>
                </div>
                <TextSearchFilter searchForFacilities={searchForFacilities} />
                <Grid container spacing={8}>
                    <Grid item xs={12} md={6}>
                        <ContributorFilter />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CountryNameFilter />
                    </Grid>
                </Grid>
                <ShowOnly when={!embed || embedExtendedFields.length}>
                    {expandButton}
                </ShowOnly>
                <div className={classes.buttonGroup}>
                    {searchResetButtonGroup()}
                </div>
            </div>
            <Drawer
                anchor="right"
                open={expand}
                onClose={() => setExpand(false)}
            >
                <div className={classes.drawer}>
                    <div className={classes.drawerHeader}>
                        <IconButton
                            aria-label="Close"
                            className={classes.closeButton}
                            onClick={() => setExpand(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Typography className={classes.drawerTitle}>
                        Find facilities
                    </Typography>
                    <Typography className={classes.drawerSubtitle}>
                        Browse facilities using the criteria below.
                    </Typography>
                    <SectorFilter />
                    <FeatureFlag flag={EXTENDED_PROFILE_FLAG}>
                        <FilterSidebarExtendedSearch />
                    </FeatureFlag>
                    {getHiddenFieldsButtonGroup()}
                </div>
            </Drawer>
        </div>
    );
}

FilterSidebarSearchTab.propTypes = {
    resetFilters: func.isRequired,
    facilityFreeTextQuery: string.isRequired,
    contributors: contributorOptionsPropType.isRequired,
    contributorTypes: contributorTypeOptionsPropType.isRequired,
    countries: countryOptionsPropType.isRequired,
    sectors: sectorOptionsPropType.isRequired,
    parentCompany: contributorOptionsPropType.isRequired,
    facilityType: facilityTypeOptionsPropType.isRequired,
    processingType: processingTypeOptionsPropType.isRequired,
    productType: productTypeOptionsPropType.isRequired,
    numberOfWorkers: numberOfWorkerOptionsPropType.isRequired,
    fetchingFacilities: bool.isRequired,
    searchForFacilities: func.isRequired,
    fetchingOptions: bool.isRequired,
};

function mapStateToProps({
    filterOptions: {
        contributors: { fetching: fetchingContributors },
        countries: { fetching: fetchingCountries },
    },
    filters: {
        facilityFreeTextQuery,
        contributors,
        lists,
        contributorTypes,
        countries,
        sectors,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
        combineContributors,
        boundary,
    },
    facilities: {
        facilities: { fetching: fetchingFacilities },
    },
    embeddedMap: { embed, config },
}) {
    return {
        facilityFreeTextQuery,
        contributors,
        lists,
        contributorTypes,
        countries,
        sectors,
        parentCompany,
        facilityType,
        processingType,
        productType,
        numberOfWorkers,
        nativeLanguageName,
        combineContributors,
        fetchingFacilities,
        boundary,
        fetchingOptions: fetchingContributors || fetchingCountries,
        embed: !!embed,
        textSearchLabel: config.text_search_label,
        embedExtendedFields: config.extended_fields,
    };
}

function mapDispatchToProps(dispatch, { history: { replace, location } }) {
    return {
        resetFilters: embedded => {
            dispatch(recordSearchTabResetButtonClick());
            return dispatch(resetAllFilters(embedded));
        },
        searchForFacilities: () =>
            replace(`${facilitiesRoute}${location.search}`),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterSidebarSearchTabStyles)(FilterSidebarSearchTab));
