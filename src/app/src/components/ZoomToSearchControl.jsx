import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { toggleZoomToSearch } from '../actions/ui';

const zoomStyles = Object.freeze({
    zoomStyle: Object.freeze({
        background: 'white',
        fontFamily: 'ff-tisa-sans-web-pro, sans-serif',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '3px',
        borderRadius: '2px',
        boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)',
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
            <label
                htmlFor="zoom-checkbox"
                style={zoomStyles.zoomLabelStyle}
            >
                <input
                    type="checkbox"
                    name="zoom-checkbox"
                    id="zoom-checkbox"
                    checked={zoomToSearch}
                    onChange={e => toggleZoom(e.target.checked)}
                />
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
