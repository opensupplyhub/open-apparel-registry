import React from 'react';
import { string } from 'prop-types';

const facilityListSummaryStyles = Object.freeze({
    nameStyles: Object.freeze({
        color: '#000 !important',
        fontWeight: 500,
        fontSize: '20px',
        margin: '8px 0',
    }),
    descriptionStyles: Object.freeze({
        color: '#000 !important',
        marginBottom: '24px',
    }),
});

function FacilityListSummary({ name, description, id, contributor }) {
    return (
        <div>
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <p style={facilityListSummaryStyles.nameStyles}>{name}</p>
                <a
                    href={`/?contributors=${contributor}&lists=${id}`}
                    rel="noopener noreferrer"
                    style={{
                        color: '#8428FA',
                        fontSize: '18px',
                        fontWeight: '500',
                        lineHeight: '21px',
                        textDecoration: 'none',
                    }}
                >
                    {'View facilities >'}
                </a>
            </div>
            <p style={facilityListSummaryStyles.descriptionStyles}>
                {description}
            </p>
            <hr color="#E7E8EA" />
        </div>
    );
}

FacilityListSummary.defaultProps = {
    description: '',
};

FacilityListSummary.propTypes = {
    name: string.isRequired,
    description: string,
};

export default FacilityListSummary;
