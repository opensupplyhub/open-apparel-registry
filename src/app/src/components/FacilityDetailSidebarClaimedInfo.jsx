import React from 'react';
import { number, string, shape } from 'prop-types';
import trim from 'lodash/trim';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import identity from 'lodash/identity';

import { aboutClaimedFacilitiesRoute } from '../util/constants';

import {
    makeProfileRouteLink,
    addProtocolToWebsiteURLIfMissing,
} from '../util/util';

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

export default function FacilityDetailsSidebarClaimedInfo({ data }) {
    if (!data) {
        return null;
    }

    const { facility, contact, office } = data;

    const facilitySection = (
        <>
            <Typography variant="title">Claimed Facility Info</Typography>
            <div className="control-panel__group">
                <p>
                    Please note: The OAR team <strong>has only</strong> verified
                    that the person claiming a facility profile is connected to
                    that facility. The OAR team <strong>has not</strong>{' '}
                    verified any additional details added to a facility profile,
                    e.g. certifications, production capabilities etc. Users
                    interested in those details will need to carry out their own
                    due diligence checks.
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
                label="Name (English language)"
                value={facility.name_english}
            />
            <ClaimInfoSection
                label="Name (native language)"
                value={facility.name_native_language}
            />
            <ClaimInfoSection label="Address" value={facility.address} />
            <ClaimInfoSection
                label="Parent Company / Supplier Group"
                value={
                    facility.parent_company ? (
                        <Link
                            to={makeProfileRouteLink(
                                get(facility, 'parent_company.id', null),
                            )}
                            href={makeProfileRouteLink(
                                get(facility, 'parent_company.id', null),
                            )}
                        >
                            {get(facility, 'parent_company.name', null)}
                        </Link>
                    ) : null
                }
            />
            <ClaimInfoSection
                label="Description"
                value={facility.description}
            />
            <ClaimInfoSection
                label="Facility Type"
                value={facility.facility_type}
            />
            <ClaimInfoSection
                label="Other Facility Type"
                value={facility.other_facility_type}
            />
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
                value={facility.workers_count}
                label="Number of workers"
            />
            <ClaimInfoSection
                value={facility.female_workers_percentage}
                label="Percentage of female workers"
            />
            <ClaimInfoSection
                label="Affiliations"
                value={
                    facility.affiliations &&
                    facility.affiliations.length && (
                        <ul>
                            {orderBy(facility.affiliations, identity).map(
                                affiliation => (
                                    <li key={affiliation}>{affiliation}</li>
                                ),
                            )}
                        </ul>
                    )
                }
            />
            <ClaimInfoSection
                label="Certifications/Standards/Regulations"
                value={
                    facility.certifications &&
                    facility.certifications.length && (
                        <ul>
                            {orderBy(facility.certifications, identity).map(
                                certification => (
                                    <li key={certification}>{certification}</li>
                                ),
                            )}
                        </ul>
                    )
                }
            />
            <ClaimInfoSection
                label="Product Types"
                value={
                    facility.product_types &&
                    facility.product_types.length && (
                        <ul>
                            {orderBy(facility.product_types, identity).map(
                                productType => (
                                    <li key={productType}>{productType}</li>
                                ),
                            )}
                        </ul>
                    )
                }
            />
            <ClaimInfoSection
                label="Production Types"
                value={
                    facility.production_types &&
                    facility.production_types.length && (
                        <ul>
                            {orderBy(facility.production_types, identity).map(
                                productionType => (
                                    <li key={productionType}>
                                        {productionType}
                                    </li>
                                ),
                            )}
                        </ul>
                    )
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
            <hr />
            {facilitySection}
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
