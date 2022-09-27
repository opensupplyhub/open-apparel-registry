import React, { useEffect } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';

import {
    clearUpdateLocationFacility,
    fetchUpdateLocationFacility,
    updateUpdateLocationFacilityOSID,
    updateUpdateLocationLat,
    updateUpdateLocationLng,
    updateFacilityLocation,
    updateUpdateLocationNotes,
    updateUpdateLocationContributor,
    fetchDashboardUpdateLocationContributors,
} from '../actions/updateFacilityLocation';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import {
    facilityDetailsPropType,
    contributorOptionPropType,
} from '../util/propTypes';

import DashboardFacilityCard from './DashboardFacilityCard';
import DashboardUpdateFacilityLocationCard from './DashboardUpdateFacilityLocationCard';
import DashboardUpdateFacilityLocationControls from './DashboardUpdateFacilityLocationControls';

function DashboardUpdateFacilityLocation({
    targetOSID,
    targetData,
    targetFetching,
    targetError,
    clearTargetFacility,
    fetchTargetFacility,
    fetchTargetFacilityOnEnterKeyPress,
    updateTargetOSID,
    newLocation,
    notes,
    updateLat,
    updateLng,
    updateNotes,
    updatingLocation,
    errorUpdatingLocation,
    updateLocation,
    contributors,
    fetchContributors,
    contributor,
    updateContributor,
}) {
    useEffect(() => {
        // If contributors have not been initialized, fetch them
        if (!contributors.data.length && !contributors.fetching) {
            fetchContributors();
        }
    }, [contributors.data, contributors.fetching, fetchContributors]);

    const updateDisabled =
        targetFetching ||
        updatingLocation ||
        !targetData ||
        !newLocation.lat ||
        !newLocation.lng ||
        (targetData.geometry.coordinates[0] === parseFloat(newLocation.lng) &&
            targetData.geometry.coordinates[1] === parseFloat(newLocation.lat));

    return (
        <>
            <DashboardUpdateFacilityLocationControls
                handleUpdate={updateLocation}
                updating={updatingLocation}
                error={errorUpdatingLocation}
                disabled={updateDisabled}
                facility={targetData}
                newLocation={newLocation}
            />
            <div style={{ width: '100%', display: 'flex' }}>
                <DashboardFacilityCard
                    updateOSID={updateTargetOSID}
                    fetchFacility={fetchTargetFacility}
                    clearFacility={clearTargetFacility}
                    osID={targetOSID}
                    data={targetData}
                    fetching={targetFetching}
                    error={targetError}
                    handleEnterKeyPress={fetchTargetFacilityOnEnterKeyPress}
                    title="Facility"
                />
                <DashboardUpdateFacilityLocationCard
                    title="New Location"
                    fetching={updatingLocation}
                    facility={targetData}
                    newLocation={newLocation}
                    notes={notes}
                    updateLat={updateLat}
                    updateLng={updateLng}
                    updateNotes={updateNotes}
                    contributorOptions={contributors.data}
                    updateContributor={updateContributor}
                    contributor={contributor}
                />
            </div>
        </>
    );
}

DashboardUpdateFacilityLocation.defaultProps = {
    targetData: null,
    targetError: null,
    contributor: null,
};

DashboardUpdateFacilityLocation.propTypes = {
    targetOSID: string.isRequired,
    targetData: facilityDetailsPropType,
    targetFetching: bool.isRequired,
    targetError: arrayOf(string),
    clearTargetFacility: func.isRequired,
    fetchTargetFacility: func.isRequired,
    fetchTargetFacilityOnEnterKeyPress: func.isRequired,
    updateLat: func.isRequired,
    updateLng: func.isRequired,
    updateNotes: func.isRequired,
    fetchContributors: func.isRequired,
    contributor: contributorOptionPropType,
    updateContributor: func.isRequired,
};

function mapStateToProps({
    updateFacilityLocation: {
        osID: targetOSID,
        data: targetData,
        fetching: targetFetching,
        error: targetError,
        newLocation,
        notes,
        update: { fetching: updatingLocation, error: errorUpdatingLocation },
        contributors,
        contributor,
    },
}) {
    return {
        targetOSID,
        targetData,
        targetFetching,
        targetError,
        newLocation,
        notes,
        updatingLocation,
        errorUpdatingLocation,
        contributors,
        contributor,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        clearTargetFacility: () => dispatch(clearUpdateLocationFacility()),
        fetchTargetFacility: () => dispatch(fetchUpdateLocationFacility()),
        fetchTargetFacilityOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(fetchUpdateLocationFacility()),
        ),
        updateTargetOSID: e =>
            dispatch(updateUpdateLocationFacilityOSID(getValueFromEvent(e))),
        updateLat: e => dispatch(updateUpdateLocationLat(getValueFromEvent(e))),
        updateLng: e => dispatch(updateUpdateLocationLng(getValueFromEvent(e))),
        updateNotes: e =>
            dispatch(updateUpdateLocationNotes(getValueFromEvent(e))),
        updateLocation: () => dispatch(updateFacilityLocation()),
        fetchContributors: () =>
            dispatch(fetchDashboardUpdateLocationContributors()),
        updateContributor: c => dispatch(updateUpdateLocationContributor(c)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardUpdateFacilityLocation);
