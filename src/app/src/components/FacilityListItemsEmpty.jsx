import React, { memo } from 'react';

const facilityListItemsEmptyStyles = Object.freeze({
    containerStyle: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
    }),
    linkStyle: Object.freeze({
        marginTop: '30px',
        width: '90px',
    }),
});

const FacilityListItemsEmpty = memo(() => (
    <div
        className="margin-top-16"
        style={facilityListItemsEmptyStyles.containerStyle}
    >
        <p>
            No items were found for this list.
        </p>
    </div>
));

export default FacilityListItemsEmpty;
