import React, { Fragment } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import get from 'lodash/get';

import ControlledTextInput from './ControlledTextInput';

import {
    makeSidebarSearchTabActive,
    updateSidebarFacilitiesTabTextFilter,
} from '../actions/ui';

import { facilityCollectionPropType } from '../util/propTypes';

import {
    makeFacilityDetailLink,
    downloadFacilitiesCSV,
    getValueFromEvent,
    caseInsensitiveIncludes,
    sortFacilitiesAlphabeticallyByName,
} from '../util/util';

import COLOURS from '../util/COLOURS';

import { filterSidebarStyles } from '../util/styles';

const SEARCH_TERM_INPUT = 'SEARCH_TERM_INPUT';

const facilitiesTabStyles = Object.freeze({
    noResultsTextStyles: Object.freeze({
        margin: '30px',
    }),
    linkStyles: Object.freeze({
        display: 'flex',
        textDecoration: 'none',
    }),
    listItemStyles: Object.freeze({
        wordWrap: 'anywhere',
    }),
    listHeaderStyles: Object.freeze({
        backgroundColor: COLOURS.WHITE,
        padding: '0.25rem',
        maxHeight: '130px',
    }),
    listStyles: Object.freeze({
        /* overflowY: 'scroll',
        position: 'fixed',
        // sum heights of navbar, tab bar, panel header, and free text search control
        top: 'calc(64px + 48px + 130px + 110px)',
        bottom: '47px',
        width: '33%', */
    }),
    listBottomPaddingStyles: Object.freeze({
        height: '200px',
    }),
    titleRowStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 1rem',
    }),
    listHeaderTextSearchStyles: Object.freeze({
        padding: '6px 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
});

function FilterSidebarFacilitiesTab({
    fetching,
    data,
    error,
    returnToSearchTab,
    filterText,
    updateFilterText,
}) {
    if (fetching) {
        return (
            <div
                className="control-panel__content"
                style={filterSidebarStyles.controlPanelContentStyles}
            >
                <div className="control-panel__body">
                    <CircularProgress />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="control-panel__content"
                style={filterSidebarStyles.controlPanelContentStyles}
            >
                <div className="control-panel__body">
                    <Typography
                        variant="body1"
                        style={facilitiesTabStyles.noResultsTextStyles}
                        align="center"
                    >
                        An error prevented fetching facilities
                    </Typography>
                    <Typography
                        variant="body1"
                        style={facilitiesTabStyles.noResultsTextStyles}
                        align="center"
                    >
                        <Button
                            onClick={returnToSearchTab}
                            variant="outlined"
                            color="secondary"
                        >
                            Try another search
                        </Button>
                    </Typography>
                </div>
            </div>
        );
    }

    const facilities = get(data, 'features', []);

    if (!facilities.length) {
        return (
            <div
                className="control-panel__content"
                style={filterSidebarStyles.controlPanelContentStyles}
            >
                <div className="control-panel__body">
                    <Typography
                        variant="body1"
                        style={facilitiesTabStyles.noResultsTextStyles}
                        align="center"
                    >
                        No facilities to display
                    </Typography>
                    <Typography
                        variant="body1"
                        style={facilitiesTabStyles.noResultsTextStyles}
                        align="center"
                    >
                        <Button
                            onClick={returnToSearchTab}
                            variant="outlined"
                            color="secondary"
                        >
                            Search for facilities
                        </Button>
                    </Typography>
                </div>
            </div>
        );
    }

    const filteredFacilities = filterText
        ? facilities
            .filter(({
                properties: {
                    address,
                    name,
                    country_name: countryName,
                },
            }) => caseInsensitiveIncludes(address, filterText)
                || caseInsensitiveIncludes(name, filterText)
                || caseInsensitiveIncludes(countryName, filterText))
        : facilities;

    const orderedFacilities =
        sortFacilitiesAlphabeticallyByName(filteredFacilities);

    const listHeaderInsetComponent = (
        <div style={facilitiesTabStyles.listHeaderStyles}>
            <Typography
                variant="subheading"
                align="center"
            >
                <div
                    style={facilitiesTabStyles.titleRowStyles}
                >
                    {`Displaying ${filteredFacilities.length} facilities`}
                    <Button
                        variant="outlined"
                        color="primary"
                        styles={facilitiesTabStyles.listHeaderButtonStyles}
                        onClick={() => downloadFacilitiesCSV(orderedFacilities)}
                    >
                        Download CSV
                    </Button>
                </div>
            </Typography>
            <div style={facilitiesTabStyles.listHeaderTextSearchStyles}>
                <label
                    htmlFor={SEARCH_TERM_INPUT}
                >
                    Filter results
                </label>
                <ControlledTextInput
                    id={SEARCH_TERM_INPUT}
                    value={filterText}
                    onChange={updateFilterText}
                    placeholder="Filter by name, address, or country"
                />
            </div>
        </div>
    );

    return (
        <Fragment>
            {listHeaderInsetComponent}
            <div style={filterSidebarStyles.controlPanelContentStyles}>
                <List style={facilitiesTabStyles.listStyles}>
                    {
                        orderedFacilities
                            .map(({
                                properties: {
                                    address,
                                    name,
                                    country_name: countryName,
                                    oar_id: oarID,
                                },
                            }) => (
                                <Fragment key={oarID}>
                                    <Divider />
                                    <ListItem
                                        key={oarID}
                                        style={facilitiesTabStyles.listItemStyles}
                                    >
                                        <Link
                                            to={makeFacilityDetailLink(oarID)}
                                            href={makeFacilityDetailLink(oarID)}
                                            style={facilitiesTabStyles.linkStyles}
                                        >
                                            <ListItemText
                                                primary={`${name} - ${countryName}`}
                                                secondary={address}
                                            />
                                        </Link>
                                    </ListItem>
                                </Fragment>))
                    }
                </List>
            </div>
        </Fragment>
    );
}

FilterSidebarFacilitiesTab.defaultProps = {
    data: null,
    error: null,
};

FilterSidebarFacilitiesTab.propTypes = {
    data: facilityCollectionPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    returnToSearchTab: func.isRequired,
    filterText: string.isRequired,
    updateFilterText: func.isRequired,
};

function mapStateToProps({
    facilities: {
        facilities: {
            data,
            error,
            fetching,
        },
    },
    ui: {
        facilitiesSidebarTabSearch: {
            filterText,
        },
    },
}) {
    return {
        data,
        error,
        fetching,
        filterText,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        returnToSearchTab: () => dispatch(makeSidebarSearchTabActive()),
        updateFilterText: e =>
            dispatch((updateSidebarFacilitiesTabTextFilter(getValueFromEvent(e)))),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterSidebarFacilitiesTab);
