import React from 'react';

import COLOURS from '../util/COLOURS';

import { maxVectorTileFacilitiesGridZoom } from '../util/constants.facilitiesMap';

const legendStyles = Object.freeze({
    legendStyle: Object.freeze({
        background: 'white',
        border: `1px solid ${COLOURS.NAVY_BLUE}`,
        fontFamily: 'ff-tisa-sans-web-pro, sans-serif',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
    }),
    legendLabelStyle: Object.freeze({
        padding: '5px',
        textTransform: 'uppercase',
    }),
    legendCellStyle: Object.freeze({
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        opacity: '0.8',
        background: 'red',
        padding: '5px',
        margin: '3px',
    }),
});

export default function VectorTileGridLegend({
    currentZoomLevel,
    gridColorRamp,
}) {
    if (
        !currentZoomLevel ||
        currentZoomLevel > maxVectorTileFacilitiesGridZoom
    ) {
        return null;
    }

    const legendCell = (background, size) => {
        const style = Object.assign({}, legendStyles.legendCellStyle, {
            background,
            width: `${size}px`,
            height: `${size}px`,
        });

        return <div key={background} style={style} />;
    };

    return (
        <div id="map-legend" style={legendStyles.legendStyle}>
            <span style={legendStyles.legendLabelStyle}>Fewer facilities</span>
            {gridColorRamp.map((colorDef, i, a) =>
                legendCell(colorDef[1], 20 - 2 * (a.length - 1 - i)))}
            <span style={legendStyles.legendLabelStyle}>More facilities</span>
        </div>
    );
}
