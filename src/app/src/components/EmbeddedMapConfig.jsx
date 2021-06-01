import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { func, shape, string, bool } from 'prop-types';

import { userPropType } from '../util/propTypes';
import { getEmbeddedMapSrc } from '../util/util';
import { EmbeddedMapInfoLink } from '../util/constants';

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
    if (!user.embed_level) return <EmbeddedMapUnauthorized />;

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
            <Typography paragraph>
                Generate a customized OAR Embedded Map for your website.
            </Typography>
            <Typography paragraph>
                To begin,{' '}
                <a
                    href="https://openapparel.org/contribute"
                    className="inline-link"
                >
                    contribute your supplier data
                </a>{' '}
                (via upload or API) to the OAR with all of the data fields you
                wish to have displayed on your map using the template supplied
                to you by the OAR Team.{' '}
                <strong>
                    This list must include any additional data points you would
                    like to display on your customized map, such as facility
                    type, number of workers etc.
                </strong>{' '}
                Those fields will then populate below. The Embedded Map will
                display all facilities included in your lists.
            </Typography>
            <Typography paragraph>
                Adjust the below settings to your liking, such as the ordering
                of the data points. You can turn individual data points on and
                off as you wish.
            </Typography>
            <Typography paragraph>
                Once complete, copy the Embed Code to add to your website.
            </Typography>
            <Typography paragraph style={{ width: '100%' }}>
                <strong>Have questions?</strong> Check out the FAQs on our{' '}
                <a href={EmbeddedMapInfoLink} className="inline-link">
                    Embedded Map info page
                </a>{' '}
                or email{' '}
                <a href="mailto:info@openapparel.org" className="inline-link">
                    info@openapparel.org
                </a>
                .
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
            <Grid item xs={6} style={styles.code}>
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
