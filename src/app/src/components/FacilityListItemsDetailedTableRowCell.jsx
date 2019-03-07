import React, { Fragment } from 'react';
import { arrayOf, bool, func, number, oneOf, oneOfType, shape, string } from 'prop-types';
import Typography from '@material-ui/core/Typography';
import get from 'lodash/get';

import CellElement from './CellElement';

import { facilityMatchStatusChoicesEnum } from '../util/constants';

import { confirmRejectMatchRowStyles } from '../util/styles';

export default function FacilityListItemsDetailedTableRowCell({
    title,
    subtitle,
    stringIsHidden,
    data,
    hasActions,
    fetching,
    errorState,
    linkURLs,
}) {
    return (
        <div style={confirmRejectMatchRowStyles.cellStyles}>
            <div style={confirmRejectMatchRowStyles.cellTitleStyles}>
                {title}
            </div>
            <div style={confirmRejectMatchRowStyles.cellSubtitleStyles}>
                <Typography variant="body2">
                    {subtitle}
                </Typography>
            </div>
            {
                data.map((item, index) => (
                    <Fragment key={hasActions ? item.id : item}>
                        <CellElement
                            item={item}
                            fetching={fetching}
                            errorState={errorState}
                            hasActions={hasActions}
                            stringIsHidden={stringIsHidden}
                            linkURL={get(linkURLs, [`${index}`], null)}
                        />
                    </Fragment>))
            }
        </div>
    );
}

FacilityListItemsDetailedTableRowCell.defaultProps = {
    stringIsHidden: false,
    hasActions: false,
    fetching: false,
    subtitle: ' ',
    errorState: false,
    linkURLs: null,
};

FacilityListItemsDetailedTableRowCell.propTypes = {
    title: oneOfType([number, string]).isRequired,
    subtitle: string,
    stringIsHidden: bool,
    data: oneOfType([
        arrayOf(number.isRequired),
        arrayOf(string.isRequired),
        arrayOf(shape({
            id: number.isRequired,
            confirmMatch: func.isRequired,
            rejectMatch: func.isRequired,
            status: oneOf(Object.values(facilityMatchStatusChoicesEnum)).isRequired,
            matchName: string.isRequired,
            matchAddress: string.isRequired,
            itemName: string.isRequired,
            itemAddress: string.isRequired,
        })).isRequired,
    ]).isRequired,
    hasActions: bool,
    fetching: bool,
    errorState: bool,
    linkURLs: arrayOf(string),
};
