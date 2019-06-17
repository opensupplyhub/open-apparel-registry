import React from 'react';
import { number, string, shape } from 'prop-types';
import trim from 'lodash/trim';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

import { aboutClaimedFacilitiesRoute } from '../util/constants';

const ClaimInfoSection = ({ label, value }) =>
    trim(value) && (
        <div className="control-panel__group">
            <h1 className="control-panel__heading">{label}</h1>
            <p
                className="control-panel__body"
                style={{ whiteSpace: 'pre-line' }}
            >
                {value}
            </p>
        </div>
    );

export default function FacilityDetailsSidebarClaimedInfo({
    data,
}) {
    if (!data) {
        return null;
    }

    const {
        facility,
        contact,
        office,
    } = data;

    const facilitySection = (
        <>
            <Typography variant="title">
                Claimed Facility Info
            </Typography>
            <div className="control-panel__group">
                <p>
                    OAR staff has verified that the claimant is connected to the
                    facility but has not verified the claimed facility details
                    displayed below.
                </p>
                <Link
                    to={aboutClaimedFacilitiesRoute}
                    href={aboutClaimedFacilitiesRoute}
                    className="link-underline small"
                    style={{ fontSize: '16px' }}
                >
                    Learn more about claimed facilities
                </Link>
            </div>
            <ClaimInfoSection
                label="Name"
                value={facility.name}
            />

            <ClaimInfoSection
                label="Address"
                value={facility.address}
            />

            <ClaimInfoSection
                label="Description"
                value={facility.description}
            />
            <ClaimInfoSection
                value={facility.website}
                label="Website"
            />
            <ClaimInfoSection
                value={facility.phone_number}
                label="Phone Number"
            />
            <ClaimInfoSection
                value={facility.facility_minimum_order_quantity}
                label="Minimum Order"
            />
            <ClaimInfoSection
                value={facility.facility_average_lead_time}
                label="Average Lead Time"
            />
        </>
    );

    const contactSection = contact && (
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
    );

    const officeSection = office && (
        <>
            <ClaimInfoSection
                value={office.name}
                label="Office Name"
            />
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
            <hr />
            {facilitySection}
            {contactSection}
            {officeSection}
        </>
    );
}

FacilityDetailsSidebarClaimedInfo.defaultProps = {
    data: null,
};

FacilityDetailsSidebarClaimedInfo.propTypes = {
    data: shape({
        id: number.isRequired,
        facility: shape({
            description: string.isRequired,
            name: string.isRequired,
            address: string.isRequired,
            website: string.isRequired,
            country: string.isRequired,
            phone_number: string,
            minimum_order: string,
            average_lead_time: string.isRequired,
        }).isRequired,
        contact: shape({
            name: string.isRequired,
            email: string.isRequired,
        }),
        office: shape({
            name: string.isRequired,
            address: string.isRequired,
            country: string.isRequired,
            phone_number: string.isRequired,
        }),
    }),
};
