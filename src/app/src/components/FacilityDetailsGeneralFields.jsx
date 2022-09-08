import React, { useMemo } from 'react';
import Grid from '@material-ui/core/Grid';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import filter from 'lodash/filter';
import { withStyles } from '@material-ui/core/styles';

import FacilityDetailsItem from './FacilityDetailsItem';
import FacilityDetailsClaimedInfo from './FacilityDetailsClaimedInfo';
import ShowOnly from './ShowOnly';
import FeatureFlag from './FeatureFlag';
import { formatAttribution } from '../util/util';

import {
    EXTENDED_FIELD_TYPES,
    CLAIM_A_FACILITY,
    REPORT_A_FACILITY,
} from '../util/constants';

const locationFieldsStyles = theme =>
    Object.freeze({
        root: {
            color: '#191919',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '2px solid #F9F7F7',
            borderBottom: '2px solid #F9F7F7',
            flexDirection: 'column',
            alignItems: 'center',
        },
        contentContainer: {
            width: '100%',
            maxWidth: '1072px',
            paddingLeft: theme.spacing.unit * 3,
            paddingBottom: theme.spacing.unit * 3,
        },
    });

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

const FacilityDetailsLocationFields = ({
    classes,
    data,
    nameField,
    otherNames,
    embed,
    embedConfig,
    formatExtendedField,
    formatIfListAndRemoveDuplicates,
}) => {
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
    }, [data]);

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
            <Grid item xs={12} md={6}>
                <FacilityDetailsItem
                    {...topValue}
                    label={label}
                    additionalContent={values.slice(1).map(formatField)}
                    embed={embed}
                />
            </Grid>
        );
    };

    const renderContributorField = ({ label, value }) => {
        if (isNil(value) || value.toString().trim() === '') {
            return null;
        }
        return (
            <Grid item xs={12} md={6}>
                <FacilityDetailsItem
                    label={label}
                    primary={value}
                    key={label}
                />
            </Grid>
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

    const [activityReport, otherActivityReports] = useMemo(
        () => formatActivityReports(data),
        [data],
    );

    return (
        <div className={classes.root}>
            <Grid container className={classes.contentContainer}>
                <Grid item xs={12} md={6}>
                    <FacilityDetailsItem
                        label="Name"
                        {...nameField}
                        additionalContent={otherNames}
                        embed={embed}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FacilityDetailsItem
                        label="Sector"
                        {...sectorField}
                        additionalContent={otherSectors}
                        embed={embed}
                    />
                </Grid>
                {embed
                    ? renderEmbedFields()
                    : EXTENDED_FIELD_TYPES.map(renderExtendedField)}
                <FeatureFlag flag={REPORT_A_FACILITY}>
                    <ShowOnly when={!!activityReport}>
                        <FacilityDetailsItem
                            label="Status"
                            {...activityReport}
                            additionalContent={otherActivityReports}
                            additionalContentText="status"
                            additionalContentTextPlural="statuses"
                            embed={embed}
                        />
                    </ShowOnly>
                </FeatureFlag>
            </Grid>
            <Grid container className={classes.contentContainer}>
                <FeatureFlag flag={CLAIM_A_FACILITY}>
                    <ShowOnly when={!!data.properties.claim_info}>
                        <FacilityDetailsClaimedInfo
                            data={data.properties.claim_info}
                            formatListItem={formatIfListAndRemoveDuplicates}
                        />
                    </ShowOnly>
                </FeatureFlag>
            </Grid>
        </div>
    );
};

export default withStyles(locationFieldsStyles)(FacilityDetailsLocationFields);
