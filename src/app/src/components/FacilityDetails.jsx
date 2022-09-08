import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBackIos';
import get from 'lodash/get';

import FacilityDetailsContent from './FacilityDetailsContent';

import { resetSingleFacility, fetchFacilities } from '../actions/facilities';
import withQueryStringSync from '../util/withQueryStringSync';
import {
    facilitiesRoute,
    FACILITIES_REQUEST_PAGE_SIZE,
} from '../util/constants';

const facilityDetailsStyles = theme => ({
    container: {
        backgroundColor: '#F9F7F7',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 0,
        [theme.breakpoints.up('md')]: {
            paddingLeft: '4.5rem',
            paddingRight: '4.5rem',
        },
    },
    buttonContainer: {
        height: '4.5rem',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    backButton: {
        textTransform: 'none',
        fontWeight: 700,
    },
});

function FacilityDetails({
    classes,
    clearFacility,
    searchForFacilities,
    vectorTileFlagIsActive,
    history: { push },
}) {
    return (
        <div className={classes.container}>
            <div className={classes.buttonContainer}>
                <Button
                    color="primary"
                    className={classes.backButton}
                    onClick={() => {
                        clearFacility();
                        searchForFacilities(vectorTileFlagIsActive);
                        push(facilitiesRoute);
                    }}
                >
                    <ArrowBack />
                    Back to search results
                </Button>
            </div>
            <FacilityDetailsContent />
        </div>
    );
}

function mapStateToProps({ filters, featureFlags, embeddedMap: { embed } }) {
    const vectorTileFlagIsActive = get(
        featureFlags,
        'flags.vector_tile',
        false,
    );

    return { filters, vectorTileFlagIsActive, embedded: !!embed };
}

function mapDispatchToProps(dispatch) {
    return {
        clearFacility: () => dispatch(resetSingleFacility()),
        searchForFacilities: vectorTilesAreActive =>
            dispatch(
                fetchFacilities({
                    pageSize: vectorTilesAreActive
                        ? FACILITIES_REQUEST_PAGE_SIZE
                        : 50,
                }),
            ),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(facilityDetailsStyles)(withQueryStringSync(FacilityDetails)));
