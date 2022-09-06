import React, { useEffect, useMemo } from 'react';
import { Redirect, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import partition from 'lodash/partition';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import isNil from 'lodash/isNil';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';

import FacilityDetailSidebarClosureStatus from './FacilityDetailSidebarClosureStatus';
import FacilityDetailsClaimFlag from './FacilityDetailsClaimFlag';
import FacilityDetailsCoreFields from './FacilityDetailsCoreFields';
import FacilityDetailsLocationFields from './FacilityDetailsLocationFields';
import FacilityDetailSidebarItem from './FacilityDetailSidebarItem';
import FacilityDetailSidebarContributors from './FacilityDetailSidebarContributors';
import FacilityDetailSidebarClaimedInfo from './FacilityDetailSidebarClaimedInfo';
import ShowOnly from './ShowOnly';
import FeatureFlag from './FeatureFlag';

import {
    fetchSingleFacility,
    resetSingleFacility,
    fetchFacilities,
} from '../actions/facilities';

import {
    facilitySidebarActions,
    EXTENDED_FIELD_TYPES,
    REPORT_A_FACILITY,
    FACILITIES_REQUEST_PAGE_SIZE,
    CLAIM_A_FACILITY,
} from '../util/constants';

import {
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
            backgroundColor: '#fff',
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
        link: {
            color: theme.palette.primary.main,
            paddingLeft: theme.spacing.unit * 2,
        },
    });

const formatAttribution = (createdAt, contributor) => {
    if (contributor) {
        return `${moment(createdAt).format('LL')} by ${contributor}`;
    }
    return moment(createdAt).format('LL');
};

const formatIfListAndRemoveDuplicates = value =>
    Array.isArray(value)
        ? [...new Set(value)].map(v => (
              <p style={{ margin: 0 }} key={v}>
                  {v}
              </p>
          ))
        : value;

/* eslint-disable camelcase */
const formatExtendedField = ({
    value,
    updated_at,
    contributor_name,
    is_from_claim,
    is_verified,
    id,
    formatValue = v => v,
}) => {
    const primary = formatIfListAndRemoveDuplicates(formatValue(value));
    const secondary = formatAttribution(updated_at, contributor_name);
    return {
        primary,
        secondary,
        embeddedSecondary: formatAttribution(updated_at),
        isVerified: is_verified,
        isFromClaim: is_from_claim,
        key: id || primary + secondary,
    };
};
const filterByUniqueField = (data, extendedFieldName) =>
    uniqBy(
        get(data, `properties.extended_fields.${extendedFieldName}`, []).map(
            formatExtendedField,
        ),
        item => item.primary + item.secondary,
    );

const formatActivityReports = data => {
    const reports = get(data, 'properties.activity_reports', []);
    if (!reports.length) return [null, []];
    const formattedReports = reports.reduce((list, r) => {
        let updatedList = [...list];
        if (r.status === 'CONFIRMED') {
            updatedList = [
                ...updatedList,
                {
                    primary: `Verified ${r.closure_state.toLowerCase()}`,
                    secondary: formatAttribution(r.status_change_date),
                    key: `${r.id}-verified}`,
                },
            ];
        }
        return [
            ...updatedList,
            {
                primary: `Reported ${r.closure_state.toLowerCase()}`,
                secondary: formatAttribution(
                    r.created_at,
                    r.reported_by_contributor,
                ),
                key: r.id,
            },
        ];
    }, []);
    return [formattedReports[0], formattedReports.slice(1)];
};

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
    embedConfig,
}) => {
    useEffect(() => {
        fetchFacility(Number(embed), contributors);
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [oarID]);

    // Clears the selected facility when unmounted
    useEffect(() => () => clearFacility(), []);

    const createdFrom = embed
        ? formatAttribution(get(data, 'properties.created_from.created_at', ''))
        : formatAttribution(
              get(data, 'properties.created_from.created_at', ''),
              get(data, 'properties.created_from.contributor', ''),
          );

    const [nameField, otherNames] = useMemo(() => {
        const coreName = get(data, 'properties.name', '');
        const nameFields = filterByUniqueField(data, 'name');
        const [defaultNameField, otherNameFields] = partition(
            nameFields,
            field => field.primary === coreName,
        );
        if (!defaultNameField.length) {
            return [
                {
                    primary: coreName,
                    secondary: createdFrom,
                    key: coreName + createdFrom,
                },
                otherNameFields,
            ];
        }
        return [defaultNameField[0], otherNameFields];
    }, [data]);

    const [activityReport, otherActivityReports] = useMemo(
        () => formatActivityReports(data),
        [data],
    );

    const [sectorField, otherSectors] = useMemo(() => {
        const sectors = get(data, 'properties.sector', []).map(item => ({
            primary: item.values.join(', '),
            secondary: formatAttribution(
                item.updated_at,
                item.contributor_name,
            ),
            isFromClaim: item.is_from_claim,
            key: item.contributor_id,
        }));
        return [sectors[0], sectors.slice(1)];
    });

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
                        <li key={err} className={classes.error}>
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
                    {`No facility found for OS Hub ID ${oarID}`}
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

    const oarId = data.properties.oar_id;
    const isClaimed = !!data?.properties?.claim_info;
    const claimFacility = () => push(makeClaimFacilityLink(oarId));

    const renderExtendedField = ({ label, fieldName, formatValue }) => {
        let values = get(data, `properties.extended_fields.${fieldName}`, []);

        const formatField = item =>
            formatExtendedField({ ...item, formatValue });

        if (fieldName === 'facility_type') {
            // Filter by values where a matched value has a facility_type field
            values = values.filter(v =>
                v?.value?.matched_values?.some(mv => mv[2]),
            );
        }

        if (!values.length || !values[0]) return null;

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

    const renderContributorField = ({ label, value }) => {
        if (isNil(value) || value.toString().trim() === '') {
            return null;
        }
        return (
            <FacilityDetailSidebarItem
                label={label}
                primary={value}
                key={label}
            />
        );
    };

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
                <FacilityDetailsClaimFlag
                    oarId={data.properties.oar_id}
                    isClaimed={isClaimed}
                    isPending={userHasPendingFacilityClaim}
                    isEmbed={embed}
                />
                <FacilityDetailSidebarClosureStatus
                    data={data}
                    clearFacility={clearFacility}
                />
                <FacilityDetailsCoreFields
                    name={nameField.primary}
                    oarId={data.properties.oar_id}
                    isEmbed={embed}
                    isClaimed={isClaimed}
                    facilityIsClaimedByCurrentUser={
                        facilityIsClaimedByCurrentUser
                    }
                    userHasPendingFacilityClaim={userHasPendingFacilityClaim}
                    claimFacility={claimFacility}
                    isClosed={data.properties.is_closed}
                />
                <FacilityDetailsLocationFields
                    data={data}
                    filterByUniqueField={filterByUniqueField}
                    createdFrom={createdFrom}
                    embed={embed}
                />
                <FacilityDetailSidebarItem
                    label="Name"
                    {...nameField}
                    additionalContent={otherNames}
                    embed={embed}
                />
                <FacilityDetailSidebarItem
                    label="Sector"
                    {...sectorField}
                    additionalContent={otherSectors}
                    embed={embed}
                />

                <ShowOnly when={!embed}>
                    <FacilityDetailSidebarContributors
                        contributors={data.properties.contributors}
                        push={push}
                    />
                    {EXTENDED_FIELD_TYPES.map(renderExtendedField)}
                </ShowOnly>
                <FeatureFlag flag={CLAIM_A_FACILITY}>
                    <ShowOnly when={!!data.properties.claim_info}>
                        <FacilityDetailSidebarClaimedInfo
                            data={data.properties.claim_info}
                            formatListItem={formatIfListAndRemoveDuplicates}
                        />
                    </ShowOnly>
                </FeatureFlag>
                <FeatureFlag flag={REPORT_A_FACILITY}>
                    <ShowOnly when={!!activityReport}>
                        <FacilityDetailSidebarItem
                            label="Status"
                            {...activityReport}
                            additionalContent={otherActivityReports}
                            embed={embed}
                        />
                    </ShowOnly>
                </FeatureFlag>
                <ShowOnly when={embed}>{renderEmbedFields()}</ShowOnly>
                <div className={classes.actions}>
                    <ShowOnly when={embed}>
                        <a
                            className={classes.link}
                            href={getLocationWithoutEmbedParam()}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {facilitySidebarActions.VIEW_ON_OAR}
                        </a>
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
        featureFlags,
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

    const vectorTileFlagIsActive = get(
        featureFlags,
        'flags.vector_tile',
        false,
    );

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
        vectorTileFlagIsActive,
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

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(withStyles(detailsSidebarStyles)(FacilityDetailSidebar)),
);
