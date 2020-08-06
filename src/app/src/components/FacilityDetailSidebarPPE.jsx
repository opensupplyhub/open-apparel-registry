import React from 'react';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';

import { PPE_FIELD_NAMES } from '../util/constants';

const FacilityDetailSidebarPPE = ({ properties }) => {
    const ppeFields = pickBy(pick(properties, PPE_FIELD_NAMES), identity);
    const hasPPEValues = !Object.values(ppeFields).every(isEmpty);

    return hasPPEValues
        ? (
            <div className="control-panel__group">
                <h1 className="control-panel__heading">
                    PPE Details:
                </h1>
                <div className="control-panel__body">
                    {!isEmpty(ppeFields.ppe_product_types) ? (
                        <div style={{ marginBottom: '5px' }}>
                            Product Types
                            <ul>
                                {
                                    ppeFields.ppe_product_types.map(
                                        t => <li key={t}>{t}</li>,
                                    )
                                }
                            </ul>
                        </div>
                    ) : null}

                    {ppeFields.ppe_contact_phone ? (
                        <div style={{ marginBottom: '5px' }}>
                            Contact Phone: {ppeFields.ppe_contact_phone}
                        </div>
                    ) : null}

                    {ppeFields.ppe_contact_email ? (
                        <div style={{ marginBottom: '5px' }}>
                            Contact Email:{' '}
                            <a
                                href={
                                    `mailto:${
                                        ppeFields.ppe_contact_email
                                    }?subject=PPE Information`}
                            >
                                {ppeFields.ppe_contact_email}
                            </a>
                        </div>
                    ) : null}

                    {ppeFields.ppe_website ? (
                        <div style={{ marginBottom: '5px' }}>
                            <a
                                href={ppeFields.ppe_website}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Website
                            </a>
                        </div>
                    ) : null}
                </div>
            </div>
        ) : null;
};

export default FacilityDetailSidebarPPE;
