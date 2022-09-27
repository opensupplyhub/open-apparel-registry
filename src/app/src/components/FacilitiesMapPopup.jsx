import React from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LinkIcon from '@material-ui/icons/Link';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';

import COLOURS from '../util/COLOURS';

const PopupStyles = Object.freeze({
    containerStyles: Object.freeze({
        padding: '0.5rem',
        width: '500px',
        fontSize: '15px',
    }),
    controlStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: '15px',
    }),
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
    selectedFacilityID,
    selectFacilityOnClick,
    closePopup,
}) {
    if (!facilities || !facilities.length) {
        return null;
    }

    return (
        <div className="notranslate" style={PopupStyles.containerStyles}>
            <div style={PopupStyles.controlStyles}>
                <Typography variant="body1">
                    Multiple Facilities At Point
                </Typography>
                <Button onClick={closePopup}>
                    <CloseIcon />
                </Button>
            </div>
            <List>
                {facilities.map(
                    ({ properties: { address, name, os_id: osID } }) => (
                        <ListItem
                            className="popup-item display-flex notranslate"
                            key={osID}
                            style={
                                osID === selectedFacilityID
                                    ? PopupStyles.selectedListItemStyles
                                    : PopupStyles.unselectedListItemStyles
                            }
                        >
                            <button
                                type="button"
                                onClick={() => selectFacilityOnClick(osID)}
                                style={PopupStyles.linkStyles}
                            >
                                <ListItemIcon
                                    style={
                                        osID === selectedFacilityID
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
                                        style:
                                            osID === selectedFacilityID
                                                ? PopupStyles.selectedPrimaryTextStyles
                                                : PopupStyles.unselectedPrimaryTextStyles,
                                    }}
                                    secondaryTypographyProps={{
                                        style:
                                            osID === selectedFacilityID
                                                ? PopupStyles.selectedSecondaryTextStyles
                                                : PopupStyles.unselectedSecondaryTextStyles,
                                    }}
                                />
                            </button>
                        </ListItem>
                    ),
                )}
            </List>
        </div>
    );
}

FacilitiesMapPopup.defaultProps = {
    facilities: null,
    selectedFacilityID: null,
};

FacilitiesMapPopup.propTypes = {
    facilities: arrayOf(
        shape({
            properties: shape({
                address: string.isRequired,
                os_id: string.isRequired,
            }).isRequired,
        }),
    ),
    selectedFacilityID: string,
    selectFacilityOnClick: func.isRequired,
    closePopup: func.isRequired,
};
