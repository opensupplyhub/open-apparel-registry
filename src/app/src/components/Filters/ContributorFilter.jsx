import React, { useState } from 'react';
import { func, string, bool } from 'prop-types';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InfoIcon from '@material-ui/icons/Info';

import ShowOnly from '../ShowOnly';
import StyledSelect from './StyledSelect';

import {
    contributorOptionsPropType,
    contributorListOptionsPropType,
} from '../../util/propTypes';

import {
    updateContributorFilter,
    updateListFilter,
    updateCombineContributorsFilterOption,
} from '../../actions/filters';

const styles = {
    popover: {
        fontSize: '15px',
        padding: '10px',
        lineHeight: '22px',
        maxWidth: '320px',
        margin: '0 14px',
    },
    popoverLineItem: {
        marginBottom: '6px',
    },
    popoverHeading: {
        fontWeight: 'bold',
    },
    icon: {
        color: 'rgba(0, 0, 0, 0.38)',
    },
};

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
}) {
    const [
        contributorPopoverAnchorEl,
        setContributorPopoverAnchorEl,
    ] = useState(null);

    const contributorInfoPopoverContent = (
        <div style={styles.popover}>
            <p style={styles.popoverHeading}>
                Do you want to see only facilities which these contributors
                share? If so, tick this box.
            </p>
            <p>
                There are now two ways to filter a Contributor search on the OS
                Hub:
            </p>
            <ol>
                <li style={styles.popoverLineItem}>
                    You can search for all the facilities of multiple
                    contributors. This means that the results would show all of
                    the facilities contributed to the OS Hub by, for example,
                    BRAC University or Clarks. Some facilities might have been
                    contributed by BRAC University but not by Clarks, or
                    vice-versa.
                </li>
                <li style={styles.popoverLineItem}>
                    By checking the “Show only shared facilities” box, this
                    adjusts the search logic to “AND”. This means that your
                    results will show only facilities contributed by BOTH BRAC
                    University AND Clarks (as well as potentially other
                    contributors). In this way, you can more quickly filter to
                    show the specific Contributor overlap you are interested in.
                </li>
            </ol>
        </div>
    );

    return (
        <div>
            <ShowOnly when={!embed}>
                <StyledSelect
                    label={
                        <div style={{ display: 'flex' }}>
                            <p>Contributor</p>
                            <ShowOnly
                                when={contributors && contributors.length > 1}
                            >
                                <IconButton
                                    onClick={
                                        // eslint-disable-next-line no-confusing-arrow
                                        e =>
                                            contributorPopoverAnchorEl
                                                ? null
                                                : setContributorPopoverAnchorEl(
                                                      e.currentTarget,
                                                  )
                                    }
                                >
                                    <InfoIcon />
                                </IconButton>
                            </ShowOnly>
                        </div>
                    }
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

                        <Popover
                            id="contributor-info-popover"
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'left',
                            }}
                            open={!!contributorPopoverAnchorEl}
                            anchorEl={contributorPopoverAnchorEl}
                            onClick={() => setContributorPopoverAnchorEl(null)}
                        >
                            {contributorInfoPopoverContent}
                        </Popover>
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
