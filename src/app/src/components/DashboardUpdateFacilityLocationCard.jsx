import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import get from 'lodash/get';
import round from 'lodash/round';
import { distance, point } from '@turf/turf';
import ReactSelect from 'react-select';

import {
    facilityPropType,
    contributorOptionsPropType,
    contributorOptionPropType,
} from '../util/propTypes';

import FacilityDetailsStaticMap from './FacilityDetailsStaticMap';

const styles = Object.freeze({
    cardStyles: Object.freeze({
        width: '45%',
        margin: '0 20px',
        padding: '10px',
    }),
    textSectionStyles: Object.freeze({
        padding: '10px 20px',
    }),
    cardActionsStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
    }),
    cardContentStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        padding: '0 20px',
    }),
    labelStyles: Object.freeze({
        fontSize: '16px',
        fontWeight: '700',
        padding: '5px 0 0',
    }),
    fieldStyles: Object.freeze({
        fontSize: '16px',
        padding: '0 0 5px',
    }),
    listStyles: Object.freeze({
        margin: '0 5px',
    }),
    mapStyles: Object.freeze({
        padding: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    }),
    osIDStyles: Object.freeze({
        fontSize: '18px',
    }),
    errorStyles: Object.freeze({
        color: 'red',
    }),
    infoContainerStyles: Object.freeze({
        marging: '10px 0',
    }),
    selectStyles: Object.freeze({
        container: provided =>
            Object.freeze({
                ...provided,
                width: '100%',
            }),
    }),
    optionalFieldsStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    }),
    descriptionStyles: Object.freeze({
        height: '100%',
        margin: '1rem 0',
    }),
});

export default function DashboardUpdateLocationCard({
    newLocation,
    notes,
    fetching,
    error,
    title,
    updateLat,
    updateLng,
    updateNotes,
    facility,
    contributorOptions,
    contributor,
    updateContributor,
}) {
    const cardContent = (() => {
        if (fetching) {
            return <CircularProgress />;
        }

        if (error && error.length) {
            return (
                <ul style={styles.errorStyles}>
                    {error.map(err => (
                        <li key={err}>
                            <span style={styles.errorStyles}>{err}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        const newFacility =
            facility &&
            newLocation &&
            !Number.isNaN(parseFloat(newLocation.lat)) &&
            !Number.isNaN(parseFloat(newLocation.lng)) &&
            Object.assign({}, facility, {
                geometry: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(newLocation.lng),
                        parseFloat(newLocation.lat),
                    ],
                },
            });

        const distanceBetweenLocations =
            newFacility &&
            distance(
                point(facility.geometry.coordinates),
                point(newFacility.geometry.coordinates),
            );

        return (
            <>
                {newFacility && (
                    <>
                        <div style={styles.mapStyles}>
                            <FacilityDetailsStaticMap data={newFacility} />
                        </div>
                        <div style={styles.infoContainerStyles}>
                            <Typography style={styles.labelStyles}>
                                Distance From Current Location
                            </Typography>
                            <Typography style={styles.fieldStyles}>
                                {`${round(distanceBetweenLocations, 2)} km`}
                            </Typography>
                        </div>
                    </>
                )}
            </>
        );
    })();

    return (
        <>
            <Card style={styles.cardStyles}>
                <Typography variant="title" style={styles.textSectionStyles}>
                    {title}
                </Typography>
                <CardActions>
                    <TextField
                        variant="outlined"
                        placeholder="Longitude"
                        value={get(newLocation, 'lng', '') || ''}
                        onChange={updateLng}
                    />
                    <TextField
                        variant="outlined"
                        placeholder="Latitude"
                        value={get(newLocation, 'lat', '') || ''}
                        onChange={updateLat}
                    />
                </CardActions>
                <CardContent style={styles.cardContentStyles}>
                    {cardContent}
                </CardContent>
                <CardActions>
                    <div style={styles.optionalFieldsStyles}>
                        <ReactSelect
                            styles={styles.selectStyles}
                            isClearable
                            id="contributors"
                            name="contributors"
                            placeholder="Organization (optional)"
                            className="basic-multi-select notranslate"
                            classNamePrefix="select"
                            options={contributorOptions}
                            value={contributor}
                            onChange={updateContributor}
                        />
                        <TextField
                            variant="outlined"
                            multiline
                            rows={20}
                            value={notes || ''}
                            placeholder="Notes (optional)"
                            onChange={updateNotes}
                            style={styles.descriptionStyles}
                        />
                    </div>
                </CardActions>
            </Card>
        </>
    );
}

DashboardUpdateLocationCard.defaultProps = {
    error: null,
    facility: null,
    contributor: null,
};

DashboardUpdateLocationCard.propTypes = {
    fetching: bool.isRequired,
    error: arrayOf(string),
    title: string.isRequired,
    facility: facilityPropType,
    notes: string.isRequired,
    newLocation: shape({
        lat: string,
        lng: string,
    }).isRequired,
    updateLat: func.isRequired,
    updateLng: func.isRequired,
    updateNotes: func.isRequired,
    contributorOptions: contributorOptionsPropType.isRequired,
    contributor: contributorOptionPropType,
    updateContributor: func.isRequired,
};
