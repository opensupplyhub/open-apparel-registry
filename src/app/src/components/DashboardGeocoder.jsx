import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'leaflet/dist/leaflet.css';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import ReactSelect from 'react-select';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import { Map as ReactLeafletMap, ZoomControl, Marker } from 'react-leaflet';
import L from 'leaflet';

import { GOOGLE_CLIENT_SIDE_API_KEY } from '../util/constants.facilitiesMap';

import apiRequest from '../util/apiRequest';
import AppGrid from './AppGrid';
import { fetchCountryOptions } from '../actions/filterOptions';
import { makeDashboardGeocoderURL } from '../util/util';
import { COUNTRY_CODES } from '../util/constants';

const icon = L.icon({
    iconUrl: '/images/selectedmarker.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
});

const styles = {
    container: {
        marginBottom: '60px',
        width: '100%',
        padding: '20px',
    },
    title: {
        paddingBottom: '20px',
    },
    inputLabelStyle: {
        fontSize: '16px',
        fontWeight: 500,
        color: '#000',
        transform: 'translate(0, -8px) scale(1)',
        paddingBottom: '0.5rem',
    },
    input: { width: '100%' },
    mapContainerStyles: {
        height: '500px',
        width: '100%',
        marginTop: '20px',
    },
    prettyPrint: {
        width: '100%',
        overflow: 'scroll',
    },
};

const selectStyles = {
    menu: provided => ({
        ...provided,
        zIndex: 10000,
    }),
};

const ADDRESS = 'ADDRESS';
const COUNTRIES = 'COUNTRIES';

const getCoordinates = results => {
    if (!results || !results.geocoded_point) {
        return null;
    }
    const {
        geocoded_point: { lat, lng },
    } = results;
    return [lat, lng];
};

function DashboardGeocoder({ countryOptions, fetchingOptions, getCountries }) {
    const [country, setCountry] = useState('');
    const [address, setAddress] = useState('');
    const [results, setResults] = useState(null);

    const geocodeAddress = () =>
        apiRequest
            .get(makeDashboardGeocoderURL(), {
                params: {
                    address,
                    country_code: country.value,
                },
            })
            .then(({ data }) => {
                setResults(data);
            })
            .catch(err => setResults(err));

    /* eslint-disable react-hooks/exhaustive-deps */
    // Fetch country options on mount
    useEffect(() => {
        getCountries();
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    const jsonResults = JSON.stringify(results, null, 2);

    const coordinates = getCoordinates(results);

    return (
        <AppGrid title="">
            <Paper style={styles.container}>
                <Typography variant="title" style={styles.title}>
                    Geocode Facility
                </Typography>
                <div>
                    <div className="form__field">
                        <InputLabel
                            shrink={false}
                            htmlFor={COUNTRIES}
                            style={styles.inputLabelStyle}
                        >
                            Country Name
                        </InputLabel>
                        <ReactSelect
                            id={COUNTRIES}
                            name={COUNTRIES}
                            options={countryOptions || []}
                            value={country}
                            onChange={setCountry}
                            disabled={fetchingOptions}
                            styles={selectStyles}
                        />
                    </div>
                    <div className="form__field">
                        <InputLabel
                            shrink={false}
                            htmlFor={ADDRESS}
                            style={styles.inputLabelStyle}
                        >
                            Address
                        </InputLabel>
                        <TextField
                            variant="outlined"
                            onChange={e => setAddress(e.target.value)}
                            value={address}
                            placeholder="Enter an address"
                            style={styles.input}
                            id={COUNTRIES}
                            name={COUNTRIES}
                        />
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={geocodeAddress}
                    >
                        Geocode
                    </Button>
                </div>
                {!!coordinates && (
                    <ReactLeafletMap
                        center={coordinates}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={styles.mapContainerStyles}
                        zoomControl={false}
                        maxBounds={[
                            [-90, -180],
                            [90, 180],
                        ]}
                        worldCopyJump
                    >
                        <Marker position={coordinates} icon={icon} />
                        <ReactLeafletGoogleLayer
                            googleMapsLoaderConf={{
                                KEY: GOOGLE_CLIENT_SIDE_API_KEY,
                                REGION: country.value || COUNTRY_CODES.default,
                                VERSION: '3.51',
                            }}
                            type="roadmap"
                            continuousWorld
                            minZoom={1}
                        />
                        <ZoomControl />
                    </ReactLeafletMap>
                )}
                <div style={styles.prettyPrint}>
                    {results && <pre>{jsonResults}</pre>}
                </div>
            </Paper>
        </AppGrid>
    );
}

function mapStateToProps({
    filterOptions: {
        countries: { data: countryOptions, fetching: fetchingCountries },
    },
}) {
    return {
        countryOptions,
        fetchingOptions: fetchingCountries,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getCountries: () => dispatch(fetchCountryOptions()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardGeocoder);
