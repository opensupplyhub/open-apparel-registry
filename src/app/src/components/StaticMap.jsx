import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
    CIRCLE_COLOR,
    CIRCLE_TEXT_COLOR,
    MAPBOX_TOKEN,
} from '../util/constants.oarmap';

const staticMapStyles = Object.freeze({
    canvasStyle: Object.freeze({
        width: '100%',
    }),
    imgStyle: Object.freeze({
        display: 'none',
    }),
    stripeStyle: Object.freeze({
        background: CIRCLE_COLOR,
    }),
});

const createMapLink = ({ lng, lat }) =>
    `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},14,0,0/320x180@2x?access_token=${MAPBOX_TOKEN}`;


export default class StaticMap extends PureComponent {
    constructor(props) {
        super(props);
        this.imgRef = React.createRef();
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        const ctx = this.canvasRef.current.getContext('2d');
        this.imgRef.current.onload = () => {
            ctx.drawImage(this.imgRef.current, 0, 0, 320, 180);
            ctx.beginPath();
            ctx.arc(160, 90, 10, 0, 2 * Math.PI, false);
            ctx.lineWidth = 2;
            ctx.fillStyle = CIRCLE_COLOR;
            ctx.fill();
            ctx.strokeStyle = CIRCLE_TEXT_COLOR;
            ctx.lineWidth = 2;
            ctx.stroke();
        };
    }

    render() {
        const {
            lat,
            lng,
        } = this.props;

        return (
            <div className="no-lineheight">
                <canvas
                    ref={this.canvasRef}
                    width={320}
                    height={180}
                    style={staticMapStyles.canvasStyle}
                />
                <img
                    ref={this.imgRef}
                    style={staticMapStyles.imgStyle}
                    alt="static-map"
                    src={createMapLink({ lat, lng })}
                />
                <div className="stripe" style={staticMapStyles.stripeStyle} />
            </div>
        );
    }
}

StaticMap.propTypes = {
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
};
