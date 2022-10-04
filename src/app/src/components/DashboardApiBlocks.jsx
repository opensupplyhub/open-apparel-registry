import React, { useEffect, useState } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import ReactSelect from 'react-select';
import { connect } from 'react-redux';

import uniqWith from 'lodash/uniqWith';
import moment from 'moment';

import DashboardApiBlocksTable from './DashboardApiBlocksTable';

import { fetchDashboardApiBlocks } from '../actions/dashboardApiBlocks';

import { apiBlockPropType } from '../util/propTypes';

import { makeApiBlockDetailLink } from '../util/util';

const CONTRIBUTORS = 'CONTRIBUTORS';

const styles = {
    filterRow: {
        padding: '20px',
        display: 'flex',
    },
    filterContributors: {
        flex: 1,
    },
};

const currentDate = moment();
const ALL_CONTRIBUTORS = { value: '', label: 'All Organizations' };

function DashboardApiBlocks({
    dashboardApiBlocks: { apiBlocks },
    fetchApiBlocks,
    push,
}) {
    const [contributor, setContributor] = useState(ALL_CONTRIBUTORS);

    useEffect(() => {
        fetchApiBlocks();
    }, [fetchApiBlocks]);

    const contributors = [
        ...uniqWith(
            apiBlocks.data,
            (a, b) => a.contributor === b.contributor,
        ).map(block => ({
            value: block.contributor,
            label: block.contributor,
        })),
        ALL_CONTRIBUTORS,
    ];

    const sortedApiBlocks = apiBlocks.data.sort(
        (a, b) =>
            new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf(),
    );

    const contributorApiBlocks =
        contributor.value.length > 0
            ? sortedApiBlocks.filter(
                  block => contributor.value === block.contributor,
              )
            : sortedApiBlocks;

    const filteredApiBlocks = sortedApiBlocks.filter(
        block => block.active && moment(block.until).isSameOrAfter(currentDate),
    );

    const onClickRow = block => push(makeApiBlockDetailLink(block.id));

    return (
        <div>
            <DashboardApiBlocksTable
                apiBlocks={filteredApiBlocks}
                onClickRow={onClickRow}
                isClickable
                title="Active API Blocks"
            />
            <DashboardApiBlocksTable
                title="All API Blocks"
                apiBlocks={contributorApiBlocks}
                renderAdditionalContent={() => (
                    <div style={styles.filterRow}>
                        <div style={styles.filterContributors}>
                            <ReactSelect
                                id={CONTRIBUTORS}
                                name={CONTRIBUTORS}
                                classNamePrefix="select"
                                options={contributors}
                                placeholder="Select an organization..."
                                value={contributor}
                                onChange={c => setContributor(c)}
                                disabled={apiBlocks.fetching}
                                styles={{
                                    control: provided => ({
                                        ...provided,
                                        height: '56px',
                                    }),
                                }}
                                theme={theme => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary: '#00319D',
                                    },
                                })}
                            />
                        </div>
                    </div>
                )}
            />
        </div>
    );
}

DashboardApiBlocks.propTypes = {
    dashboardApiBlocks: shape({
        apiBlocks: shape({
            data: arrayOf(apiBlockPropType).isRequired,
            fetching: bool.isRequired,
            error: string,
        }).isRequired,
    }).isRequired,
    fetchApiBlocks: func.isRequired,
};

function mapStateToProps({ dashboardApiBlocks }, { history: { push } }) {
    return { dashboardApiBlocks, push };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchApiBlocks: () => dispatch(fetchDashboardApiBlocks()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApiBlocks);
