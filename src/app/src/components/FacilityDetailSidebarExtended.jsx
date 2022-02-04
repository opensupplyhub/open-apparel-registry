import React, { useEffect, useMemo } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';

import FacilityDetailsStaticMap from './FacilityDetailsStaticMap';
import FacilityDetailSidebarHeader from './FacilityDetailSidebarHeader';
import FacilityDetailSidebarItem from './FacilityDetailSidebarItem';
import FacilityDetailSidebarLocation from './FacilityDetailSidebarLocation';
import FacilityDetailSidebarContributors from './FacilityDetailSidebarContributors';
import FacilityDetailSidebarAction from './FacilityDetailSidebarAction';
import ReportFacilityStatus from './ReportFacilityStatus';
import ShowOnly from './ShowOnly';

import {
    fetchSingleFacility,
    resetSingleFacility,
} from '../actions/facilities';

import {
    facilitySidebarActions,
    EXTENDED_FIELD_TYPES,
} from '../util/constants';

import {
    makeReportADataIssueEmailLink,
    makeReportADuplicateEmailLink,
    makeDisputeClaimEmailLink,
    makeClaimFacilityLink,
    getLocationWithoutEmbedParam,
} from '../util/util';

const detailsSidebarStyles = theme =>
    Object.freeze({
        root: {
            fontFamily: theme.typography.fontFamily,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'scroll',
            paddingBottom: '50px',
        },
        label: {
            padding: '12px 24px 6px 24px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: theme.typography.fontWeightMedium,
        },
        item: {
            paddingTop: '12px',
        },
        secondaryText: {
            color: 'rgba(0, 0, 0, 0.54)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            justify: 'flex-end',
        },
        list: {
            paddingTop: 0,
        },
        error: {
            color: theme.palette.error,
            fontFamily: theme.typography.fontFamily,
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '20px',
        },
        actions: {
            fontFamily: theme.typography.fontFamily,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '30px 12px 0 12px',
        },
    });

const formatAttribution = (createdAt, contributor) =>
    `${moment(createdAt).format('LL')} by ${contributor}`;

const formatIfListAndRemoveDuplicates = value =>
    Array.isArray(value) ? [...new Set(value)].map(v => <li>{v}</li>) : value;

/* eslint-disable camelcase */
const formatExtendedField = ({
    value,
    updated_at,
    contributor_name,
    is_verified,
    id,
    formatValue = v => v,
}) => ({
    primary: formatIfListAndRemoveDuplicates(formatValue(value)),
    secondary: formatAttribution(updated_at, contributor_name),
    isVerified: is_verified,
    key: id,
});

const formatOtherValues = (data, fieldName, extendedFieldName) => [
    ...get(data, `properties.${fieldName}`, []).map(item => ({
        primary: item,
        key: item,
    })),
    ...get(data, `properties.extended_fields.${extendedFieldName}`, []).map(
        formatExtendedField,
    ),
];

const FacilityDetailSidebar = ({
    classes,
    data,
    fetching,
    error,
    embed,
    contributors,
    fetchFacility,
    clearFacility,
    history: { push },
    match: {
        params: { oarID },
    },
    userHasPendingFacilityClaim,
    facilityIsClaimedByCurrentUser,
    embedContributor,
    embedConfig,
}) => {
    useEffect(() => {
        fetchFacility(Number(embed), contributors);
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [oarID]);

    // Clears the selected facility when unmounted
    useEffect(() => () => clearFacility(), []);

    const otherNames = useMemo(
        () => formatOtherValues(data, 'other_names', 'name'),
        [data],
    );

    const otherAddresses = useMemo(
        () => formatOtherValues(data, 'other_addresses', 'address'),
        [data],
    );

    if (fetching) {
        return (
            <div className={classes.root}>
                <CircularProgress />
            </div>
        );
    }

    if (error && error.length) {
        return (
            <div className={classes.root}>
                <ul>
                    {error.map(err => (
                        <li key={err} classNames={classes.error}>
                            {err}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={classes.root}>
                <p className={classes.primaryText}>
                    {`No facility found for OAR ID ${oarID}`}
                </p>
            </div>
        );
    }

    if (data?.id && data?.id !== oarID) {
        // When redirecting to a facility alias from a deleted facility,
        // the OAR ID in the url will not match the facility data id;
        // redirect to the appropriate facility URL.
        return <Redirect to={`/facilities/${data.id}`} />;
    }

    const createdFrom = formatAttribution(
        data.properties.created_from.created_at,
        data.properties.created_from.contributor,
    );

    const oarId = data.properties.oar_id;
    const isClaimed = !!data?.properties?.claim_info;
    const claimFacility = () => push(makeClaimFacilityLink(oarId));

    const renderExtendedField = ({ label, fieldName, formatValue }) => {
        const values = get(data, `properties.extended_fields.${fieldName}`, []);
        if (!values.length || !values[0]) return null;

        const formatField = item =>
            formatExtendedField({ ...item, formatValue });

        const topValue = formatField(values[0]);

        return (
            <FacilityDetailSidebarItem
                {...topValue}
                label={label}
                additionalContent={values.slice(1).map(formatField)}
                embed={embed}
            />
        );
    };

    const renderContributorField = ({ label, value }) =>
        value !== null ? (
            <FacilityDetailSidebarItem
                label={label}
                primary={value}
                key={label}
            />
        ) : null;

    const contributorFields = filter(
        get(data, 'properties.contributor_fields', null),
        field => field.value !== null,
    );

    const renderEmbedFields = () => {
        const fields = embedConfig?.embed_fields?.filter(f => f.visible) || [];
        return fields.map(({ column_name: fieldName, display_name: label }) => {
            // If there is an extended field for that name, render and return it
            const eft = EXTENDED_FIELD_TYPES.find(
                x => x.fieldName === fieldName,
            );
            const ef = eft ? renderExtendedField({ ...eft, label }) : null;
            if (ef) {
                return ef;
            }
            // Otherwise, try rendering it as a contributor field
            const cf = contributorFields.find(x => x.fieldName === fieldName);
            if (cf) {
                return renderContributorField(cf);
            }
            return null;
        });
    };

    return (
        <div className={classes.root}>
            <List className={classes.list}>
                <FacilityDetailSidebarHeader
                    isClaimed={isClaimed}
                    isPending={userHasPendingFacilityClaim}
                    isEmbed={embed}
                    claimantName={get(
                        data,
                        'properties.claim_info.contributor',
                        'A Contributor',
                    )}
                    embedContributor={embedContributor}
                    fetching={fetching}
                    push={push}
                    oarId={data.properties.oar_id}
                    onClaimFacility={claimFacility}
                />
                <FacilityDetailSidebarItem
                    label="OAR ID"
                    primary={oarId}
                    embed={embed}
                />
                <FacilityDetailSidebarItem
                    label="Name"
                    primary={data.properties.name}
                    secondary={createdFrom}
                    additionalContent={otherNames}
                    embed={embed}
                />
                <FacilityDetailSidebarItem
                    label="Address"
                    primary={`${data.properties.address} - ${data.properties.country_name}`}
                    secondary={createdFrom}
                    additionalContent={otherAddresses}
                    embed={embed}
                />
                <div style={{ padding: '0 16px' }}>
                    <FacilityDetailsStaticMap data={data} />
                </div>
                <FacilityDetailSidebarLocation data={data} embed={embed} />
                <ShowOnly when={!embed}>
                    <FacilityDetailSidebarContributors
                        contributors={data.properties.contributors}
                        push={push}
                    />
                    {EXTENDED_FIELD_TYPES.map(renderExtendedField)}
                </ShowOnly>
                <ShowOnly when={embed}>{renderEmbedFields()}</ShowOnly>
                <div className={classes.actions}>
                    <ShowOnly when={!embed}>
                        <FacilityDetailSidebarAction
                            href={makeReportADataIssueEmailLink(oarId)}
                            iconName="pencil"
                            text={facilitySidebarActions.SUGGEST_AN_EDIT}
                            link
                        />
                        <FacilityDetailSidebarAction
                            href={makeReportADuplicateEmailLink(oarId)}
                            iconName="clone"
                            text={facilitySidebarActions.REPORT_AS_DUPLICATE}
                            link
                        />
                        <ReportFacilityStatus data={data} />
                        <ShowOnly when={!facilityIsClaimedByCurrentUser}>
                            {isClaimed ? (
                                <FacilityDetailSidebarAction
                                    href={makeDisputeClaimEmailLink(oarId)}
                                    iconName="shield-alt"
                                    text={facilitySidebarActions.DISPUTE_CLAIM}
                                    link
                                />
                            ) : (
                                <ShowOnly when={!userHasPendingFacilityClaim}>
                                    <FacilityDetailSidebarAction
                                        iconName="shield-check"
                                        text={
                                            facilitySidebarActions.CLAIM_FACILITY
                                        }
                                        onClick={claimFacility}
                                    />
                                </ShowOnly>
                            )}
                        </ShowOnly>
                    </ShowOnly>
                    <ShowOnly when={embed}>
                        <FacilityDetailSidebarAction
                            iconName="external-link-square-alt"
                            text={facilitySidebarActions.VIEW_ON_OAR}
                            href={getLocationWithoutEmbedParam()}
                            link
                        />
                    </ShowOnly>
                </div>
            </List>
        </div>
    );
};

function mapStateToProps(
    {
        facilities: {
            singleFacility: { data, fetching, error },
        },
        auth: { user },
        embeddedMap: { embed, config },
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
        embed: !!embed,
        embedContributor: config?.contributor_name,
        embedConfig: config,
        contributors,
        userHasPendingFacilityClaim,
        facilityIsClaimedByCurrentUser,
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
