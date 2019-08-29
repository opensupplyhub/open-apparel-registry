import React from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactSelect from 'react-select';
import get from 'lodash/get';

import FacilitySidebarSearchTabFacilitiesCount from './FacilitySidebarSearchTabFacilitiesCount';

import {
    updateFacilityFreeTextQueryFilter,
    updateContributorFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
    resetAllFilters,
} from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

import { recordSearchTabResetButtonClick } from '../actions/ui';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    countryOptionsPropType,
    facilityCollectionPropType,
} from '../util/propTypes';

import { filterSidebarStyles } from '../util/styles';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import { FACILITIES_REQUEST_PAGE_SIZE } from '../util/constants';

const filterSidebarSearchTabStyles = Object.freeze({
    formStyle: Object.freeze({
        width: '100%',
        marginBottom: '32px',
    }),
    inputLabelStyle: Object.freeze({
        fontSize: '16px',
        fontWeight: 500,
        color: '#000',
        transform: 'translate(0, -8px) scale(1)',
        paddingBottom: '0.5rem',
    }),
});

const FACILITIES = 'FACILITIES';
const CONTRIBUTORS = 'CONTRIBUTORS';
const CONTRIBUTOR_TYPES = 'CONTRIBUTOR_TYPES';
const COUNTRIES = 'COUNTRIES';

function FilterSidebarSearchTab({
    contributorOptions,
    contributorTypeOptions,
    countryOptions,
    resetFilters,
    facilityFreeTextQuery,
    updateFacilityFreeTextQuery,
    contributors,
    updateContributor,
    contributorTypes,
    updateContributorType,
    countries,
    updateCountry,
    fetchingFacilities,
    searchForFacilities,
    facilities,
    fetchingOptions,
    submitFormOnEnterKeyPress,
    vectorTileFlagIsActive,
}) {
    if (fetchingOptions) {
        return (
            <div className="control-panel__content">
                <CircularProgress />
            </div>
        );
    }

    const noFacilitiesFoundMessage = (() => {
        if (fetchingFacilities) {
            return null;
        }

        if (!facilities) {
            return null;
        }

        if (facilities.features.length) {
            return null;
        }

        return (
            <div className="form__field">
                <p style={{ color: 'red' }}>
                    No facilities were found for that search
                </p>
            </div>
        );
    })();

    return (
        <div
            className="control-panel__content"
            style={filterSidebarStyles.controlPanelContentStyles}
        >
            <div>
                <div className="form__field">
                    <InputLabel
                        htmlFor={FACILITIES}
                        className="form__label"
                    >
                        Search a Facility Name or OAR ID
                    </InputLabel>
                    <TextField
                        id={FACILITIES}
                        placeholder="Facility Name or OAR ID"
                        className="full-width margin-bottom-16 form__text-input"
                        value={facilityFreeTextQuery}
                        onChange={updateFacilityFreeTextQuery}
                        onKeyPress={submitFormOnEnterKeyPress}
                    />
                </div>
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={CONTRIBUTORS}
                        style={filterSidebarSearchTabStyles.inputLabelStyle}
                    >
                        Filter by Contributor
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={CONTRIBUTORS}
                        name={CONTRIBUTORS}
                        className="basic-multi-select notranslate"
                        classNamePrefix="select"
                        options={contributorOptions}
                        value={contributors}
                        onChange={updateContributor}
                        disabled={fetchingOptions || fetchingFacilities}
                    />
                </div>
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={CONTRIBUTOR_TYPES}
                        style={filterSidebarSearchTabStyles.inputLabelStyle}
                    >
                        Filter by Contributor Type
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={CONTRIBUTOR_TYPES}
                        name="contributorTypes"
                        className="basic-multi-select notranslate"
                        classNamePrefix="select"
                        options={contributorTypeOptions}
                        value={contributorTypes}
                        onChange={updateContributorType}
                        disabled={fetchingOptions || fetchingFacilities}
                    />
                </div>
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={COUNTRIES}
                        style={filterSidebarSearchTabStyles.inputLabelStyle}
                    >
                        Filter by Country Name
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={COUNTRIES}
                        name={COUNTRIES}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        options={countryOptions}
                        value={countries}
                        onChange={updateCountry}
                        disabled={fetchingOptions || fetchingFacilities}
                    />
                </div>
                <div className="form__action">
                    <a
                        className="control-link"
                        href="mailto:info@openapparel.org?subject=Reporting an issue"
                    >
                        Report an issue
                    </a>
                    <div className="offset offset-right">
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={resetFilters}
                            disableRipple
                            color="primary"
                            className="outlined-button"
                            disabled={fetchingOptions}
                        >
                            Reset
                        </Button>
                        {
                            fetchingFacilities
                                ? (
                                    <CircularProgress
                                        size={30}
                                        className="margin-left-16"
                                    />)
                                : (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        type="submit"
                                        color="primary"
                                        className="margin-left-16 blue-background"
                                        style={{ boxShadow: 'none' }}
                                        onClick={() => searchForFacilities(vectorTileFlagIsActive)}
                                        disabled={fetchingOptions}
                                    >
                                        Search
                                    </Button>)
                        }
                    </div>
                </div>
                {noFacilitiesFoundMessage}
            </div>
            <FacilitySidebarSearchTabFacilitiesCount />
        </div>
    );
}

FilterSidebarSearchTab.defaultProps = {
    facilities: null,
};

FilterSidebarSearchTab.propTypes = {
    contributorOptions: contributorOptionsPropType.isRequired,
    contributorTypeOptions: contributorTypeOptionsPropType.isRequired,
    countryOptions: countryOptionsPropType.isRequired,
    resetFilters: func.isRequired,
    updateFacilityFreeTextQuery: func.isRequired,
    updateContributor: func.isRequired,
    updateContributorType: func.isRequired,
    updateCountry: func.isRequired,
    facilityFreeTextQuery: string.isRequired,
    contributors: contributorOptionsPropType.isRequired,
    contributorTypes: contributorTypeOptionsPropType.isRequired,
    countries: countryOptionsPropType.isRequired,
    fetchingFacilities: bool.isRequired,
    searchForFacilities: func.isRequired,
    facilities: facilityCollectionPropType,
    fetchingOptions: bool.isRequired,
    vectorTileFlagIsActive: bool.isRequired,
};

function mapStateToProps({
    filterOptions: {
        contributors: {
            data: contributorOptions,
            fetching: fetchingContributors,
        },
        contributorTypes: {
            data: contributorTypeOptions,
            fetching: fetchingContributorTypes,
        },
        countries: {
            data: countryOptions,
            fetching: fetchingCountries,
        },
    },
    filters: {
        facilityFreeTextQuery,
        contributors,
        contributorTypes,
        countries,
    },
    facilities: {
        facilities: {
            data: facilities,
            fetching: fetchingFacilities,
        },
    },
    featureFlags,
}) {
    const vectorTileFlagIsActive = get(featureFlags, 'flags.vector_tile', false);

    return {
        vectorTileFlagIsActive,
        contributorOptions,
        contributorTypeOptions,
        countryOptions,
        facilityFreeTextQuery,
        contributors,
        contributorTypes,
        countries,
        fetchingFacilities,
        facilities,
        fetchingOptions: fetchingContributors
            || fetchingContributorTypes
            || fetchingCountries,
    };
}

function mapDispatchToProps(dispatch, {
    history: {
        push,
    },
}) {
    return {
        updateFacilityFreeTextQuery: e =>
            dispatch(updateFacilityFreeTextQueryFilter(getValueFromEvent(e))),
        updateContributor: v => dispatch(updateContributorFilter(v)),
        updateContributorType: v => dispatch(updateContributorTypeFilter(v)),
        updateCountry: v => dispatch(updateCountryFilter(v)),
        resetFilters: () => {
            dispatch(recordSearchTabResetButtonClick());
            return dispatch(resetAllFilters());
        },
        searchForFacilities: vectorTilesAreActive => dispatch(fetchFacilities({
            pageSize: vectorTilesAreActive ? FACILITIES_REQUEST_PAGE_SIZE : 500,
            pushNewRoute: push,
        })),
        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(fetchFacilities(push)),
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterSidebarSearchTab);
