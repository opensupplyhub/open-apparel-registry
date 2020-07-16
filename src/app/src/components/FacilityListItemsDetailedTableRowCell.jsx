import React, { Fragment } from 'react';
import { arrayOf, bool, func, number, oneOf, oneOfType, shape, string } from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';

import CellElement from './CellElement';
import ShowOnly from './ShowOnly';

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
    readOnly,
    isRemoved,
    handleRemoveItem,
    removeButtonDisabled,
    removeButtonID,
}) {
    const statusSection = (() => {
        if (isRemoved) {
            return 'REMOVED';
        }

        if (!isFunction(handleRemoveItem)) {
            if (title.length > 50) {
                return (
                    <Tooltip
                        title={title}
                        placement="top-start"
                        classes={{ tooltip: 'cell-tooltip' }}
                        enterDelay={200}
                    >
                        <span style={confirmRejectMatchRowStyles.cellOverflowStyles}>
                            {title}
                        </span>
                    </Tooltip>
                );
            }
            return title;
        }

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <span style={{ marginRight: '5px' }}>
                    {title}
                </span>
                <Button
                    color="primary"
                    onClick={handleRemoveItem}
                    disabled={removeButtonDisabled}
                    style={{ marginLeft: '5px', marginRight: '5px' }}
                    id={removeButtonID}
                >
                    Remove
                </Button>
            </div>
        );
    })();

    return (
        <div style={confirmRejectMatchRowStyles.cellStyles}>
            <div style={confirmRejectMatchRowStyles.cellTitleStyles}>
                {statusSection}
            </div>
            <ShowOnly when={!readOnly}>
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
            </ShowOnly>
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
    readOnly: false,
    isRemoved: false,
    handleRemoveItem: null,
    removeButtonDisabled: true,
    removeButtonID: null,
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
    readOnly: bool,
    isRemoved: bool,
    handleRemoveItem: func,
    removeButtonDisabled: bool,
    removeButtonID: string,
};
