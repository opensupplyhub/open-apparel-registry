import React, { Fragment, Component } from 'react';
import { func, number, shape } from 'prop-types';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import noop from 'lodash/noop';
import mapboxgl from 'mapbox-gl';

import Button from './Button';

import { setOARMapViewport } from '../actions/oarMap';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const OARMapStyles = Object.freeze({
    copySearchButtonStyle: Object.freeze({
        position: 'absolute',
        right: '84px',
        top: '84px',
        fontSize: '12px',
    }),
});

const moveEvent = 'move';

class OARMap extends Component {
    constructor(props) {
        super(props);
        this.mapContainer = React.createRef();
    }

    componentDidMount() {
        const {
            viewport: {
                lat,
                lng,
                zoom,
            },
        } = this.props;

        this.map = new mapboxgl.Map({
            container: this.mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v9',
            attributionControl: false,
            logoPosition: 'bottom-right',
            zoom,
            center: [
                lng,
                lat,
            ],
        });

        this.map.addControl(new mapboxgl.AttributionControl({
            compact: true,
        }));

        this.map.addControl(
            new mapboxgl.NavigationControl(),
            'top-right',
        );

        this.map.on(moveEvent, this.handleMapMove);
    }

    componentWillUnmount() {
        this.map.off(moveEvent, this.handleMapMove);
    }

    handleMapMove = () => {
        const { lng, lat } = this.map.getCenter();
        const zoom = this.map.getZoom();

        const updatedViewport = Object.freeze({
            lat,
            lng,
            zoom,
        });

        return this.props.updateViewport(updatedViewport);
    };

    render() {
        return (
            <Fragment>
                <div
                    ref={this.mapContainer}
                    id="map"
                />
                <CopyToClipboard
                    text={window.location.href}
                    onCopy={() => toast('Copied search to clipboard')}
                >
                    <Button
                        text="Share This Search"
                        onClick={noop}
                        style={OARMapStyles.copySearchButtonStyle}
                    />
                </CopyToClipboard>
            </Fragment>
        );
    }
}

OARMap.propTypes = {
    updateViewport: func.isRequired,
    viewport: shape({
        lat: number.isRequired,
        lng: number.isRequired,
        zoom: number.isRequired,
    }).isRequired,
};

function mapStateToProps({
    oarMap: {
        viewport,
    },
}) {
    return {
        viewport,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateViewport: v => dispatch(setOARMapViewport(v)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OARMap);
