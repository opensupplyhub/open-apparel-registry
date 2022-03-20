import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';

import { toggleZoomToSearch, showDrawFilter } from '../actions/ui';

import { updateBoundaryFilter } from '../actions/filters';

import { fetchFacilities } from '../actions/facilities';

const zoomStyles = theme =>
    Object.freeze({
        controlsStyle: Object.freeze({
            background: 'white',
            fontFamily: theme.typography.fontFamily,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '3px',
            borderRadius: '2px',
            boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)',
        }),
        zoomStyle: Object.freeze({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }),
        zoomLabelStyle: Object.freeze({
            textTransform: 'uppercase',
            paddingLeft: '5px',
        }),
        areaStyle: Object.freeze({
            fontWeight: 400,
        }),
        dividerStyle: {
            width: '0px',
            height: '32px',
            borderLeft: '1px solid rgba(0, 0, 0, 0.3)',
        },
    });

function ZoomToSearchControl({
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
                color="black"
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
                color="black"
                fullWidth
                className={classes.areaStyle}
            >
                REMOVE CUSTOM AREA
            </Button>
        );
    return (
        <div className={classes.controlsStyle}>
            <div id="zoom-search" className={classes.zoomStyle}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={zoomToSearch}
                            onChange={e => toggleZoom(e.target.checked)}
                            value="zoom-checkbox"
                            color="primary"
                        />
                    }
                    className={classes.zoomLabelStyle}
                    label="Zoom to Search"
                />
            </div>
            <div className={classes.dividerStyle} />
            <div>{boundaryButton}</div>
        </div>
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

ZoomToSearchControl.defaultProps = {
    zoomToSearch: true,
};

ZoomToSearchControl.propTypes = {
    toggleZoom: PropTypes.func.isRequired,
    zoomToSearch: PropTypes.bool,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(zoomStyles)(ZoomToSearchControl));
