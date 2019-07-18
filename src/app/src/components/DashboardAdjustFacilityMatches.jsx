import React, { useEffect } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { connect } from 'react-redux';

import {
    clearFacilityToAdjust,
    updateFacilityToAdjustOARID,
    fetchFacilityToAdjust,
    resetAdjustFacilityState,
    splitFacilityMatch,
    promoteFacilityMatch,
} from '../actions/adjustFacilityMatches';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import { facilityDetailsPropType } from '../util/propTypes';

import DashboardFacilityCard from './DashboardFacilityCard';
import DashboardAdjustMatchCard from './DashboardAdjustMatchCard';

function DashboardAdjustFacilityMatches({
    oarID,
    data,
    fetching,
    error,
    updateOARID,
    clearFacility,
    fetchFacility,
    fetchFacilityOnEnterKeyPress,
    resetAdjustState,
    splitMatch,
    promoteMatch,
    adjustData,
    adjusting,
    errorAdjusting,
}) {
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => resetAdjustState, []);
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
                title="Facility to adjust"
            />
            {data && (
                <DashboardAdjustMatchCard
                    data={data}
                    adjustData={adjustData}
                    adjusting={adjusting}
                    errorAdjusting={errorAdjusting}
                    splitMatch={splitMatch}
                    promoteMatch={promoteMatch}
                />
            )}
        </div>
    );
}

DashboardAdjustFacilityMatches.defaultProps = {
    data: null,
    error: null,
    errorAdjusting: null,
};

DashboardAdjustFacilityMatches.propTypes = {
    oarID: string.isRequired,
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    adjustData: arrayOf(shape({
        match_id: number.isRequired,
        new_oar_id: string.isRequired,
    })).isRequired,
    adjusting: bool.isRequired,
    errorAdjusting: arrayOf(string),
    updateOARID: func.isRequired,
    clearFacility: func.isRequired,
    fetchFacility: func.isRequired,
    fetchFacilityOnEnterKeyPress: func.isRequired,
    resetAdjustState: func.isRequired,
    splitMatch: func.isRequired,
    promoteMatch: func.isRequired,
};

function mapStateToProps({
    adjustFacilityMatches: {
        facility: { oarID, data, fetching, error },
        adjustFacilities: {
            data: adjustData,
            fetching: adjusting,
            error: errorAdjusting,
        },
    },
}) {
    return {
        oarID,
        data,
        fetching,
        error,
        adjustData,
        adjusting,
        errorAdjusting,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateOARID: e =>
            dispatch(updateFacilityToAdjustOARID(getValueFromEvent(e))),
        clearFacility: () => dispatch(clearFacilityToAdjust()),
        fetchFacility: () => dispatch(fetchFacilityToAdjust()),
        fetchFacilityOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(fetchFacilityToAdjust()),
        ),
        resetAdjustState: () => dispatch(resetAdjustFacilityState()),
        splitMatch: matchID => dispatch(splitFacilityMatch(matchID)),
        promoteMatch: matchID => dispatch(promoteFacilityMatch(matchID)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardAdjustFacilityMatches);
