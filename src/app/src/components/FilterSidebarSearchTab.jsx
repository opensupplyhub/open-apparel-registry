import React from 'react';
import { connect } from 'react-redux';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
    updateFacilityNameFilter,
    updateContributorFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
} from '../actions/filters';

export default function FilterSidebarSearchTab({
    contributorOptions,
    fetchingContributorOptions,
    contributorTypeOptions,
    fetchingContributorTypeOptions,
    countryOptions,
    fetchingCountryOptions,
    facilityName,
    contributor,
    contributorType,
    country,
}) {
    return (
        <div className="control-panel__content">
            <form onSubmit={window.console.dir}>
                <div className="form__field">
                    <InputLabel className="form__label">
                        Search a Facility Name
                    </InputLabel>
                    <TextField
                        id="name"
                        placeholder="Facility Name"
                        className="full-width margin-bottom-16 form__text-input"
                        value={this.state.name}
                        onChange={this.updateInputField('name')}
                    />
                </div>

                <FormControl
                    style={{
                        width: '100%',
                        marginBottom: '32px',
                    }}
                >
                    <InputLabel
                        shrink={false}
                        htmlFor="contributor"
                        style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#000',
                            transform:
                                'translate(0, -8px) scale(1)',
                        }}
                    >
                        Filter by Contributor
                    </InputLabel>
                    <Select
                        multiple
                        value={this.state.contributor}
                        onChange={this.updateInputField('contributor')}
                        name="contributor"
                        className="full-width margin-top-16 margin-bottom-16 notranslate"
                        input={
                            <Input
                                name="contributor"
                                id="contributor"
                                className="notranslate"
                            />
                        }
                        renderValue={(selected) => {
                            const selectedNames = this.convertIdToName(selected);
                            return selectedNames.join(', ');
                        }}
                        MenuProps={{
                            style: {
                                maxHeight: '50vh',
                            },
                        }}
                    >
                        {this.checkboxSources()}
                    </Select>
                </FormControl>
                <br />

                <FormControl
                    style={{
                        width: '100%',
                        marginBottom: '32px',
                    }}
                >
                    <InputLabel
                        shrink={false}
                        htmlFor="contributor_type"
                        style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#000',
                            transform:
                                'translate(0, -8px) scale(1)',
                        }}
                    >
                        Filter by Contributor Type
                    </InputLabel>
                    <Select
                        multiple
                        value={this.state.contributorType}
                        onChange={this.updateInputField('contributorType')}
                        name="contributorType"
                        className="full-width margin-top-16 margin-bottom-16 notranslate"
                        input={
                            <Input
                                name="contributorType"
                                id="contributorType"
                                className="notranslate"
                            />
                        }
                        renderValue={selected =>
                            selected.join(', ')
                        }
                        MenuProps={{
                            style: {
                                maxHeight: '50vh',
                            },
                        }}
                    >
                        {this.sourcesTypes()}
                    </Select>
                </FormControl>
                <br />

                <FormControl style={{ width: '100%' }}>
                    <InputLabel
                        shrink={false}
                        htmlFor="country"
                        style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#000',
                            transform:
                                'translate(0, -8px) scale(1)',
                        }}
                    >
                        Filter by Country
                    </InputLabel>
                    <Select
                        multiple
                        value={this.state.country}
                        onChange={this.updateInputField('country')}
                        name="country"
                        className="full-width margin-top-16 margin-bottom-16"
                        input={
                            <Input
                                name="country"
                                id="country"
                            />
                        }
                        renderValue={(selected) => {
                            const selectedNames = this.convertCodeToName(selected);
                            return selectedNames.join(', ');
                        }}
                        MenuProps={{
                            style: {
                                maxHeight: '50vh',
                            },
                        }}
                    >
                        {this.sortedCountries()}
                    </Select>
                </FormControl>
                <br />

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
                            onClick={this.resetSearch}
                            disableRipple
                            color="primary"
                            className="outlined-button"
                        >
                            Reset
                        </Button>
                        {this.state.isSpinning ? (
                            <CircularProgress
                                size={30}
                                className="margin-left-16"
                            />
                        ) : (
                            <Button
                                variant="contained"
                                size="small"
                                type="submit"
                                color="primary"
                                className="margin-left-16 blue-background"
                                style={{
                                    boxShadow: 'none',
                                }}
                            >
                                Search
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

function mapStateToProps({
    filterOptions: {
        contributors: {
            data: contributorOptions,
            fetching: fetchingContributorOptions,
        },
        contributorTypes: {
            data: contributorTypeOptions,
            fetching: fetchingContributorTypeOptions,
        },
        countries: {
            data: countryOptions,
            fetching: fetchingCountryOptions,
        },
    },
    filters: {
        facilityName,
        contributor,
        contributorType,
        country,
    }
}) {
    return {
        contributorOptions,
        fetchingContributorOptions,
        contributorTypeOptions,
        fetchingContributorTypeOptions,
        countryOptions,
        fetchingCountryOptions,
        facilityName,
        contributor,
        contributorType,
        country,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateFacilityName: e => dispatch(updateFacilityNameFilter(e)),
        updateContributor: e => dispatch(updateContributorFilter(e)),
        updateContributorType: e => dispatch(updateContributorTypeFilter(e)),
        updateCountry: e => dispatch(updateCountryFilter(e)),
    };
}
