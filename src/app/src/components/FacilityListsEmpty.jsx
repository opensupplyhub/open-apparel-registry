import React, { memo } from 'react';
import { Link } from 'react-router-dom';

import { contributeRoute } from '../util/constants';

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
            You currently have no lists to view. Please contribute a list of
            factories to the OS Hub first.
        </label>
        <Link
            id={contributeRouteLink}
            to={contributeRoute}
            href={contributeRoute}
            style={facilityListsEmptyStyles.linkStyle}
            className="outlined-button outlined-button--link"
        >
            Contribute
        </Link>
    </div>
));

export default FacilityListsEmpty;
