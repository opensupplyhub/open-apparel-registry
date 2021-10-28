import React, { useState } from 'react';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Popover from '@material-ui/core/Popover';
import ReactSelect from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';

import ShowOnly from './ShowOnly';
import FeatureFlag from './FeatureFlag';

import {
    updateFacilityFreeTextQueryFilter,
    updateContributorFilter,
    updateListFilter,
    updateContributorTypeFilter,
    updateCountryFilter,
    updateCombineContributorsFilterOption,
    updateBoundaryFilter,
    updatePPEFilter,
    resetAllFilters,
} from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

import { recordSearchTabResetButtonClick, showDrawFilter } from '../actions/ui';

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

const filterSidebarSearchTabStyles = theme =>
    Object.freeze({
        formStyle: Object.freeze({
            width: '100%',
            marginBottom: '32px',
        }),
        inputLabelStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            fontSize: '16px',
            fontWeight: 500,
            color: '#000',
            transform: 'translate(0, -8px) scale(1)',
            paddingBottom: '0.5rem',
        }),
        selectStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
        }),
        font: Object.freeze({
            fontFamily: `${theme.typography.fontFamily} !important`,
        }),
        ...filterSidebarStyles,
    });

const FACILITIES = 'FACILITIES';
const CONTRIBUTORS = 'CONTRIBUTORS';
const CONTRIBUTOR_TYPES = 'CONTRIBUTOR_TYPES';
const LISTS = 'LISTS';
const COUNTRIES = 'COUNTRIES';

function FilterSidebarSearchTab({
    contributorOptions,
    listOptions,
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
    combineContributors,
    updateCombineContributors,
    fetchingFacilities,
    searchForFacilities,
    facilities,
    fetchingOptions,
    submitFormOnEnterKeyPress,
    vectorTileFlagIsActive,
    activateDrawFilter,
    clearDrawFilter,
    boundary,
    ppe,
    updatePPE,
    embed,
    fetchingLists,
    updateList,
    lists,
    classes,
}) {
    const [
        contributorPopoverAnchorEl,
        setContributorPopoverAnchorEl,
    ] = useState(null);
    const [ppePopoverAnchorEl, setPpePopoverAnchorEl] = useState(null);

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
    };

    const contributorInfoPopoverContent = (
        <div style={styles.popover}>
            <p style={styles.popoverHeading}>
                Do you want to see only facilities which these contributors
                share? If so, tick this box.
            </p>
            <p>
                There are now two ways to filter a Contributor search on the
                OAR:
            </p>
            <ol>
                <li style={styles.popoverLineItem}>
                    You can search for all the facilities of multiple
                    contributors. This means that the results would show all of
                    the facilities contributed to the OAR by, for example, BRAC
                    University or Clarks. Some facilities might have been
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

    const ppeInfoPopoverContent = (
        <div style={styles.popover}>
            <p>
                Personal protective equipment (PPE) includes masks, gloves,
                gowns, visors and other equipment.
            </p>
        </div>
    );

    const boundaryButton =
        boundary == null ? (
            <Button
                variant="outlined"
                onClick={activateDrawFilter}
                disableRipple
                color="primary"
                fullWidth
            >
                DRAW AREA
            </Button>
        ) : (
            <Button
                variant="outlined"
                onClick={clearDrawFilter}
                disableRipple
                color="primary"
                fullWidth
            >
                REMOVE AREA
            </Button>
        );

    return (
        <div
            className={`control-panel__content ${classes.controlPanelContentStyles}`}
        >
            <div style={{ marginBottom: '60px' }}>
                <div className="form__field" style={{ marginBottom: '10px' }}>
                    <InputLabel htmlFor={FACILITIES} className="form__label">
                        <FeatureFlag
                            flag="ppe"
                            alternative="Search a Facility Name or OAR ID"
                        >
                            Search a Facility Name, OAR ID, or PPE Product Type
                        </FeatureFlag>
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
                <FeatureFlag flag="ppe">
                    <div
                        className="form__field"
                        style={{ marginBottom: '16px' }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!ppe}
                                    onChange={updatePPE}
                                    color="primary"
                                    value={ppe}
                                />
                            }
                            label="Show only PPE facilities"
                            style={{ marginRight: '8px' }}
                        />
                        <IconButton
                            onClick={
                                // eslint-disable-next-line no-confusing-arrow
                                e =>
                                    ppePopoverAnchorEl
                                        ? null
                                        : setPpePopoverAnchorEl(e.currentTarget)
                            }
                            style={{ padding: '4px', color: 'rgba(0,0,0,0.3)' }}
                        >
                            <InfoIcon />
                        </IconButton>
                        <Popover
                            id="ppe-info-popover"
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'left',
                            }}
                            open={!!ppePopoverAnchorEl}
                            anchorEl={ppePopoverAnchorEl}
                            onClick={() => setPpePopoverAnchorEl(null)}
                        >
                            {ppeInfoPopoverContent}
                        </Popover>
                    </div>
                </FeatureFlag>
                <div className="form__field">
                    <ShowOnly when={!embed}>
                        <InputLabel
                            shrink={false}
                            htmlFor={CONTRIBUTORS}
                            className={classes.inputLabelStyle}
                        >
                            Filter by Contributor
                        </InputLabel>
                        <ReactSelect
                            isMulti
                            id={CONTRIBUTORS}
                            name={CONTRIBUTORS}
                            className={`basic-multi-select notranslate ${classes.selectStyle}`}
                            classNamePrefix="select"
                            options={contributorOptions}
                            value={contributors}
                            onChange={updateContributor}
                            disabled={fetchingOptions || fetchingFacilities}
                        />
                        <ShowOnly
                            when={contributors && contributors.length > 1}
                        >
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
                                    onClick={() =>
                                        setContributorPopoverAnchorEl(null)
                                    }
                                >
                                    {contributorInfoPopoverContent}
                                </Popover>
                            </div>
                        </ShowOnly>
                    </ShowOnly>
                    <ShowOnly
                        when={
                            contributors &&
                            !!contributors.length &&
                            !fetchingLists
                        }
                    >
                        <div
                            style={{
                                marginLeft: embed ? 0 : '16px',
                                marginTop: '12px',
                            }}
                        >
                            <InputLabel
                                shrink={false}
                                htmlFor={LISTS}
                                className={classes.inputLabelStyle}
                            >
                                Filter by Contributor List
                            </InputLabel>
                            <ReactSelect
                                isMulti
                                id={LISTS}
                                name={LISTS}
                                className={`basic-multi-select notranslate ${classes.selectStyle}`}
                                classNamePrefix="select"
                                options={listOptions}
                                value={lists}
                                onChange={updateList}
                                disabled={fetchingLists || fetchingFacilities}
                            />
                        </div>
                    </ShowOnly>
                </div>
                <div className="form__field">
                    <ShowOnly when={!embed}>
                        <InputLabel
                            shrink={false}
                            htmlFor={CONTRIBUTOR_TYPES}
                            className={classes.inputLabelStyle}
                        >
                            Filter by Contributor Type
                        </InputLabel>
                        <ReactSelect
                            isMulti
                            id={CONTRIBUTOR_TYPES}
                            name="contributorTypes"
                            className={`basic-multi-select notranslate ${classes.selectStyle}`}
                            classNamePrefix="select"
                            options={contributorTypeOptions}
                            value={contributorTypes}
                            onChange={updateContributorType}
                            disabled={fetchingOptions || fetchingFacilities}
                        />
                    </ShowOnly>
                </div>
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={COUNTRIES}
                        className={classes.inputLabelStyle}
                    >
                        Filter by Country Name
                    </InputLabel>
                    <ReactSelect
                        isMulti
                        id={COUNTRIES}
                        name={COUNTRIES}
                        className={`basic-multi-select ${classes.selectStyle}`}
                        classNamePrefix="select"
                        options={countryOptions}
                        value={countries}
                        onChange={updateCountry}
                        disabled={fetchingOptions || fetchingFacilities}
                    />
                </div>
                <div className="form__field">
                    <InputLabel
                        shrink={false}
                        htmlFor={CONTRIBUTORS}
                        className={classes.inputLabelStyle}
                    >
                        Filter by Area
                    </InputLabel>
                    {boundaryButton}
                </div>
                <div className="form__action">
                    {!embed ? (
                        <a
                            className="control-link inherit-font"
                            href="mailto:info@openapparel.org?subject=Reporting an issue"
                        >
                            Report an issue
                        </a>
                    ) : null}
                    <div className="offset offset-right" style={{ flex: 1 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => resetFilters(embed)}
                            disableRipple
                            className={classes.font}
                            color="primary"
                            disabled={fetchingOptions}
                        >
                            Reset
                        </Button>
                        {fetchingFacilities ? (
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
                                className={`margin-left-16 ${classes.font}`}
                                style={{
                                    boxShadow: 'none',
                                }}
                                onClick={() =>
                                    searchForFacilities(vectorTileFlagIsActive)
                                }
                                disabled={fetchingOptions}
                            >
                                Search
                            </Button>
                        )}
                    </div>
                </div>
                {noFacilitiesFoundMessage}
            </div>
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
    updatePPE: func.isRequired,
    updateCombineContributors: func.isRequired,
    facilityFreeTextQuery: string.isRequired,
    contributors: contributorOptionsPropType.isRequired,
    contributorTypes: contributorTypeOptionsPropType.isRequired,
    countries: countryOptionsPropType.isRequired,
    combineContributors: string.isRequired,
    ppe: string.isRequired,
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
        lists: { data: listOptions, fetching: fetchingLists },
        contributorTypes: {
            data: contributorTypeOptions,
            fetching: fetchingContributorTypes,
        },
        countries: { data: countryOptions, fetching: fetchingCountries },
    },
    filters: {
        facilityFreeTextQuery,
        contributors,
        lists,
        contributorTypes,
        countries,
        combineContributors,
        boundary,
        ppe,
    },
    facilities: {
        facilities: { data: facilities, fetching: fetchingFacilities },
    },
    featureFlags,
    embeddedMap: { embed },
}) {
    const vectorTileFlagIsActive = get(
        featureFlags,
        'flags.vector_tile',
        false,
    );

    return {
        vectorTileFlagIsActive,
        contributorOptions,
        listOptions,
        contributorTypeOptions,
        countryOptions,
        facilityFreeTextQuery,
        contributors,
        lists,
        contributorTypes,
        countries,
        combineContributors,
        fetchingFacilities,
        facilities,
        boundary,
        ppe,
        fetchingOptions:
            fetchingContributors ||
            fetchingContributorTypes ||
            fetchingCountries,
        embed: !!embed,
        fetchingLists,
    };
}

function mapDispatchToProps(dispatch, { history: { push } }) {
    return {
        updateFacilityFreeTextQuery: e =>
            dispatch(updateFacilityFreeTextQueryFilter(getValueFromEvent(e))),
        updateContributor: v => {
            if (!v || v.length < 2) {
                dispatch(updateCombineContributorsFilterOption(''));
            }
            dispatch(updateContributorFilter(v));
        },
        updateContributorType: v => dispatch(updateContributorTypeFilter(v)),
        updateList: v => dispatch(updateListFilter(v)),
        updateCountry: v => dispatch(updateCountryFilter(v)),
        updatePPE: e =>
            dispatch(updatePPEFilter(e.target.checked ? 'true' : '')),
        updateCombineContributors: e =>
            dispatch(
                updateCombineContributorsFilterOption(
                    e.target.checked ? 'AND' : '',
                ),
            ),
        resetFilters: embedded => {
            dispatch(recordSearchTabResetButtonClick());
            return dispatch(resetAllFilters(embedded));
        },
        searchForFacilities: vectorTilesAreActive =>
            dispatch(
                fetchFacilities({
                    pageSize: vectorTilesAreActive
                        ? FACILITIES_REQUEST_PAGE_SIZE
                        : 50,
                    pushNewRoute: push,
                }),
            ),
        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(() =>
            dispatch(fetchFacilities(push)),
        ),
        activateDrawFilter: () => dispatch(showDrawFilter(true)),
        clearDrawFilter: () => {
            dispatch(showDrawFilter(false));
            dispatch(updateBoundaryFilter(null));
            return dispatch(fetchFacilities({}));
        },
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterSidebarSearchTabStyles)(FilterSidebarSearchTab));
