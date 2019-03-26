import React from 'react';
import { createPortal } from 'react-dom';
import { arrayOf, func, shape, string } from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LinkIcon from '@material-ui/icons/Link';
import ListItemText from '@material-ui/core/ListItemText';

import COLOURS from '../util/COLOURS';

const PopupStyles = Object.freeze({
    selectedListItemStyles: Object.freeze({
        backgroundColor: COLOURS.NAVY_BLUE,
        maxWidth: '500px',
    }),
    unselectedListItemStyles: Object.freeze({
        maxWidth: '500px',
    }),
    linkStyles: Object.freeze({
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        background: 'none',
        color: 'inherit',
        border: 'none',
        padding: '0',
        font: 'inherit',
        cursor: 'pointer',
        outline: 'inherit',
    }),
    unselectedLinkStyles: Object.freeze({
        textDecoration: 'none',
    }),
    selectedItemTextStyles: Object.freeze({
        color: COLOURS.WHITE,
    }),
    unselectedItemTextStyles: Object.freeze({
        display: 'flex',
    }),
    selectedPrimaryTextStyles: Object.freeze({
        color: COLOURS.WHITE,
        display: 'flex',
        alignSelf: 'flex-start',
    }),
    unselectedPrimaryTextStyles: Object.freeze({
        display: 'flex',
        alignSelf: 'flex-start',
    }),
    selectedSecondaryTextStyles: Object.freeze({
        color: COLOURS.WHITE,
        textAlign: 'left',
    }),
    unselectedSecondaryTextStyles: Object.freeze({
        textAlign: 'left',
    }),
});

export default function FacilitiesMapPopup({
    facilities,
    domNodeID,
    popupContentElementID,
    selectedFacilityID,
    selectFacilityOnClick,
}) {
    if (!facilities || !facilities.length || !domNodeID || !popupContentElementID) {
        return null;
    }

    const domElement = document.getElementById(domNodeID);

    if (!domElement) {
        return null;
    }

    return createPortal(
        (
            <div id={popupContentElementID} className="notranslate">
                <List subheader={<ListSubheader component="div">Multiple Facilities at Point</ListSubheader>}>
                    {
                        facilities
                            .map(({
                                properties: {
                                    address,
                                    name,
                                    oar_id: oarID,
                                },
                            }) => (
                                <ListItem
                                    className="popup-item display-flex notranslate"
                                    key={oarID}
                                    style={
                                        (oarID === selectedFacilityID)
                                            ? PopupStyles.selectedListItemStyles
                                            : PopupStyles.unselectedListItemStyles
                                    }
                                >
                                    <button
                                        type="button"
                                        onClick={() => selectFacilityOnClick(oarID)}
                                        style={PopupStyles.linkStyles}
                                    >
                                        <ListItemIcon
                                            style={
                                                (oarID === selectedFacilityID)
                                                    ? PopupStyles.selectedItemTextStyles
                                                    : PopupStyles.unselectedItemTextStyles
                                            }
                                        >
                                            <LinkIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={name}
                                            secondary={address}
                                            primaryTypographyProps={{
                                                style: (oarID === selectedFacilityID)
                                                    ? PopupStyles.selectedPrimaryTextStyles
                                                    : PopupStyles.unselectedPrimaryTextStyles,
                                            }}
                                            secondaryTypographyProps={{
                                                style: (oarID === selectedFacilityID)
                                                    ? PopupStyles.selectedSecondaryTextStyles
                                                    : PopupStyles.unselectedSecondaryTextStyles,
                                            }}
                                        />
                                    </button>
                                </ListItem>))
                    }
                </List>
            </div>
        ),
        domElement,
    );
}

FacilitiesMapPopup.defaultProps = {
    facilities: null,
    selectedFacilityID: null,
};

FacilitiesMapPopup.propTypes = {
    facilities: arrayOf(shape({
        properties: shape({
            address: string.isRequired,
            oar_id: string.isRequired,
        }).isRequired,
    })),
    domNodeID: string.isRequired,
    popupContentElementID: string.isRequired,
    selectedFacilityID: string,
    selectFacilityOnClick: func.isRequired,
};
