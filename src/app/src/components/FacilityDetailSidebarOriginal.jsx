import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';
import head from 'lodash/head';
import filter from 'lodash/filter';
import last from 'lodash/last';
import get from 'lodash/get';
import includes from 'lodash/includes';
import partition from 'lodash/partition';
import { withStyles } from '@material-ui/core/styles';

import FacilityDetailsStaticMap from './FacilityDetailsStaticMap';
import FacilityDetailSidebarInfo from './FacilityDetailSidebarInfo';
import FacilityDetailsSidebarOtherLocations from './FacilityDetailsSidebarOtherLocations';
import FacilityDetailSidebarClaimedInfo from './FacilityDetailSidebarClaimedInfo';
import FacilityDetailSidebarPPE from './FacilityDetailSidebarPPE';
import FacilityDetailStatusList from './FacilityDetailStatusList';
import FeatureFlag from './FeatureFlag';
import BadgeUnclaimed from './BadgeUnclaimed';
import BadgeVerified from './BadgeVerified';
import ShowOnly from './ShowOnly';
import ReportFacilityStatus from './ReportFacilityStatus';

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
    makeProfileRouteLink,
    removeDuplicatesFromOtherLocationsData,
    getLocationWithoutEmbedParam,
} from '../util/util';

import {
    aboutClaimedFacilitiesRoute,
    CLAIM_A_FACILITY,
    PPE,
    REPORT_A_FACILITY,
    facilitiesRoute,
} from '../util/constants';

import COLOURS from '../util/COLOURS';

const detailsSidebarStyles = theme =>
    Object.freeze({
        root: {
            fontFamily: theme.typography.fontFamily,
        },
        headerButtonStyle: Object.freeze({
            width: '30px',
            marginRight: '14px',
            marginLeft: '-8px',
            background: 'unset !important',
            color: theme.palette.primary.contrastText,
        }),
        headerClaimButtonStyle: Object.freeze({
            margin: 0,
            marginLeft: 'auto',
            padding: '3px',
            flex: 'none',
            alignSelf: 'baseline',
            color: 'white',
        }),
        linkSectionStyle: Object.freeze({
            display: 'flex',
            flexDirection: 'column',
        }),
        linkStyle: Object.freeze({
            display: 'inline-block',
            fontSize: '16px',
            color: `${theme.palette.primary.main} !important`,
        }),
        closureRibbon: Object.freeze({
            background: 'rgb(255, 218, 162)',
            borderRadius: '4px',
            border: '1px solid rgb(134, 65, 15)',
            color: 'rgb(85, 43, 12)',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '5px',
            margin: '10px 5px 0 5px',
            textAlign: 'center',
        }),
        pendingRibbon: Object.freeze({
            borderRadius: '4px',
            border: '1px solid rgb(134, 65, 15)',
            color: 'rgb(85, 43, 12)',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '5px',
            margin: '10px 5px 0 5px',
            textAlign: 'center',
        }),
        error: {
            color: theme.palette.error,
        },
        panelHeader: {
            backgroundColor: theme.palette.primary.main,
            padding: '24px 20px',
            maxHeight: '110px',
            color: theme.palette.primary.contrastText,
        },
    });

const SUGGEST_A_DATA_EDIT = 'Suggest a data edit';

class FacilityDetailSidebar extends Component {
    componentDidMount() {
        return this.props.fetchFacility(
            Number(this.props.embed),
            this.props.contributors,
        );
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
            embed,
            contributors,
        } = this.props;

        return oarID !== prevOARID
            ? this.props.fetchFacility(Number(embed), contributors)
            : null;
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
            history: { push },
            facilityIsClaimedByCurrentUser,
            userHasPendingFacilityClaim,
            embed,
            classes,
        } = this.props;

        if (data?.id && data?.id !== oarID) {
            // When redirecting to a facility alias from a deleted facility,
            // the OAR ID in the url will not match the facility data id;
            // redirect to the appropriate facility URL.
            return <Redirect to={`/facilities/${data.id}`} />;
        }

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
                                <li key={err} classNames={classes.errror}>
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

        const [canonicalLocationsData, otherLocationsData] = partition(
            data.properties.other_locations || [],
            ({ lng, lat }) => lng === facilityLng && lat === facilityLat,
        );

        const inexactCoordinatesWarning = data.properties
            .has_inexact_coordinates ? (
            <em>
                Unable to locate exact GPS coordinates for this facility. If you
                have access to accurate coordinates for this facility, please
                report them using the &quot;{SUGGEST_A_DATA_EDIT}&quot; link
                below.
            </em>
        ) : null;

        const canonicalLocationData = head(canonicalLocationsData);

        const canonicalFacilityLocation = canonicalLocationData ? (
            <div className="control-panel__group">
                <h1 className="control-panel__heading">GPS Coordinates:</h1>
                <span className="control-panel__body">
                    {facilityLng}, {facilityLat}
                </span>
                {inexactCoordinatesWarning}
                <br />
                {canonicalLocationData.contributor_id &&
                    canonicalLocationData.contributor_name && (
                        <span>
                            Contributed by{' '}
                            <Link
                                to={makeProfileRouteLink(
                                    canonicalLocationData.contributor_id,
                                )}
                                href={makeProfileRouteLink(
                                    canonicalLocationData.contributor_id,
                                )}
                            >
                                {canonicalLocationData.contributor_name}
                            </Link>
                        </span>
                    )}
            </div>
        ) : (
            <div className="control-panel__group">
                <h1 className="control-panel__heading">GPS Coordinates:</h1>
                <p className="control-panel__body">
                    {facilityLng}, {facilityLat}
                </p>
                {inexactCoordinatesWarning}
            </div>
        );

        const facilityClaimID = get(data, 'properties.claim_info.id', null);

        const report = get(data, 'properties.activity_reports[0]');
        const newOarId = get(data, 'properties.new_oar_id');
        const renderStatusRibbon = () => {
            if (!report) return null;
            if (report.status === 'PENDING') {
                return (
                    <FeatureFlag flag={REPORT_A_FACILITY}>
                        <div className={classes.pendingRibbon}>
                            Reported as {report.closure_state.toLowerCase()}{' '}
                            (status pending).
                        </div>
                    </FeatureFlag>
                );
            }
            if (data.properties.is_closed) {
                return (
                    <FeatureFlag flag={REPORT_A_FACILITY}>
                        <div className={classes.closureRibbon}>
                            This facility is closed
                            {!!newOarId && (
                                <span>
                                    {' '}
                                    and has moved to{' '}
                                    <a href={`/facilities/${newOarId}`}>
                                        {newOarId}
                                    </a>
                                </span>
                            )}
                            .
                        </div>
                    </FeatureFlag>
                );
            }
            return null;
        };

        const contributorFields = filter(
            get(data, 'properties.contributor_fields', null),
            field => field.value !== null,
        );

        const claimedFacilitySection = (
            <ShowOnly when={!facilityIsClaimedByCurrentUser}>
                <>
                    <FeatureFlag flag={CLAIM_A_FACILITY}>
                        {data.properties.claim_info ? (
                            <a
                                className={`link-underline small ${classes.linkStyle}`}
                                href={makeDisputeClaimEmailLink(
                                    data.properties.oar_id,
                                )}
                            >
                                Dispute claim
                            </a>
                        ) : (
                            <>
                                <ShowOnly when={!userHasPendingFacilityClaim}>
                                    <Link
                                        className={`link-underline small ${classes.linkStyle}`}
                                        to={makeClaimFacilityLink(
                                            data.properties.oar_id,
                                        )}
                                        href={makeClaimFacilityLink(
                                            data.properties.oar_id,
                                        )}
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
                    <a
                        className={`link-underline small ${classes.linkStyle}`}
                        href={makeReportADataIssueEmailLink(
                            data.properties.oar_id,
                        )}
                    >
                        {SUGGEST_A_DATA_EDIT}
                    </a>
                </>
            </ShowOnly>
        );

        return (
            <div className={`control-panel facility-detail ${classes.root}`}>
                <div className={`${classes.panelHeader} display-flex`}>
                    <IconButton
                        aria-label="ArrowBack"
                        className={classes.headerButtonStyle}
                        onClick={() => push(facilitiesRoute)}
                        disabled={fetching}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <div>
                        <h3 className="panel-header__title notranslate">
                            {data.properties.name}
                        </h3>
                        <p className="panel-header__subheading notranslate">
                            {data.properties.address} -{' '}
                            {data.properties.country_name}
                        </p>
                    </div>
                    <FeatureFlag flag={CLAIM_A_FACILITY}>
                        {data.properties.claim_info ? (
                            <IconButton
                                className={classes.headerClaimButtonStyle}
                                onClick={() =>
                                    push(
                                        facilityClaimID &&
                                            facilityIsClaimedByCurrentUser
                                            ? makeApprovedClaimDetailsLink(
                                                  facilityClaimID,
                                              )
                                            : aboutClaimedFacilitiesRoute,
                                    )
                                }
                                disabled={fetching}
                                title="Claimed Facility"
                            >
                                <BadgeVerified color={COLOURS.TEAL} />
                            </IconButton>
                        ) : (
                            <ShowOnly when={!userHasPendingFacilityClaim}>
                                <IconButton
                                    className={classes.headerClaimButtonStyle}
                                    onClick={() =>
                                        push(
                                            makeClaimFacilityLink(
                                                data.properties.oar_id,
                                            ),
                                        )
                                    }
                                    disabled={
                                        fetching || userHasPendingFacilityClaim
                                    }
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
                    {renderStatusRibbon()}
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
                        {canonicalFacilityLocation}
                        {contributorFields.map(field => (
                            <div
                                className="control-panel__group"
                                key={field.label}
                            >
                                <h1 className="control-panel__heading">
                                    {field.label}
                                </h1>
                                <p className="control-panel__body">
                                    {field.value}
                                </p>
                            </div>
                        ))}
                        <FacilityDetailsSidebarOtherLocations
                            data={removeDuplicatesFromOtherLocationsData(
                                otherLocationsData,
                            )}
                        />
                        <FacilityDetailSidebarInfo
                            data={data.properties.other_names}
                            label="Also known as:"
                            embed={embed}
                        />
                        <FacilityDetailSidebarInfo
                            data={data.properties.other_addresses}
                            label="Other addresses:"
                            embed={embed}
                        />
                        <FacilityDetailSidebarInfo
                            data={data.properties.contributors}
                            label="Contributors:"
                            isContributorsList
                            embed={embed}
                        />
                        <FeatureFlag flag={PPE}>
                            <FacilityDetailSidebarPPE
                                properties={data.properties}
                            />
                        </FeatureFlag>
                        <FeatureFlag flag={CLAIM_A_FACILITY}>
                            <ShowOnly when={!!data.properties.claim_info}>
                                <FacilityDetailSidebarClaimedInfo
                                    data={data.properties.claim_info}
                                />
                            </ShowOnly>
                        </FeatureFlag>
                        <FeatureFlag flag={REPORT_A_FACILITY}>
                            <FacilityDetailStatusList
                                activityReports={
                                    data.properties.activity_reports
                                }
                            />
                        </FeatureFlag>
                        <div className="control-panel__group">
                            <div className={classes.linkSectionStyle}>
                                <ShowOnly when={!embed}>
                                    {claimedFacilitySection}
                                    <ShowOnly
                                        when={facilityIsClaimedByCurrentUser}
                                    >
                                        <FeatureFlag flag={CLAIM_A_FACILITY}>
                                            <Link
                                                className={`link-underline small ${classes.linkStyle}`}
                                                to={makeApprovedClaimDetailsLink(
                                                    facilityClaimID,
                                                )}
                                                href={makeApprovedClaimDetailsLink(
                                                    facilityClaimID,
                                                )}
                                            >
                                                Update facility details
                                            </Link>
                                        </FeatureFlag>
                                    </ShowOnly>
                                    <FeatureFlag flag={REPORT_A_FACILITY}>
                                        <ReportFacilityStatus data={data} />
                                    </FeatureFlag>
                                </ShowOnly>
                                <ShowOnly when={embed}>
                                    <a
                                        className={`link-underline small ${classes.linkStyle}`}
                                        href={getLocationWithoutEmbedParam()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Facility on the Open Apparel
                                        Registry
                                    </a>
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

function mapStateToProps(
    {
        facilities: {
            singleFacility: { data, fetching, error },
        },
        auth: { user },
        embeddedMap: { embed },
        filters: { contributors },
    },
    {
        match: {
            params: { oarID },
        },
    },
) {
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
    const userHasPendingFacilityClaim =
        includes(currentUserPendingClaimedFacilities, oarID) &&
        !facilityIsClaimedByCurrentUser;

    return {
        data,
        fetching,
        error,
        facilityIsClaimedByCurrentUser,
        userHasPendingFacilityClaim,
        user,
        embed: !!embed,
        contributors,
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
        fetchFacility: (embed, contributorId) =>
            dispatch(fetchSingleFacility(oarID, embed, contributorId)),
        clearFacility: () => dispatch(resetSingleFacility()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(detailsSidebarStyles)(FacilityDetailSidebar));
