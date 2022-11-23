import React, { useEffect, useMemo } from 'react';
import { Redirect, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import partition from 'lodash/partition';
import includes from 'lodash/includes';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';

import FacilityDetailsClosureStatus from './FacilityDetailsClosureStatus';
import FacilityDetailsClaimFlag from './FacilityDetailsClaimFlag';
import FacilityDetailsCoreFields from './FacilityDetailsCoreFields';
import FacilityDetailsInteractiveMap from './FacilityDetailsInteractiveMap';
import FacilityDetailsLocationFields from './FacilityDetailsLocationFields';
import FacilityDetailsGeneralFields from './FacilityDetailsGeneralFields';
import FacilityDetailsContributors from './FacilityDetailsContributors';
import ShowOnly from './ShowOnly';

import {
    fetchSingleFacility,
    resetSingleFacility,
    fetchFacilities,
} from '../actions/facilities';

import {
    facilityDetailsActions,
    FACILITIES_REQUEST_PAGE_SIZE,
} from '../util/constants';

import {
    makeClaimFacilityLink,
    getLocationWithoutEmbedParam,
    formatAttribution,
} from '../util/util';

const detailsStyles = theme =>
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
            fontFamily: theme.typography.fontFamily,
        },
    });

const formatIfListAndRemoveDuplicates = value =>
    Array.isArray(value)
        ? [...new Set(value)].map(v => (
              <span style={{ margin: 0, display: 'block' }} key={v}>
                  {v}
              </span>
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

const FacilityDetailsContent = ({
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
        params: { osID },
    },
    userHasPendingFacilityClaim,
    facilityIsClaimedByCurrentUser,
    embedConfig,
    hideSectorData,
}) => {
    useEffect(() => {
        fetchFacility(Number(embed), contributors);
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [osID]);

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
                    {`No facility found for OS ID ${osID}`}
                </p>
            </div>
        );
    }

    if (data?.id && data?.id !== osID) {
        // When redirecting to a facility alias from a deleted facility,
        // the OS ID in the url will not match the facility data id;
        // redirect to the appropriate facility URL.
        return <Redirect to={`/facilities/${data.id}`} />;
    }

    const osId = data.properties.os_id;
    const isClaimed = !!data?.properties?.claim_info;
    const claimFacility = () => push(makeClaimFacilityLink(osId));

    return (
        <div className={classes.root}>
            <List className={classes.list}>
                <FacilityDetailsClaimFlag
                    osId={data.properties.os_id}
                    isClaimed={isClaimed}
                    isPending={userHasPendingFacilityClaim}
                    isEmbed={embed}
                />
                <FacilityDetailsClosureStatus
                    data={data}
                    clearFacility={clearFacility}
                />
                <FacilityDetailsCoreFields
                    name={nameField.primary}
                    osId={data.properties.os_id}
                    isEmbed={embed}
                    isClaimed={isClaimed}
                    facilityIsClaimedByCurrentUser={
                        facilityIsClaimedByCurrentUser
                    }
                    userHasPendingFacilityClaim={userHasPendingFacilityClaim}
                    claimFacility={claimFacility}
                    isClosed={data.properties.is_closed}
                />
                <FacilityDetailsInteractiveMap />
                <FacilityDetailsLocationFields
                    data={data}
                    filterByUniqueField={filterByUniqueField}
                    createdFrom={createdFrom}
                    embed={embed}
                />
                <FacilityDetailsGeneralFields
                    data={data}
                    embed={embed}
                    nameField={nameField}
                    otherNames={otherNames}
                    embedConfig={embedConfig}
                    formatExtendedField={formatExtendedField}
                    formatIfListAndRemoveDuplicates={
                        formatIfListAndRemoveDuplicates
                    }
                    hideSectorData={hideSectorData}
                />
                <ShowOnly when={!embed}>
                    <FacilityDetailsContributors
                        contributors={data.properties.contributors}
                        push={push}
                    />
                </ShowOnly>
                <div className={classes.actions}>
                    <ShowOnly when={embed}>
                        <a
                            className={classes.link}
                            href={getLocationWithoutEmbedParam()}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {facilityDetailsActions.VIEW_ON_OAR}
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
            params: { osID },
        },
    },
) {
    const {
        approved: currentUserApprovedClaimedFacilities,
        pending: currentUserPendingClaimedFacilities,
    } = get(user, 'user.claimed_facility_ids', { approved: [], pending: [] });

    const facilityIsClaimedByCurrentUser = includes(
        currentUserApprovedClaimedFacilities,
        osID,
    );

    // Make this false if the current user has an approved claim
    // regardless of the presence of any other pending claims
    const userHasPendingFacilityClaim =
        includes(currentUserPendingClaimedFacilities, osID) &&
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
        hideSectorData: embed ? config.hide_sector_data : false,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { osID },
        },
    },
) {
    return {
        fetchFacility: (embed, contributorId) =>
            dispatch(fetchSingleFacility(osID, embed, contributorId)),
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
    )(withStyles(detailsStyles)(FacilityDetailsContent)),
);
