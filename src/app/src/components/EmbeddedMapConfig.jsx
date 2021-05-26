import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { func, shape, string, bool } from 'prop-types';

import { userPropType } from '../util/propTypes';
import { getEmbeddedMapSrc } from '../util/util';
import AppGrid from './AppGrid';
import EmbeddedMapFieldsConfig from './EmbeddedMapFieldsConfig';
import EmbeddedMapThemeConfig from './EmbeddedMapThemeConfig';
import EmbeddedMapSizeConfig from './EmbeddedMapSizeConfig';
import EmbeddedMapCode from './EmbeddedMapCode';

const styles = {
    container: {
        marginBottom: '200px',
    },
    section: {
        marginTop: '30px',
    },
    sectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '18px',
        margin: '10px 0',
    },
    previewHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '24px',
    },
};

const renderEmbeddedMap = ({ fullWidth, mapSettings, height, width }) =>
    fullWidth ? (
        <div>
            <div
                style={{
                    position: 'relative',
                    paddingTop: `${height}%`,
                }}
            >
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
    embedConfig: { color, font, width, fullWidth, height },
    setEmbedConfig,
    fields,
    setFields,
    errors,
    timestamp,
}) {
    const updateEmbedConfig = field => value =>
        setEmbedConfig(config => ({
            ...config,
            [field]: value,
        }));

    const mapSettings = {
        width,
        height,
        fullWidth,
        contributor: [user?.id],
        timestamp,
    };

    return (
        <AppGrid style={styles.container} title="">
            <Typography>
                Generate a custom OAR map to embed in your website. The map will
                include all facilities you have contributed.
            </Typography>
            <Grid item xs={6}>
                {user.embed_level === 3 ? (
                    <EmbeddedMapFieldsConfig
                        fields={fields}
                        setFields={setFields}
                        errors={errors}
                    />
                ) : null}
                <EmbeddedMapThemeConfig
                    color={color}
                    setColor={updateEmbedConfig('color')}
                    font={font}
                    setFont={updateEmbedConfig('font')}
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
                    errors={errors}
                />
            </Grid>
            <Grid item xs={6} style={{ ...styles.section, padding: '20px' }}>
                <EmbeddedMapCode {...mapSettings} />
            </Grid>
            <Grid
                item
                xs={12}
                style={{ ...styles.section, minHeight: '500px' }}
            >
                <Typography style={styles.previewHeader}>Preview</Typography>
                {renderEmbeddedMap({ fullWidth, mapSettings, height, width })}
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
    }).isRequired,
    setEmbedConfig: func.isRequired,
    setFields: func.isRequired,
};

export default EmbeddedMapConfig;
