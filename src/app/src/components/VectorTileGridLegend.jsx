import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import COLOURS from '../util/COLOURS';

import { maxVectorTileFacilitiesGridZoom } from '../util/constants.facilitiesMap';

const materialUIStyles = theme =>
    Object.freeze({
        legendStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
        }),
    });

const legendStyles = Object.freeze({
    legendStyle: Object.freeze({
        background: 'white',
        border: `1px solid ${COLOURS.NAVY_BLUE}`,
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

function VectorTileGridLegend({ currentZoomLevel, gridColorRamp, classes }) {
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
        <div
            id="map-legend"
            style={legendStyles.legendStyle}
            className={classes.legendStyle}
        >
            <span style={legendStyles.legendLabelStyle}>Fewer facilities</span>
            {gridColorRamp.map((colorDef, i, a) =>
                legendCell(colorDef[1], 20 - 2 * (a.length - 1 - i)),
            )}
            <span style={legendStyles.legendLabelStyle}>More facilities</span>
        </div>
    );
}

export default withStyles(materialUIStyles)(VectorTileGridLegend);
