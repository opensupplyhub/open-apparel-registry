import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import COLOURS from '../util/COLOURS';

import { toggleZoomToSearch } from '../actions/ui';

const zoomStyles = Object.freeze({
    zoomStyle: Object.freeze({
        background: 'white',
        border: `1px solid ${COLOURS.NAVY_BLUE}`,
        fontFamily: 'ff-tisa-sans-web-pro, sans-serif',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
    }),
    zoomLabelStyle: Object.freeze({
        padding: '5px',
        textTransform: 'uppercase',
    }),
});

function ZoomToSearchControl({
    zoomToSearch,
    toggleZoom,
}) {
    return (
        <div id="zoom-search" style={zoomStyles.zoomStyle}>
            <input
                type="checkbox"
                name="zoom-checkbox"
                checked={zoomToSearch}
                onChange={e => toggleZoom(e.target.checked)}
            />
            <label
                htmlFor="zoom-checkbox"
                style={zoomStyles.zoomLabelStyle}
            >
                    Zoom to Search
            </label>
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

export default connect(mapStateToProps, mapDispatchToProps)(ZoomToSearchControl);
