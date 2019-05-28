import React, { useEffect } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';

import AppGrid from '../components/AppGrid';
import AppOverflow from '../components/AppOverflow';
import ClaimFacilityHeader from '../components/ClaimFacilityHeader';
import ClaimFacilityStepper from '../components/ClaimFacilityStepper';

import {
    fetchClaimFacilityData,
    clearClaimFacilityDataAndForm,
} from '../actions/claimFacility';

import { facilityDetailsPropType } from '../util/propTypes';

const claimFacilityContainerStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    }),
    paperStyles: Object.freeze({
        width: '80%',
    }),
});

function ClaimFacility({
    data,
    fetching,
    error,
    getFacilityData,
    clearClaimData,
}) {
    useEffect(() => {
        getFacilityData();

        return clearClaimData;
    }, [getFacilityData, clearClaimData]);

    if (fetching) {
        return <CircularProgress />;
    }

    if (error) {
        return (
            <div>An error prevented fetching details about that facility.</div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <AppOverflow>
            <AppGrid title="Claim this facility">
                <div style={claimFacilityContainerStyles.containerStyles}>
                    <Paper style={claimFacilityContainerStyles.paperStyles}>
                        <ClaimFacilityHeader data={data} />
                        <ClaimFacilityStepper />
                    </Paper>
                </div>
            </AppGrid>
        </AppOverflow>
    );
}

ClaimFacility.defaultProps = {
    data: null,
    error: null,
};

ClaimFacility.propTypes = {
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    getFacilityData: func.isRequired,
    clearClaimData: func.isRequired,
};

function mapStateToProps({
    claimFacility: {
        facilityData: { data, fetching, error },
    },
}) {
    return {
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { oarID },
        },
    },
) {
    return {
        getFacilityData: () => dispatch(fetchClaimFacilityData(oarID)),
        clearClaimData: () => dispatch(clearClaimFacilityDataAndForm()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimFacility);
