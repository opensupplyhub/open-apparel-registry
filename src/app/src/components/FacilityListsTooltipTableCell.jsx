import React, { useState } from 'react';
import { node } from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';

const facilityListTooltipTableCellStyles = Object.freeze({
    titleStyles: Object.freeze({
        fontSize: '20px',
        padding: '6px',
        lineHeight: '24px',
    }),
});

export default function FacilityListsTooltipTableCell({
    tooltipTitle,
    tableCellText,
}) {
    const [tooltipIsOpen, toggleTooltipIsOpen] = useState(false);

    const openTooltip = () => toggleTooltipIsOpen(true);
    const closeTooltip = () => toggleTooltipIsOpen(false);

    const title = (
        <div style={facilityListTooltipTableCellStyles.titleStyles}>
            {tooltipTitle}
        </div>
    );

    return (
        <Tooltip title={title} open={tooltipIsOpen}>
            <TableCell
                padding="dense"
                onMouseEnter={openTooltip}
                onMouseLeave={closeTooltip}
            >
                {tableCellText}
            </TableCell>
        </Tooltip>
    );
}

FacilityListsTooltipTableCell.propTypes = {
    tooltipTitle: node.isRequired,
    tableCellText: node.isRequired,
};
