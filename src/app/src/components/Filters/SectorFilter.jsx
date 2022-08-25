import React from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';

import StyledSelect from './StyledSelect';

import { updateSectorFilter } from '../../actions/filters';
import { fetchSectorOptions } from '../../actions/filterOptions';

import { sectorOptionsPropType } from '../../util/propTypes';

const SECTORS = 'SECTORS';

function SectorFilter({
    sectorOptions,
    sectors,
    updateSector,
    fetchSectors,
    fetchingSectors,
    fetchingOptions,
}) {
    return (
        <div className="form__field">
            <StyledSelect
                name={SECTORS}
                label="Sector"
                options={sectorOptions || []}
                value={sectors}
                onChange={updateSector}
                onFocus={() =>
                    !sectorOptions && !fetchingSectors && fetchSectors()
                }
                noOptionsMessage={() =>
                    fetchingSectors ? 'Loading..' : 'No options'
                }
                disabled={fetchingOptions || fetchingSectors}
            />
        </div>
    );
}

SectorFilter.defaultProps = {
    sectorOptions: null,
};

SectorFilter.propTypes = {
    sectorOptions: sectorOptionsPropType,
    updateSector: func.isRequired,
    fetchSectors: func.isRequired,
    sectors: sectorOptionsPropType.isRequired,
    fetchingSectors: bool.isRequired,
    fetchingOptions: bool.isRequired,
};

function mapStateToProps({
    filterOptions: {
        sectors: { data: sectorOptions, fetching: fetchingSectors },
        contributors: { fetching: fetchingContributors },
        countries: { fetching: fetchingCountries },
    },
    filters: { sectors },
}) {
    return {
        sectorOptions,
        sectors,
        fetchingSectors,
        fetchingOptions: fetchingCountries || fetchingContributors,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateSector: v => dispatch(updateSectorFilter(v)),
        fetchSectors: () => dispatch(fetchSectorOptions()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SectorFilter);
