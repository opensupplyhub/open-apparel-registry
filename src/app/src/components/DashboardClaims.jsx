import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, string } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import DashboardClaimsListTable from './DashboardClaimsListTable';

import { fetchFacilityClaims, clearFacilityClaims } from '../actions/claimFacilityDashboard';

import { facilityClaimsListPropType } from '../util/propTypes';

function DashboardClaims({
    data,
    fetching,
    error,
    getClaims,
    clearClaims,
}) {
    useEffect(() => {
        getClaims();

        return clearClaims;
    }, [getClaims, clearClaims]);

    if (fetching) {
        return <CircularProgress />;
    }

    if (error) {
        return (
            <Typography>
                {error}
            </Typography>
        );
    }

    if (!data) {
        return null;
    }

    return <DashboardClaimsListTable data={data} />;
}

DashboardClaims.defaultProps = {
    data: null,
    error: null,
};

DashboardClaims.propTypes = {
    data: facilityClaimsListPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    getClaims: func.isRequired,
    clearClaims: func.isRequired,
};

function mapStateToProps({
    claimFacilityDashboard: {
        list: {
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

function mapDispatchToProps(dispatch) {
    return {
        getClaims: () => dispatch(fetchFacilityClaims()),
        clearClaims: () => dispatch(clearFacilityClaims()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardClaims);
