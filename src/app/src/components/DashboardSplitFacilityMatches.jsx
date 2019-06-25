import React, { useEffect } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';

import {
    clearFacilityToSplit,
    updateFacilityToSplitOARID,
    fetchFacilityToSplit,
    resetSplitFacilityState,
    splitFacilityMatch,
} from '../actions/splitFacilityMatches';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import { facilityDetailsPropType } from '../util/propTypes';

import DashboardFacilityCard from './DashboardFacilityCard';
import DashboardSplitMatchCard from './DashboardSplitMatchCard';

function DashboardSplitFacilityMatches({
    oarID,
    data,
    fetching,
    error,
    updateOARID,
    clearFacility,
    fetchFacility,
    fetchFacilityOnEnterKeyPress,
    resetSplitState,
    splitMatch,
    splitData,
    splitting,
    errorSplitting,
}) {
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => resetSplitState, []);
    /* eslint-disable react-books/exhaustive-deps */

    return (
        <div style={{ width: '100%', display: 'flex' }}>
            <DashboardFacilityCard
                updateOARID={updateOARID}
                fetchFacility={fetchFacility}
                clearFacility={clearFacility}
                oarID={oarID}
                data={data}
                fetching={fetching}
                error={error}
                handleEnterKeyPress={fetchFacilityOnEnterKeyPress}
                title="Facility to split"
            />
            {data && (
                <DashboardSplitMatchCard
                    data={data}
                    splitData={splitData}
                    splitting={splitting}
                    errorSplitting={errorSplitting}
                    splitMatch={splitMatch}
                />
            )}
        </div>
    );
}

DashboardSplitFacilityMatches.defaultProps = {
    data: null,
    error: null,
    errorSplitting: null,
};

DashboardSplitFacilityMatches.propTypes = {
    oarID: string.isRequired,
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    splitData: arrayOf(shape({
        matchID: number.isRequired,
        newOARID: number.isRequired,
    })).isRequired,
    splitting: bool.isRequired,
    errorSplitting: arrayOf(string),
    updateOARID: func.isRequired,
    clearFacility: func.isRequired,
    fetchFacility: func.isRequired,
    fetchFacilityOnEnterKeyPress: func.isRequired,
    resetSplitState: func.isRequired,
    splitMatch: func.isRequired,
};

function mapStateToProps({
    splitFacilityMatches: {
        facility: { oarID, data, fetching, error },
        splitFacilities: {
            data: splitData,
            fetching: splitting,
            error: errorSplitting,
        },
    },
}) {
    return {
        oarID,
        data,
        fetching,
        error,
        splitData,
        splitting,
        errorSplitting,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateOARID: e =>
            dispatch(updateFacilityToSplitOARID(getValueFromEvent(e))),
        clearFacility: () => dispatch(clearFacilityToSplit()),
        fetchFacility: () => dispatch(fetchFacilityToSplit()),
        fetchFacilityOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(fetchFacilityToSplit()),
        ),
        resetSplitState: () => dispatch(resetSplitFacilityState()),
        splitMatch: matchID => dispatch(splitFacilityMatch(matchID)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardSplitFacilityMatches);
