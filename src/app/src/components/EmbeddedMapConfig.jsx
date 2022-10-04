import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { func, shape, string, bool } from 'prop-types';

import { userPropType } from '../util/propTypes';
import { getEmbeddedMapSrc } from '../util/util';
import {
    EmbeddedMapInfoLink,
    minimum100PercentWidthEmbedHeight,
} from '../util/constants';

import AppGrid from './AppGrid';
import EmbeddedMapFieldsConfig from './EmbeddedMapFieldsConfig';
import EmbeddedMapThemeConfig from './EmbeddedMapThemeConfig';
import EmbeddedMapSizeConfig from './EmbeddedMapSizeConfig';
import EmbeddedMapCode from './EmbeddedMapCode';
import EmbeddedMapUnauthorized from './EmbeddedMapUnauthorized';

const styles = {
    container: {
        marginBottom: '200px',
    },
    section: {
        marginTop: '40px',
    },
    previewHeader: {
        marginBottom: '20px',
        color: 'rgb(0, 0, 0)',
        fontSize: '24px',
    },
    code: {
        padding: '20px',
        minWidth: '300px',
    },
};

// This must be kept in sync with createIFrameHTML in util.js
// We use a separate function to avoid using dangerouslySetInnerHTML
const renderEmbeddedMap = ({ fullWidth, mapSettings, height, width }) =>
    fullWidth ? (
        <div>
            <style>
                {`\
                #oar-embed-0d4dc3a7-e3cd-4acc-88f0-422f5aeefa48 {\
                    position: relative;\
                    padding-top: ${height}%;\
                }\
                @media (max-width: 600px) { /* mobile breakpoint */\
                    #oar-embed-0d4dc3a7-e3cd-4acc-88f0-422f5aeefa48 {\
                        padding-top: ${minimum100PercentWidthEmbedHeight}\
                    }\
                }`}
            </style>
            <div id="oar-embed-0d4dc3a7-e3cd-4acc-88f0-422f5aeefa48">
                <iframe
                    src={getEmbeddedMapSrc(mapSettings)}
                    frameBorder="0"
                    allowFullScreen
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                    title="embedded-map"
                />
            </div>
        </div>
    ) : (
        <iframe
            src={getEmbeddedMapSrc(mapSettings)}
            frameBorder="0"
            style={{
                width: `${width}px`,
                height: `${height}px`,
            }}
            title="embedded-map"
        />
    );

function EmbeddedMapConfig({
    user,
    embedConfig: {
        color,
        font,
        width,
        fullWidth,
        textSearchLabel,
        height,
        preferContributorName,
        mapStyle,
    },
    setEmbedConfig,
    fields,
    setFields,
    errors,
    timestamp,
}) {
    if (!user.embed_level) return <EmbeddedMapUnauthorized isSettings />;

    const updateEmbedConfig = field => value =>
        setEmbedConfig(config => ({
            ...config,
            [field]: value,
        }));

    const minimumConfigurationIsComplete = !!(width && height && color);

    const mapSettings = {
        width,
        height,
        fullWidth,
        contributor: [user?.contributor_id],
        timestamp,
        minimumConfigurationIsComplete,
    };

    return (
        <AppGrid style={styles.container} title="">
            <Typography paragraph>
                Generate a customized OS Hub Embedded Map for your website.
            </Typography>
            <Typography paragraph>
                To begin,{' '}
                <a
                    href="https://openapparel.org/contribute"
                    className="inline-link"
                >
                    contribute your supplier data
                </a>{' '}
                (via upload or API) to the OS Hub with all of the data fields
                you wish to have displayed on your map using the template
                supplied to you by the OS Hub Team.{' '}
                <strong>
                    This list must include any additional data points you would
                    like to display on your customized map, such as facility
                    type, number of workers etc.
                </strong>{' '}
                The Embedded Map will display all facilities included in your
                lists.
            </Typography>
            <Typography paragraph>
                Adjust the below settings to your liking, such as the map color
                and size. Once complete, copy the Embed Code to add to your
                website.
            </Typography>
            <Typography paragraph style={{ width: '100%' }}>
                <strong>Have questions?</strong> Check out the FAQs on our{' '}
                <a
                    href={EmbeddedMapInfoLink}
                    className="inline-link"
                    target="_blank"
                    rel="noreferrer"
                >
                    Embedded Map info page
                </a>{' '}
                or email{' '}
                <a href="mailto:info@openapparel.org" className="inline-link">
                    info@openapparel.org
                </a>
                .
            </Typography>
            <Grid container direction="row-reverse">
                <Grid item xs={12} md={5} lg={6} style={styles.code}>
                    <EmbeddedMapCode {...mapSettings} />
                </Grid>
                <Grid item xs={12} md={7} lg={6}>
                    <EmbeddedMapFieldsConfig
                        fields={fields}
                        setFields={setFields}
                        preferContributorName={preferContributorName}
                        setPreferContributorName={updateEmbedConfig(
                            'preferContributorName',
                        )}
                        textSearchLabel={textSearchLabel}
                        setTextSearchLabel={updateEmbedConfig(
                            'textSearchLabel',
                        )}
                        anyFieldSearchable={fields.some(
                            field => field.searchable,
                        )}
                        errors={errors}
                        userEmbedLevel={user.embed_level}
                    />
                    <EmbeddedMapThemeConfig
                        color={color}
                        setColor={updateEmbedConfig('color')}
                        font={font}
                        setFont={updateEmbedConfig('font')}
                        mapStyle={mapStyle}
                        setMapStyle={updateEmbedConfig('mapStyle')}
                        errors={errors}
                        embedLevel={user.embed_level}
                    />
                    <EmbeddedMapSizeConfig
                        width={width}
                        setWidth={updateEmbedConfig('width')}
                        height={height}
                        setHeight={updateEmbedConfig('height')}
                        fullWidth={fullWidth}
                        setFullWidth={updateEmbedConfig('fullWidth')}
                    />
                </Grid>
            </Grid>
            <Grid
                item
                xs={12}
                style={{ ...styles.section, minHeight: '500px' }}
            >
                <Typography style={styles.previewHeader}>Preview</Typography>
                {minimumConfigurationIsComplete ? (
                    renderEmbeddedMap({ fullWidth, mapSettings, height, width })
                ) : (
                    <Typography paragraph>
                        Choose a color and enter a width and height to see a
                        preview.
                    </Typography>
                )}
            </Grid>
        </AppGrid>
    );
}

EmbeddedMapConfig.defaultProps = {
    user: null,
};

EmbeddedMapConfig.propTypes = {
    user: userPropType,
    embedConfig: shape({
        color: string.isRequired,
        font: string.isRequired,
        width: string.isRequired,
        height: string.isRequired,
        fullWidth: bool.isRequired,
        textSearchLabel: string.isRequired,
        mapStyle: string.isRequired,
    }).isRequired,
    setEmbedConfig: func.isRequired,
    setFields: func.isRequired,
};

export default EmbeddedMapConfig;
