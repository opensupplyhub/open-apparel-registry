import React, { useEffect } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';

import {
    clearMergeTargetFacility,
    updateMergeTargetFacilityOARID,
    fetchMergeTargetFacility,
    clearFacilityToMerge,
    updateFacilityToMergeOARID,
    fetchFacilityToMerge,
    resetMergeFacilitiesState,
    mergeFacilities,
    flipFacilitiesToMerge,
} from '../actions/mergeFacilities';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import { facilityDetailsPropType } from '../util/propTypes';

import DashboardFacilityCard from './DashboardFacilityCard';
import DashboardMergeFacilityControls from './DashboardMergeFacilityControls';

function DashboardMergeFacilities({
    targetOARID,
    targetData,
    targetFetching,
    targetError,
    toMergeOARID,
    toMergeData,
    toMergeFetching,
    toMergeError,
    updateTargetOARID,
    clearTargetFacility,
    fetchTargetFacility,
    fetchTargetFacilityOnEnterKeyPress,
    updateToMergeOARID,
    clearToMergeFacility,
    fetchToMergeFacility,
    fetchToMergeFacilityOnEnterKeyPress,
    resetMergeState,
    mergeSelectedFacilities,
    merging,
    errorMerging,
    flipSelectedFacilities,
}) {
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => resetMergeState, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    return (
        <>
            <DashboardMergeFacilityControls
                handleMerge={mergeSelectedFacilities}
                handleFlip={flipSelectedFacilities}
                merging={merging}
                error={errorMerging}
                disabled={
                    targetFetching || toMergeFetching || !targetData || !toMergeData
                }
                toMergeData={toMergeData}
                targetData={targetData}
            />
            <div style={{ width: '100%', display: 'flex' }}>
                <DashboardFacilityCard
                    updateOARID={updateTargetOARID}
                    fetchFacility={fetchTargetFacility}
                    clearFacility={clearTargetFacility}
                    oarID={targetOARID}
                    data={targetData}
                    fetching={targetFetching}
                    error={targetError}
                    handleEnterKeyPress={fetchTargetFacilityOnEnterKeyPress}
                    title="Target facility for merge"
                />
                <DashboardFacilityCard
                    updateOARID={updateToMergeOARID}
                    fetchFacility={fetchToMergeFacility}
                    clearFacility={clearToMergeFacility}
                    oarID={toMergeOARID}
                    data={toMergeData}
                    fetching={toMergeFetching}
                    error={toMergeError}
                    handleEnterKeyPress={fetchToMergeFacilityOnEnterKeyPress}
                    title="Facility to merge into target"
                />
            </div>
        </>
    );
}

DashboardMergeFacilities.defaultProps = {
    targetData: null,
    targetError: null,
    toMergeData: null,
    toMergeError: null,
    errorMerging: null,
};

DashboardMergeFacilities.propTypes = {
    targetOARID: string.isRequired,
    targetData: facilityDetailsPropType,
    targetFetching: bool.isRequired,
    targetError: arrayOf(string),
    toMergeOARID: string.isRequired,
    toMergeData: facilityDetailsPropType,
    toMergeFetching: bool.isRequired,
    toMergeError: arrayOf(string),
    updateTargetOARID: func.isRequired,
    clearTargetFacility: func.isRequired,
    fetchTargetFacility: func.isRequired,
    fetchTargetFacilityOnEnterKeyPress: func.isRequired,
    updateToMergeOARID: func.isRequired,
    clearToMergeFacility: func.isRequired,
    fetchToMergeFacility: func.isRequired,
    fetchToMergeFacilityOnEnterKeyPress: func.isRequired,
    resetMergeState: func.isRequired,
    mergeSelectedFacilities: func.isRequired,
    merging: bool.isRequired,
    errorMerging: arrayOf(string),
    flipSelectedFacilities: func.isRequired,
};

function mapStateToProps({
    mergeFacilities: {
        targetFacility: {
            oarID: targetOARID,
            data: targetData,
            fetching: targetFetching,
            error: targetError,
        },
        facilityToMerge: {
            oarID: toMergeOARID,
            data: toMergeData,
            fetching: toMergeFetching,
            error: toMergeError,
        },
        merge: {
            fetching: merging,
            error: errorMerging,
        },
    },
}) {
    return {
        targetOARID,
        targetData,
        targetFetching,
        targetError,
        toMergeOARID,
        toMergeData,
        toMergeFetching,
        toMergeError,
        merging,
        errorMerging,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateTargetOARID: e => dispatch(updateMergeTargetFacilityOARID(getValueFromEvent(e))),
        clearTargetFacility: () => dispatch(clearMergeTargetFacility()),
        fetchTargetFacility: () => dispatch(fetchMergeTargetFacility()),
        fetchTargetFacilityOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(fetchMergeTargetFacility()),
        ),
        updateToMergeOARID: e => dispatch(updateFacilityToMergeOARID(getValueFromEvent(e))),
        clearToMergeFacility: () => dispatch(clearFacilityToMerge()),
        fetchToMergeFacility: () => dispatch(fetchFacilityToMerge()),
        fetchToMergeFacilityOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(fetchFacilityToMerge()),
        ),
        resetMergeState: () => dispatch(resetMergeFacilitiesState()),
        mergeSelectedFacilities: () => dispatch(mergeFacilities()),
        flipSelectedFacilities: () => dispatch(flipFacilitiesToMerge()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardMergeFacilities);
