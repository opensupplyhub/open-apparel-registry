import React from 'react';
import { arrayOf, bool, number, string } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { pluralizeFacilitiesCount } from '../util/util.js';

const FacilitySidebarSearchTabFacilitiesCount = ({
    facilitiesCount,
    fetching,
    error,
}) => {
    if (!facilitiesCount || fetching || error) {
        return null;
    }

    return (
        <div style={{
            margin: 0,
            verticalAlign: 'center',
            marginRight: '5px',
            flex: 1,
        }}
        >
            <p style={{
                backgroundColor: 'rgb(199,209,250)',
                paddingLeft: '5px',
                paddingRight: '5px',
                alignText: 'center',
                color: 'rgb(9,24,143)',
                minWidth: '100px',
                overflow: 'none',
                margin: '10px 0 0 0',
            }}
            >
                {pluralizeFacilitiesCount(facilitiesCount)}
            </p>
        </div>
    );
};

FacilitySidebarSearchTabFacilitiesCount.defaultProps = {
    facilitiesCount: null,
    error: null,
};

FacilitySidebarSearchTabFacilitiesCount.propTypes = {
    facilitiesCount: number,
    fetching: bool.isRequired,
    error: arrayOf(string),
};

function mapStateToProps({
    facilities: {
        facilities: {
            data,
            error,
            fetching,
        },
    },
}) {
    return {
        error,
        fetching,
        facilitiesCount: get(data, 'count', null),
    };
}

export default connect(mapStateToProps)(
    FacilitySidebarSearchTabFacilitiesCount,
);
