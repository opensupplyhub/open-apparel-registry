import React, { Component } from 'react';
import { arrayOf, bool, number, string } from 'prop-types';
import { connect } from 'react-redux';

import { fetchFacilityCount } from '../actions/facilityCount';

class FacilitySidebarSearchTabFacilitiesCount extends Component {
    componentDidMount() {
        return this.props.fetchCount();
    }

    render() {
        const {
            data,
            fetching,
            error,
        } = this.props;

        if (!data || fetching || error) {
            return null;
        }

        return (
            <div style={{ textAlign: 'right' }}>
                {`Total facilities: ${data}`}
            </div>
        );
    }
}

FacilitySidebarSearchTabFacilitiesCount.defaultProps = {
    data: null,
    error: null,
};

FacilitySidebarSearchTabFacilitiesCount.propTypes = {
    data: number,
    fetching: bool.isRequired,
    error: arrayOf(string),
};

function mapStateToProps({
    facilityCount: {
        data,
        fetching,
        error,
    },
}) {
    return {
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchCount: () => dispatch(fetchFacilityCount()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    FacilitySidebarSearchTabFacilitiesCount,
);
