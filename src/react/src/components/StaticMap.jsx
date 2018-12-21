import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const MAP_COLOR = process.env.REACT_APP_MAP_COLOR;

export default class StaticMap extends PureComponent {
    componentDidMount() {
        const ctx = this.canvas.getContext('2d');
        this.img.onload = () => {
            ctx.drawImage(this.img, 0, 0, 320, 180);
            ctx.beginPath();
            ctx.arc(160, 90, 10, 0, 2 * Math.PI, false);
            ctx.lineWidth = 2;
            ctx.fillStyle = MAP_COLOR;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        };
    }

    render() {
        const { lat, lon } = this.props;
        const maplink = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lon},${lat},14,0,0/320x180@2x?access_token=${
            process.env.REACT_APP_MAPBOX_TOKEN
        }`;

        return (
            <div className="no-lineheight">
                <canvas
                    ref={(c) => {
                        this.canvas = c;
                    }}
                    width={320}
                    height={180}
                    style={{ width: '100%' }}
                />
                <img
                    ref={(c) => {
                        this.img = c;
                    }}
                    style={{ display: 'none' }}
                    alt="static-map"
                    src={maplink}
                />
                <div className="stripe" style={{ background: MAP_COLOR }} />
            </div>
        );
    }
}

StaticMap.propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
};
