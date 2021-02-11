import React from 'react';
import moment from 'moment';

import ShowOnly from './ShowOnly';

const styles = {
    list: {
        marginBottom: '12px',
    },
};

const formatDate = date => moment(date).format('MMM. D, YYYY');

function FacilityDetailStatusList({ activityReports }) {
    return (
        <ShowOnly when={!!activityReports.length}>
            <div className="control-panel__group">
                <h1 className="control-panel__heading">
                    Status
                </h1>
                <div className="control-panel__body">
                    {activityReports.map((report) => {
                        const {
                            closure_state: closureState,
                            reported_by_contributor: user,
                            created_at: created,
                            status_change_date: statusChangeDate,
                            status,
                        } = report;
                        const state = closureState.toLowerCase();
                        return (
                            <ul key={report.id} style={styles.list}>
                                <li>Reported {state} by {user} on {formatDate(created)}</li>
                                {status === 'CONFIRMED' && (
                                    <li>
                                        Verified as {state} on {formatDate(statusChangeDate)}
                                    </li>
                                )}
                            </ul>
                        );
                    })}
                </div>
            </div>
        </ShowOnly>
    );
}

export default FacilityDetailStatusList;
