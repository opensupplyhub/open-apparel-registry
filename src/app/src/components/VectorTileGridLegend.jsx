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
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '5px',
        textAlign: 'center',
        textTransform: 'uppercase',
    }),
    ramp: {
        display: 'flex',
        margin: '6px 0',
        alignItems: 'center',
    },
    axisLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0 4px',
    },
    legendCellStyle: Object.freeze({
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        opacity: '0.8',
        background: 'red',
        padding: '5px',
        margin: '0 6px',
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
            <div style={legendStyles.mainLabel}># facilities</div>
            <div style={legendStyles.ramp}>
                {gridColorRamp.map((colorDef, i, a) =>
                    legendCell(colorDef[1], 20 - 2 * (a.length - 1 - i)),
                )}
            </div>
            <div style={legendStyles.axisLabels}>
                <span>Fewer</span>
                <span>More</span>
            </div>
        </div>
    );
}

export default withStyles(materialUIStyles)(VectorTileGridLegend);
