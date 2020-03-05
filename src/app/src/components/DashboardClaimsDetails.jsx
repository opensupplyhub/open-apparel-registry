import React, { useEffect } from 'react';
import { arrayOf, bool, func, node, string } from 'prop-types';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import { Link, Route } from 'react-router-dom';
import get from 'lodash/get';

import DashboardClaimDetailsControls from './DashboardClaimDetailsControls';
import DashboardClaimsDetailsNote from './DashboardClaimsDetailsNote';
import DashboardClaimsDetailsAddNote from './DashboardClaimsDetailsAddNote';

import {
    fetchSingleFacilityClaim,
    clearSingleFacilityClaim,
} from '../actions/claimFacilityDashboard';

import { facilityClaimPropType } from '../util/propTypes';

import {
    makeProfileRouteLink,
    makeFacilityDetailLink,
    addProtocolToWebsiteURLIfMissing,
} from '../util/util';

const dashboardClaimsDetailsStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
    }),
    infoSectionStyles: Object.freeze({
        width: '40%',
        padding: '3%',
    }),
    dateStyles: Object.freeze({
        padding: '10px',
    }),
    notesHeaderStyles: Object.freeze({
        margin: '50px 0 0',
    }),
});

const defaultInfoSectionValueStyle = Object.freeze({
    padding: '10px 0',
    fontSize: '16px',
    whiteSpace: 'pre-line',
});

const InfoSection = ({ label, value }) => (
    <div style={dashboardClaimsDetailsStyles.infoSectionStyles}>
        <Typography variant="title">{label}</Typography>
        <Typography variant="body1" style={defaultInfoSectionValueStyle}>
            {value}
        </Typography>
    </div>
);

InfoSection.propTypes = {
    label: string.isRequired,
    value: node.isRequired,
};

function DashboardClaimsDetails({
    getFacilityClaim,
    clearFacilityClaim,
    data,
    fetching,
    error,
}) {
    useEffect(() => {
        getFacilityClaim();

        return clearFacilityClaim;
    }, [getFacilityClaim, clearFacilityClaim]);

    if (fetching) {
        return <CircularProgress />;
    }

    if (error) {
        return (
            <Typography>
                An error prevented fetching that facility claim.
            </Typography>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <>
            <DashboardClaimDetailsControls data={data} />
            <div style={dashboardClaimsDetailsStyles.dateStyles}>
                <Typography variant="body2">
                    Created on {moment(data.created_at).format('LLL')} / Last
                    updated on {moment(data.updated_at).format('LLL')}
                </Typography>
            </div>
            <Paper style={dashboardClaimsDetailsStyles.containerStyles}>
                <InfoSection
                    label="Facility"
                    value={
                        (
                            <Link
                                to={makeFacilityDetailLink(data.facility.id)}
                                href={makeFacilityDetailLink(data.facility.id)}
                            >
                                {data.facility.properties.name}
                            </Link>
                        )
                    }
                />
                <InfoSection
                    label="Claim Contributor"
                    value={
                        (
                            <Link
                                to={makeProfileRouteLink(data.contributor.id)}
                                href={makeProfileRouteLink(data.contributor.id)}
                            >
                                {data.contributor.name}
                            </Link>
                        )
                    }
                />
                <InfoSection
                    label="Contact Person"
                    value={data.contact_person}
                />
                <InfoSection
                    label="Job Title"
                    value={data.job_title}
                />
                <InfoSection
                    label="Email"
                    value={data.email}
                />
                <InfoSection
                    label="Phone Number"
                    value={data.phone_number}
                />
                <InfoSection
                    label="Company Name"
                    value={data.company_name}
                />
                <InfoSection
                    label="Website"
                    value={
                        data.website && (
                            <a
                                href={addProtocolToWebsiteURLIfMissing(data.website)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {data.website}
                            </a>
                        )
                    }
                />
                <InfoSection
                    label="Facility Parent Company / Supplier Group"
                    value={
                        (() => {
                            const parentCompanyName = get(data, 'facility_parent_company.name', null);

                            if (!parentCompanyName) {
                                return '';
                            }

                            const profileLink = makeProfileRouteLink(
                                get(data, 'facility_parent_company.id', null),
                            );

                            return (
                                <Link
                                    to={profileLink}
                                    href={profileLink}
                                >
                                    {parentCompanyName}
                                </Link>
                            );
                        })()
                    }
                />
                <InfoSection
                    label="Preferred Contact Method"
                    value={data.preferred_contact_method}
                />
                <InfoSection
                    label="LinkedIn Profile"
                    value={
                        data.linkedin_profile && (
                            <a
                                href={addProtocolToWebsiteURLIfMissing(data.linkedin_profile)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {data.linkedin_profile}
                            </a>
                        )
                    }
                />
                <InfoSection
                    label="Facility Description"
                    value={data.facility_description}
                />
                <InfoSection
                    label="Verification Method"
                    value={data.verification_method}
                />
            </Paper>
            <div style={dashboardClaimsDetailsStyles.notesHeaderStyles}>
                <Typography variant="title">
                    Facility Claim Review Notes
                </Typography>
            </div>
            {
                data
                    .notes
                    .map(note => (
                        <DashboardClaimsDetailsNote
                            key={note.id}
                            note={note}
                        />
                    ))
            }
            <Route component={DashboardClaimsDetailsAddNote} />
        </>
    );
}

DashboardClaimsDetails.defaultProps = {
    data: null,
    error: null,
};

DashboardClaimsDetails.propTypes = {
    getFacilityClaim: func.isRequired,
    clearFacilityClaim: func.isRequired,
    data: facilityClaimPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
};

function mapStateToProps({
    claimFacilityDashboard: {
        detail: { data, fetching, error },
    },
}) {
    return {
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { claimID },
        },
    },
) {
    return {
        getFacilityClaim: () => dispatch(fetchSingleFacilityClaim(claimID)),
        clearFacilityClaim: () => dispatch(clearSingleFacilityClaim()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardClaimsDetails);
