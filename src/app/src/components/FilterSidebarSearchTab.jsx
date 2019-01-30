import React from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactSelect from 'react-select';

import {
    updateFacilityNameFilter,
    updateContributorFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
    resetAllFilters,
} from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

import {
    contributorOptionsPropType,
    contributorTypeOptionsPropType,
    countryOptionsPropType,
} from '../util/propTypes';

import { getValueFromEvent } from '../util/util';

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
    facilityName,
    updateFacilityName,
    contributors,
    updateContributor,
    contributorTypes,
    updateContributorType,
    countries,
    updateCountry,
    fetchingFacilities,
    searchForFacilities,
}) {
    return (
        <div className="control-panel__content">
            <div>
                <div className="form__field">
                    <InputLabel
                        htmlFor={FACILITIES}
                        className="form__label"
                    >
                        Search a Facility Name
                    </InputLabel>
                    <TextField
                        id={FACILITIES}
                        placeholder="Facility Name"
                        className="full-width margin-bottom-16 form__text-input"
                        value={facilityName}
                        onChange={updateFacilityName}
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
                        className="basic-multi-select"
                        classNamePrefix="select"
                        options={contributorOptions}
                        value={contributors}
                        onChange={updateContributor}
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
                        className="basic-multi-select"
                        classNamePrefix="select"
                        options={contributorTypeOptions}
                        value={contributorTypes}
                        onChange={updateContributorType}
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
                                        onClick={searchForFacilities}
                                    >
                                        Search
                                    </Button>)
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

FilterSidebarSearchTab.propTypes = {
    contributorOptions: contributorOptionsPropType.isRequired,
    contributorTypeOptions: contributorTypeOptionsPropType.isRequired,
    countryOptions: countryOptionsPropType.isRequired,
    resetFilters: func.isRequired,
    updateFacilityName: func.isRequired,
    updateContributor: func.isRequired,
    updateContributorType: func.isRequired,
    updateCountry: func.isRequired,
    facilityName: string.isRequired,
    contributors: contributorOptionsPropType.isRequired,
    contributorTypes: contributorTypeOptionsPropType.isRequired,
    countries: countryOptionsPropType.isRequired,
    fetchingFacilities: bool.isRequired,
    searchForFacilities: func.isRequired,
};

function mapStateToProps({
    filterOptions: {
        contributors: {
            data: contributorOptions,
        },
        contributorTypes: {
            data: contributorTypeOptions,
        },
        countries: {
            data: countryOptions,
        },
    },
    filters: {
        facilityName,
        contributors,
        contributorTypes,
        countries,
    },
    facilities: {
        fetching: fetchingFacilities,
    },
}) {
    return {
        contributorOptions,
        contributorTypeOptions,
        countryOptions,
        facilityName,
        contributors,
        contributorTypes,
        countries,
        fetchingFacilities,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateFacilityName: e => dispatch(updateFacilityNameFilter(getValueFromEvent(e))),
        updateContributor: v => dispatch(updateContributorFilter(v)),
        updateContributorType: v => dispatch(updateContributorTypeFilter(v)),
        updateCountry: v => dispatch(updateCountryFilter(v)),
        resetFilters: () => dispatch(resetAllFilters()),
        searchForFacilities: () => dispatch(fetchFacilities()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterSidebarSearchTab);
