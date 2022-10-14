import React, { memo } from 'react';

const contributeRouteLink = 'contributeRouteLink';

const facilityListsEmptyStyles = Object.freeze({
    containerStyle: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
    }),
    linkStyle: Object.freeze({
        marginTop: '30px',
        width: '90px',
    }),
});

const FacilityListsEmpty = memo(() => (
    <div
        className="margin-top-16"
        style={facilityListsEmptyStyles.containerStyle}
    >
        <label htmlFor={contributeRouteLink}>
            You currently have no lists to view.
        </label>
    </div>
));

export default FacilityListsEmpty;
