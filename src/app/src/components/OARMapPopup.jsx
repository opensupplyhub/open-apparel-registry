import React from 'react';
import { createPortal } from 'react-dom';
import { arrayOf, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LinkIcon from '@material-ui/icons/Link';
import ListItemText from '@material-ui/core/ListItemText';

import { makeFacilityDetailLink } from '../util/util';
import COLOURS from '../util/COLOURS';

const OARMapPopupStyles = Object.freeze({
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
    }),
    unselectedLinkStyles: Object.freeze({
        textDecoration: 'none',
        display: 'flex',
    }),
    selectedItemTextStyles: Object.freeze({
        color: COLOURS.WHITE,
    }),
    unselectedItemTextStyles: Object.freeze({}),
});

export default function OARMapPopup({
    facilities,
    domNodeID,
    popupContentElementID,
    selectedFacilityID,
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
                                            ? OARMapPopupStyles.selectedListItemStyles
                                            : OARMapPopupStyles.unselectedListItemStyles
                                    }
                                >
                                    <Link
                                        to={makeFacilityDetailLink(oarID)}
                                        href={makeFacilityDetailLink(oarID)}
                                        style={OARMapPopupStyles.linkStyles}
                                    >
                                        <ListItemIcon
                                            style={
                                                (oarID === selectedFacilityID)
                                                    ? OARMapPopupStyles.selectedItemTextStyles
                                                    : OARMapPopupStyles.unselectedItemTextStyles
                                            }
                                        >
                                            <LinkIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={name}
                                            secondary={address}
                                            primaryTypographyProps={{
                                                style: (oarID === selectedFacilityID)
                                                    ? OARMapPopupStyles.selectedItemTextStyles
                                                    : OARMapPopupStyles.unselectedItemTextStyles,
                                            }}
                                            secondaryTypographyProps={{
                                                style: (oarID === selectedFacilityID)
                                                    ? OARMapPopupStyles.selectedItemTextStyles
                                                    : OARMapPopupStyles.unselectedItemTextStyles,
                                            }}
                                        />
                                    </Link>
                                </ListItem>))
                    }
                </List>
            </div>
        ),
        domElement,
    );
}

OARMapPopup.defaultProps = {
    facilities: null,
    selectedFacilityID: null,
};

OARMapPopup.propTypes = {
    facilities: arrayOf(shape({
        properties: shape({
            address: string.isRequired,
            oar_id: string.isRequired,
        }).isRequired,
    })),
    domNodeID: string.isRequired,
    popupContentElementID: string.isRequired,
    selectedFacilityID: string,
};
