import React, { Component } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';
import head from 'lodash/head';
import last from 'lodash/last';
import get from 'lodash/get';
import includes from 'lodash/includes';

import FacilityDetailsStaticMap from './FacilityDetailsStaticMap';
import FacilityDetailSidebarInfo from './FacilityDetailSidebarInfo';
import FacilityDetailSidebarClaimedInfo from './FacilityDetailSidebarClaimedInfo';
import FeatureFlag from './FeatureFlag';
import BadgeUnclaimed from './BadgeUnclaimed';
import BadgeVerified from './BadgeVerified';
import ShowOnly from './ShowOnly';

import {
    fetchSingleFacility,
    resetSingleFacility,
} from '../actions/facilities';

import { facilityDetailsPropType } from '../util/propTypes';

import {
    makeReportADataIssueEmailLink,
    makeClaimFacilityLink,
    makeDisputeClaimEmailLink,
    makeApprovedClaimDetailsLink,
} from '../util/util';

import { CLAIM_A_FACILITY } from '../util/constants';

import COLOURS from '../util/COLOURS';

const detailsSidebarStyles = Object.freeze({
    headerButtonStyle: Object.freeze({
        width: '30px',
        marginRight: '14px',
        marginLeft: '8px',
    }),
    linkSectionStyle: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
    }),
    linkStyle: Object.freeze({
        display: 'inline-block',
        fontSize: '16px',
    }),
});

class FacilityDetailSidebar extends Component {
    componentDidMount() {
        return this.props.fetchFacility();
    }

    componentDidUpdate({
        match: {
            params: { oarID: prevOARID },
        },
    }) {
        const {
            match: {
                params: { oarID },
            },
        } = this.props;

        return oarID !== prevOARID ? this.props.fetchFacility() : null;
    }

    componentWillUnmount() {
        return this.props.clearFacility();
    }

    render() {
        const {
            fetching,
            data,
            error,
            match: {
                params: { oarID },
            },
            history: { goBack, push },
            facilityIsClaimedByCurrentUser,
            userHasPendingFacilityClaim,
        } = this.props;

        if (fetching) {
            return (
                <div className="control-panel">
                    <div className="control-panel__content">
                        <CircularProgress />
                    </div>
                </div>
            );
        }

        if (error && error.length) {
            return (
                <div className="control-panel">
                    <div className="control-panel__content">
                        <ul>
                            {error.map(err => (
                                <li key={err} style={{ color: 'red' }}>
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }

        if (!data) {
            return (
                <div className="control-panel">
                    <div className="control-panel__content">
                        {`No facility found for OAR ID ${oarID}`}
                    </div>
                </div>
            );
        }

        const facilityLat = last(data.geometry.coordinates);
        const facilityLng = head(data.geometry.coordinates);

        const facilityClaimID = get(data, 'properties.claim_info.id', null);

        return (
            <div className="control-panel facility-detail">
                <div className="panel-header display-flex">
                    <IconButton
                        aria-label="ArrowBack"
                        className="color-white"
                        style={detailsSidebarStyles.headerButtonStyle}
                        onClick={goBack}
                        disabled={fetching}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <div>
                        <h3 className="panel-header__title notranslate">
                            {data.properties.name}
                        </h3>
                        <p className="panel-header__subheading notranslate">
                            {data.properties.address} - {data.properties.country_name}
                        </p>
                    </div>
                    <FeatureFlag flag={CLAIM_A_FACILITY}>
                        {data.properties.claim_info ? (
                            <IconButton
                                className="color-white"
                                style={detailsSidebarStyles.headerButtonStyle}
                                onClick={
                                    () => push(
                                        (facilityClaimID && facilityIsClaimedByCurrentUser)
                                            ? makeApprovedClaimDetailsLink(facilityClaimID)
                                            : '/about/claimedfacilities',
                                    )
                                }
                                disabled={fetching}
                                title="Claimed Facility"
                            >
                                <BadgeVerified color={COLOURS.GREEN} />
                            </IconButton>
                        ) : (
                            <ShowOnly when={!userHasPendingFacilityClaim}>
                                <IconButton
                                    className="color-white"
                                    style={detailsSidebarStyles.headerButtonStyle}
                                    onClick={() =>
                                        push(
                                            makeClaimFacilityLink(
                                                data.properties.oar_id,
                                            ),
                                        )
                                    }
                                    disabled={fetching || userHasPendingFacilityClaim}
                                    title={
                                        userHasPendingFacilityClaim
                                            ? 'You have a pending claim on this facility'
                                            : 'Claim this facility'
                                    }
                                >
                                    <BadgeUnclaimed />
                                </IconButton>
                            </ShowOnly>
                        )}
                    </FeatureFlag>
                </div>
                <div className="facility-detail_data">
                    <FacilityDetailsStaticMap data={data} />
                    <div className="control-panel__content">
                        <div className="control-panel__group">
                            <h1 className="control-panel__heading">
                                OAR ID: &nbsp;
                            </h1>
                            <p className="control-panel__body">
                                {data.properties.oar_id}
                            </p>
                        </div>
                        <div className="control-panel__group">
                            <h1 className="control-panel__heading">
                                GPS Coordinates:
                            </h1>
                            <p className="control-panel__body">
                                {facilityLat}, {facilityLng}
                            </p>
                        </div>
                        <FacilityDetailSidebarInfo
                            data={data.properties.other_names}
                            label="Also known as:"
                        />
                        <FacilityDetailSidebarInfo
                            data={data.properties.other_addresses}
                            label="Other addresses:"
                        />
                        <FacilityDetailSidebarInfo
                            data={data.properties.contributors}
                            label="Contributors:"
                            isContributorsList
                        />
                        <FeatureFlag flag={CLAIM_A_FACILITY}>
                            <ShowOnly when={!!data.properties.claim_info}>
                                <FacilityDetailSidebarClaimedInfo
                                    data={data.properties.claim_info}
                                />
                            </ShowOnly>
                        </FeatureFlag>
                        <div className="control-panel__group">
                            <div style={detailsSidebarStyles.linkSectionStyle}>
                                <ShowOnly when={!facilityIsClaimedByCurrentUser}>
                                    <>
                                        <a
                                            className="link-underline small"
                                            href={makeReportADataIssueEmailLink(
                                                data.properties.oar_id,
                                            )}
                                            style={detailsSidebarStyles.linkStyle}
                                        >
                                            Suggest a data edit
                                        </a>
                                        <FeatureFlag flag={CLAIM_A_FACILITY}>
                                            {data.properties.claim_info ? (
                                                <a
                                                    className="link-underline small"
                                                    href={makeDisputeClaimEmailLink(
                                                        data.properties.oar_id,
                                                    )}
                                                    style={
                                                        detailsSidebarStyles.linkStyle
                                                    }
                                                >
                                                    Dispute claim
                                                </a>
                                            ) : (
                                                <>
                                                    <ShowOnly when={!userHasPendingFacilityClaim}>
                                                        <Link
                                                            className="link-underline small"
                                                            to={makeClaimFacilityLink(
                                                                data.properties.oar_id,
                                                            )}
                                                            href={makeClaimFacilityLink(
                                                                data.properties.oar_id,
                                                            )}
                                                            style={
                                                                detailsSidebarStyles.linkStyle
                                                            }
                                                        >
                                                            Claim this facility
                                                        </Link>
                                                    </ShowOnly>
                                                    <ShowOnly when={userHasPendingFacilityClaim}>
                                                        <p>
                                                            You have a pending claim on this
                                                            facility
                                                        </p>
                                                    </ShowOnly>
                                                </>
                                            )}
                                        </FeatureFlag>
                                    </>
                                </ShowOnly>
                                <ShowOnly when={facilityIsClaimedByCurrentUser}>
                                    <FeatureFlag flag={CLAIM_A_FACILITY}>
                                        <Link
                                            className="link-underline small"
                                            to={makeApprovedClaimDetailsLink(facilityClaimID)}
                                            href={makeApprovedClaimDetailsLink(facilityClaimID)}
                                            style={detailsSidebarStyles.linkStyle}
                                        >
                                            Update claimed facility profile
                                        </Link>
                                    </FeatureFlag>
                                </ShowOnly>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

FacilityDetailSidebar.defaultProps = {
    data: null,
    error: null,
};

FacilityDetailSidebar.propTypes = {
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    match: shape({
        params: shape({
            oarID: string.isRequired,
        }).isRequired,
    }).isRequired,
    history: shape({
        goBack: func.isRequired,
        push: func.isRequired,
    }).isRequired,
    fetchFacility: func.isRequired,
    clearFacility: func.isRequired,
    facilityIsClaimedByCurrentUser: bool.isRequired,
    userHasPendingFacilityClaim: bool.isRequired,
};

function mapStateToProps({
    facilities: {
        singleFacility: { data, fetching, error },
    },
    auth: {
        user,
    },
}, {
    match: {
        params: {
            oarID,
        },
    },
}) {
    const {
        approved: currentUserApprovedClaimedFacilities,
        pending: currentUserPendingClaimedFacilities,
    } = get(user, 'user.claimed_facility_ids', { approved: [], pending: [] });

    const facilityIsClaimedByCurrentUser = includes(
        currentUserApprovedClaimedFacilities,
        oarID,
    );

    // Make this false if the current user has an approved claim
    // regardless of the presence of any other pending claims
    const userHasPendingFacilityClaim = includes(
        currentUserPendingClaimedFacilities,
        oarID,
    ) && !facilityIsClaimedByCurrentUser;

    return {
        data,
        fetching,
        error,
        facilityIsClaimedByCurrentUser,
        userHasPendingFacilityClaim,
        user,
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
        fetchFacility: () => dispatch(fetchSingleFacility(oarID)),
        clearFacility: () => dispatch(resetSingleFacility()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(FacilityDetailSidebar);
