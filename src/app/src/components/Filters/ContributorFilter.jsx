import React from 'react';
import { func, string, bool } from 'prop-types';
import { connect } from 'react-redux';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import ShowOnly from '../ShowOnly';
import StyledSelect from './StyledSelect';
import ContributorTooltip from './ContributorTooltip';

import {
    contributorOptionsPropType,
    contributorListOptionsPropType,
} from '../../util/propTypes';

import {
    updateContributorFilter,
    updateListFilter,
    updateCombineContributorsFilterOption,
} from '../../actions/filters';

const CONTRIBUTORS = 'CONTRIBUTORS';
const LISTS = 'LISTS';

function ContributorFilter({
    embed,
    contributorOptions,
    contributors,
    updateContributor,
    fetchingOptions,
    fetchingFacilities,
    fetchingLists,
    updateCombineContributors,
    combineContributors,
    listOptions,
    lists,
    updateList,
    contributorListBottomMargin,
}) {
    return (
        <div className="form__field">
            <ShowOnly when={!embed}>
                <StyledSelect
                    label="Data Contributor"
                    renderIcon={() => (
                        <ShowOnly
                            when={contributors && contributors.length > 1}
                        >
                            <ContributorTooltip />
                        </ShowOnly>
                    )}
                    name={CONTRIBUTORS}
                    options={contributorOptions || []}
                    value={contributors}
                    onChange={updateContributor}
                    disabled={fetchingOptions || fetchingFacilities}
                />
                <ShowOnly when={contributors && contributors.length > 1}>
                    <div style={{ marginLeft: '16px' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!combineContributors}
                                    onChange={updateCombineContributors}
                                    color="primary"
                                    value={combineContributors}
                                />
                            }
                            label="Show only shared facilities"
                        />
                    </div>
                </ShowOnly>
            </ShowOnly>
            <ShowOnly
                when={contributors && !!contributors.length && !fetchingLists}
            >
                <div
                    style={{
                        marginLeft: embed ? 0 : '16px',
                        marginTop: '12px',
                        marginBottom: contributorListBottomMargin
                            ? '24px'
                            : undefined,
                    }}
                >
                    <StyledSelect
                        label="Contributor List"
                        name={LISTS}
                        options={listOptions || []}
                        value={lists}
                        onChange={updateList}
                        disabled={fetchingLists || fetchingFacilities}
                    />
                </div>
            </ShowOnly>
        </div>
    );
}

ContributorFilter.defaultProps = {
    contributorOptions: null,
    listOptions: null,
    contributorListBottomMargin: false,
};

ContributorFilter.propTypes = {
    contributorOptions: contributorOptionsPropType,
    listOptions: contributorListOptionsPropType,
    updateContributor: func.isRequired,
    updateCombineContributors: func.isRequired,
    contributors: contributorOptionsPropType.isRequired,
    combineContributors: string.isRequired,
    fetchingFacilities: bool.isRequired,
    fetchingOptions: bool.isRequired,
    fetchingLists: bool.isRequired,
    contributorListBottomMargin: bool,
};

function mapStateToProps({
    filterOptions: {
        contributors: {
            data: contributorOptions,
            fetching: fetchingContributors,
        },
        lists: { data: listOptions, fetching: fetchingLists },
        countries: { fetching: fetchingCountries },
    },
    filters: { contributors, lists, combineContributors },
    facilities: {
        facilities: { fetching: fetchingFacilities },
    },
    embeddedMap: { embed },
}) {
    return {
        contributorOptions,
        listOptions,
        contributors,
        combineContributors,
        fetchingFacilities,
        fetchingOptions: fetchingContributors || fetchingCountries,
        fetchingLists,
        lists,
        embed,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateContributor: v => {
            if (!v || v.length < 2) {
                dispatch(updateCombineContributorsFilterOption(''));
            }
            dispatch(updateContributorFilter(v));
        },
        updateList: v => dispatch(updateListFilter(v)),
        updateCombineContributors: e =>
            dispatch(
                updateCombineContributorsFilterOption(
                    e.target.checked ? 'AND' : '',
                ),
            ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ContributorFilter);
