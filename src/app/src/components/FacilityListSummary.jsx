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
            <a
                style={facilityListSummaryStyles.nameStyles}
                href={`/?contributors=${contributor}&lists=${id}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {name}
            </a>
            <p style={facilityListSummaryStyles.descriptionStyles}>{description}</p>
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
