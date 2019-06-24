import React, { useEffect } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';

import {
    clearFacilityToDelete,
    updateFacilityToDeleteOARID,
    fetchFacilityToDelete,
    resetDeleteFacilityState,
    deleteFacility,
} from '../actions/deleteFacility';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import { facilityDetailsPropType } from '../util/propTypes';

import DashboardFacilityCard from './DashboardFacilityCard';
import DashboardDeleteFacilityControls from './DashboardDeleteFacilityControls';

function DashboardDeleteFacility({
    oarID,
    data,
    fetching,
    error,
    updateOARID,
    fetchFacility,
    clearFacility,
    resetDeleteState,
    fetchFacilityOnEnterKeyPress,
    deleteSelectedFacility,
    deletingFacility,
    errorDeletingFacility,
}) {
    // call `resetDeleteState` when component unmounts
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => resetDeleteState, []);
    /* eslint-disable react-hooks/exhaustive-deps */

    return (
        <>
            <DashboardDeleteFacilityControls
                handleDelete={deleteSelectedFacility}
                deleting={deletingFacility}
                error={errorDeletingFacility}
                disabled={fetching || !data}
                data={data}
            />
            <div style={{ width: '100%' }}>
                <DashboardFacilityCard
                    updateOARID={updateOARID}
                    fetchFacility={fetchFacility}
                    clearFacility={clearFacility}
                    oarID={oarID}
                    data={data}
                    fetching={fetching}
                    error={error}
                    handleEnterKeyPress={fetchFacilityOnEnterKeyPress}
                    title="Facility to delete"
                />
            </div>
        </>
    );
}

DashboardDeleteFacility.defaultProps = {
    data: null,
    error: null,
    errorDeletingFacility: null,
};

DashboardDeleteFacility.propTypes = {
    oarID: string.isRequired,
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    updateOARID: func.isRequired,
    fetchFacility: func.isRequired,
    clearFacility: func.isRequired,
    resetDeleteState: func.isRequired,
    fetchFacilityOnEnterKeyPress: func.isRequired,
    deleteSelectedFacility: func.isRequired,
    deletingFacility: bool.isRequired,
    errorDeletingFacility: arrayOf(string),
};

function mapStateToProps({
    deleteFacility: {
        facility: {
            oarID,
            data,
            fetching,
            error,
        },
        delete: {
            fetching: deletingFacility,
            error: errorDeletingFacility,
        },
    },
}) {
    return {
        oarID,
        data,
        fetching,
        error,
        deletingFacility,
        errorDeletingFacility,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateOARID: e => dispatch(updateFacilityToDeleteOARID(getValueFromEvent(e))),
        clearFacility: () => dispatch(clearFacilityToDelete()),
        fetchFacility: () => dispatch(fetchFacilityToDelete()),
        resetDeleteState: () => dispatch(resetDeleteFacilityState()),
        fetchFacilityOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(fetchFacilityToDelete()),
        ),
        deleteSelectedFacility: () => dispatch(deleteFacility()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardDeleteFacility);
