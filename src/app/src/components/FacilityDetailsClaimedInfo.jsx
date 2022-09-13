import React from 'react';
import { number, string, shape } from 'prop-types';
import trim from 'lodash/trim';
import orderBy from 'lodash/orderBy';
import identity from 'lodash/identity';
import Grid from '@material-ui/core/Grid';

import FacilityDetailsItem from './FacilityDetailsItem';

import { addProtocolToWebsiteURLIfMissing } from '../util/util';

const ClaimInfoSection = ({ label, value, fullWidth }) =>
    trim(value) && (
        <Grid item xs={12} md={fullWidth ? 12 : 6}>
            <FacilityDetailsItem label={label} primary={value} isFromClaim />
        </Grid>
    );

export default function FacilityDetailsClaimedInfo({ data, formatListItem }) {
    if (!data) {
        return null;
    }

    const { facility, contact, office } = data;

    const facilitySection = (
        <>
            <ClaimInfoSection
                label="Website"
                value={
                    facility.website ? (
                        <a
                            href={addProtocolToWebsiteURLIfMissing(
                                facility.website,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {facility.website}
                        </a>
                    ) : null
                }
            />
            {contact && (
                <>
                    <ClaimInfoSection
                        value={contact.name}
                        label="Contact Person"
                    />
                    <ClaimInfoSection
                        value={contact.email}
                        label="Contact Email"
                    />
                </>
            )}
            <ClaimInfoSection
                value={facility.phone_number}
                label="Phone Number"
            />
            <ClaimInfoSection
                value={facility.minimum_order}
                label="Minimum Order"
            />
            <ClaimInfoSection
                value={facility.average_lead}
                label="Average Lead Time"
            />
            <ClaimInfoSection
                value={facility.female_workers_percentage}
                label="Percentage of female workers"
            />
            <ClaimInfoSection
                label="Affiliations"
                value={
                    facility.affiliations &&
                    facility.affiliations.length &&
                    formatListItem(orderBy(facility.affiliations, identity))
                }
            />
            <ClaimInfoSection
                label="Certifications/Standards/Regulations"
                value={
                    facility.certifications &&
                    facility.certifications.length &&
                    formatListItem(orderBy(facility.certifications, identity))
                }
            />
        </>
    );

    const officeSection = office && (
        <>
            <ClaimInfoSection value={office.name} label="Office Name" />
            <ClaimInfoSection
                value={`${office.address || ' '} ${office.country || ' '}`}
                label="Office Address"
            />
            <ClaimInfoSection
                value={office.phone_number}
                label="Office Phone Number"
            />
        </>
    );

    return (
        <>
            {facilitySection}
            {officeSection}
            <ClaimInfoSection
                label="Description"
                value={facility.description}
                fullWidth
            />
        </>
    );
}

FacilityDetailsClaimedInfo.defaultProps = {
    data: null,
};

FacilityDetailsClaimedInfo.propTypes = {
    data: shape({
        id: number.isRequired,
        facility: shape({
            description: string.isRequired,
            name_english: string.isRequired,
            address: string.isRequired,
            website: string,
            country: string,
            phone_number: string,
            minimum_order: string,
            average_lead_time: string.isRequired,
            parent_company: shape({
                id: number.isRequired,
                name: string.isRequired,
            }),
        }).isRequired,
        contact: shape({
            name: string.isRequired,
            email: string.isRequired,
        }),
        office: shape({
            name: string.isRequired,
            address: string.isRequired,
            country: string,
            phone_number: string.isRequired,
        }),
    }),
};
