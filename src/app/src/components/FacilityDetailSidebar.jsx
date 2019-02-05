import React, { Component } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
    fetchSingleFacility,
    resetSingleFacility,
} from '../actions/facilities';

import { facilityPropType } from '../util/propTypes';

class FacilityDetailSidebar extends Component {
    componentDidMount() {
        return this.props.fetchFacility();
    }

    componentDidUpdate({
        match: {
            params: {
                oarID: prevOARID,
            },
        },
    }) {
        const {
            match: {
                params: {
                    oarID,
                },
            },
        } = this.props;

        return oarID !== prevOARID
            ? this.props.fetchFacility()
            : null;
    }

    componentWillUnmount() {
        return this.props.clearFacility();
    }

    render() {
        const {
            fetching,
            data,
            error,
            match: {
                params: {
                    oarID,
                },
            },
        } = this.props;

        if (fetching) {
            return (
                <div className="control-panel">
                    <CircularProgress />
                </div>
            );
        }

        if (error && error.length) {
            return (
                <div className="control-panel">
                    <ul>
                        {
                            error
                                .map(err => (
                                    <li
                                        key={err}
                                        style={{ color: 'red' }}
                                    >
                                        {err}
                                    </li>))
                        }
                    </ul>
                </div>
            );
        }

        if (!data) {
            return (
                <div className="control-panel">
                    {`No facility found for OAR ID ${oarID}`}
                </div>
            );
        }

        return (
            <div className="control-panel">
                {JSON.stringify(data)}
            </div>
        );
    }
}

FacilityDetailSidebar.defaultProps = {
    data: null,
    error: null,
};

FacilityDetailSidebar.propTypes = {
    data: facilityPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    match: shape({
        params: shape({
            oarID: string.isRequired,
        }).isRequired,
    }).isRequired,
    fetchFacility: func.isRequired,
    clearFacility: func.isRequired,
};

function mapStateToProps({
    facilities: {
        singleFacility: {
            data,
            fetching,
            error,
        },
    },
}) {
    return {
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch, {
    match: {
        params: {
            oarID,
        },
    },
}) {
    return {
        fetchFacility: () => dispatch(fetchSingleFacility(oarID)),
        clearFacility: () => dispatch(resetSingleFacility()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityDetailSidebar);
