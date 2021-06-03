import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { toggleZoomToSearch } from '../actions/ui';

const zoomStyles = theme =>
    Object.freeze({
        zoomStyle: Object.freeze({
            background: 'white',
            fontFamily: theme.typography.fontFamily,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '3px',
            borderRadius: '2px',
            boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)',
        }),
        zoomLabelStyle: Object.freeze({
            textTransform: 'uppercase',
            paddingLeft: '5px',
        }),
    });

function ZoomToSearchControl({ zoomToSearch, toggleZoom, classes }) {
    return (
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
    );
}

function mapStateToProps({ ui: { zoomToSearch } }) {
    return { zoomToSearch };
}

function mapDispatchToProps(dispatch) {
    return {
        toggleZoom: checked => dispatch(toggleZoomToSearch(checked)),
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
