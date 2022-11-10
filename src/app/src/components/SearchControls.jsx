import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { toggleZoomToSearch, showDrawFilter } from '../actions/ui';

import { updateBoundaryFilter } from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

import { facilitiesRoute, mainRoute } from '../util/constants';

const zoomStyles = theme =>
    Object.freeze({
        controlsStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            [theme.breakpoints.up('sm')]: {
                maxWidth: '235px',
                flexDirection: 'column',
                alignItems: 'flex-start',
            },
            [theme.breakpoints.up('md')]: {
                maxWidth: '320px',
                flexDirection: 'row',
                alignItems: 'center',
            },
        }),
        zoomStyle: Object.freeze({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }),
        areaStyle: Object.freeze({
            fontWeight: 400,
            borderRadius: 0,
            background: 'white',
            '&:hover': {
                background: 'white',
            },
        }),
        dividerStyle: {
            width: '0px',
            height: '32px',
            borderLeft: '1px solid rgba(0, 0, 0, 0.3)',
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
            [theme.breakpoints.up('md')]: {
                display: 'block',
            },
        },
    });

function SearchControls({
    zoomToSearch,
    boundary,
    toggleZoom,
    activateDrawFilter,
    clearDrawFilter,
    classes,
}) {
    const boundaryButton =
        boundary == null ? (
            <Button
                variant="text"
                onClick={activateDrawFilter}
                disableRipple
                fullWidth
                className={classes.areaStyle}
            >
                DRAW CUSTOM AREA
            </Button>
        ) : (
            <Button
                variant="text"
                onClick={clearDrawFilter}
                disableRipple
                color="secondary"
                fullWidth
                className={classes.areaStyle}
            >
                REMOVE CUSTOM AREA
            </Button>
        );

    const zoomControl = (
        <div id="zoom-search" className={classes.zoomStyle}>
            <Button
                variant="text"
                checked={zoomToSearch}
                onClick={() => toggleZoom(!zoomToSearch)}
                disableRipple
                fullWidth
                className={classes.areaStyle}
                style={
                    zoomToSearch
                        ? { backgroundColor: '#F0FAF2', fontWeight: 900 }
                        : {}
                }
            >
                Zoom to Search
            </Button>
        </div>
    );

    return (
        <Switch>
            <Route
                exact
                path={facilitiesRoute}
                render={() => (
                    <div className={classes.controlsStyle}>
                        {zoomControl}
                        <div className={classes.dividerStyle} />
                        <div>{boundaryButton}</div>
                    </div>
                )}
            />
            <Route
                exact
                path={mainRoute}
                render={() => (
                    <div className={classes.controlsStyle}>
                        <div>{boundaryButton}</div>
                    </div>
                )}
            />
        </Switch>
    );
}

function mapStateToProps({ ui: { zoomToSearch }, filters: { boundary } }) {
    return { zoomToSearch, boundary };
}

function mapDispatchToProps(dispatch) {
    return {
        toggleZoom: checked => dispatch(toggleZoomToSearch(checked)),
        activateDrawFilter: () => dispatch(showDrawFilter(true)),
        clearDrawFilter: () => {
            dispatch(showDrawFilter(false));
            dispatch(updateBoundaryFilter(null));
            return dispatch(fetchFacilities({}));
        },
    };
}

SearchControls.defaultProps = {
    zoomToSearch: true,
};

SearchControls.propTypes = {
    toggleZoom: PropTypes.func.isRequired,
    zoomToSearch: PropTypes.bool,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(zoomStyles)(SearchControls));
