import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link, Switch, Route } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import AppGrid from './AppGrid';
import FacilityListItemsEmpty from './FacilityListItemsEmpty';
import FacilityListItemsTable from './FacilityListItemsTable';

import {
    fetchFacilityListItems,
    resetFacilityListItems,
} from '../actions/facilityListDetails';

import {
    listsRoute,
    facilityListItemsRoute,
} from '../util/constants';

import { facilityListPropType } from '../util/propTypes';

const facilityListItemsStyles = Object.freeze({
    headerStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        marginTop: '60px',
        alignContent: 'center',
        alignItems: 'center',
    }),
    tableStyles: Object.freeze({
        minWidth: '85%',
        width: '90%',
    }),
    tableTitleStyles: Object.freeze({
        fontFamily: 'Roboto',
        fontWeight: 'normal',
        fontSize: '32px',
    }),
    descriptionStyles: Object.freeze({
        marginBottm: '30px',
    }),
});

class FacilityListItems extends Component {
    componentDidMount() {
        return this.props.fetchListItems();
    }

    componentWillUnmount() {
        return this.props.clearListItems();
    }

    render() {
        const {
            data,
            fetching,
            error,
        } = this.props;

        if (fetching) {
            return (
                <AppGrid title="">
                    <CircularProgress />
                </AppGrid>
            );
        }

        if (error && error.length) {
            return (
                <AppGrid title="Unable to retrieve that list">
                    <ul>
                        {
                            error
                                .map(err => (
                                    <li key={err}>
                                        {err}
                                    </li>))
                        }
                    </ul>
                </AppGrid>
            );
        }

        if (!data) {
            return (
                <AppGrid title="No list was found for that ID">
                    <div />
                </AppGrid>
            );
        }

        return (
            <Grid
                container
                justify="center"
            >
                <Grid
                    item
                    style={facilityListItemsStyles.tableStyles}
                >
                    <div style={facilityListItemsStyles.headerStyles}>
                        <h2 style={facilityListItemsStyles.titleStyles}>
                            {data.name || data.id}
                        </h2>
                        <Typography
                            variant="subheading"
                            style={facilityListItemsStyles.descriptionStyles}
                        >
                            {data.description || ''}
                        </Typography>
                        <Link
                            to={listsRoute}
                            href={listsRoute}
                        >
                            Back to lists
                        </Link>
                    </div>
                    {
                        data.items.length
                            ? (
                                <Switch>
                                    <Route
                                        path={facilityListItemsRoute}
                                        component={FacilityListItemsTable}
                                    />
                                </Switch>)
                            : <FacilityListItemsEmpty />
                    }
                </Grid>
            </Grid>
        );
    }
}

FacilityListItems.defaultProps = {
    data: null,
    error: null,
};

FacilityListItems.propTypes = {
    data: facilityListPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    fetchListItems: func.isRequired,
    clearListItems: func.isRequired,
};

function mapStateToProps({
    facilityListDetails: {
        data,
        fetching,
        error,
    },
}) {
    return {
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch, {
    match: {
        params: {
            listID,
        },
    },
}) {
    return {
        fetchListItems: () => dispatch(fetchFacilityListItems(listID)),
        clearListItems: () => dispatch(resetFacilityListItems()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityListItems);
