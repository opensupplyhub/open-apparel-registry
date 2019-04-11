import React from 'react';
import Typography from '@material-ui/core/Typography';

const mapErrorMessageStyles = Object.freeze({
    errorMessageContainerStyles: Object.freeze({
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }),
});

export default function FacilitiesMapErrorMessage() {
    return (
        <div style={mapErrorMessageStyles.errorMessageContainerStyles}>
            <Typography variant="title">
                An error prevented loading the map.
            </Typography>
        </div>
    );
}
