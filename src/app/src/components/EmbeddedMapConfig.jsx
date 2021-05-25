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
                <EmbeddedMapFieldsConfig
                    fields={fields}
                    setFields={setFields}
                    errors={errors}
                />
                <EmbeddedMapThemeConfig
                    color={color}
                    setColor={updateEmbedConfig('color')}
                    font={font}
                    setFont={updateEmbedConfig('font')}
                    errors={errors}
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
                <iframe
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    width={width}
                    height={height}
                    type="text/html"
                    src={getEmbeddedMapSrc(mapSettings)}
                    title="embedded-map"
                />
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
