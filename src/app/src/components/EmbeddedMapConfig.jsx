import React, { useState } from 'react';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

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

function EmbeddedMapConfig({ user }) {
    // TODO: Replace with backend configuration data
    const [fields, setFields] = useState([
        { included: true, label: 'Years active', value: 'years_active' },
        { included: true, label: 'num_widgets', value: 'num_widgets' },
        {
            included: false,
            label: 'some_other_field_name',
            value: 'some_other_field_name',
        },
    ]);
    const [
        includeOtherContributorFields,
        setIncludeOtherContributorFields,
    ] = useState(true);
    const [color, setColor] = useState('#C74444');
    const [font, setFont] = useState(null);
    const [width, setWidth] = useState('780');
    const [fullWidth, setFullWidth] = useState(false);
    const [height, setHeight] = useState('440');

    const mapSettings = {
        color,
        font,
        width,
        height,
        fullWidth,
        contributor: [user?.id],
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
                    includeOtherContributorFields={
                        includeOtherContributorFields
                    }
                    setIncludeOtherContributorFields={
                        setIncludeOtherContributorFields
                    }
                />
                <EmbeddedMapThemeConfig
                    color={color}
                    setColor={setColor}
                    font={font}
                    setFont={setFont}
                />
                <EmbeddedMapSizeConfig
                    width={width}
                    setWidth={setWidth}
                    height={height}
                    setHeight={setHeight}
                    fullWidth={fullWidth}
                    setFullWidth={setFullWidth}
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
};

function mapStateToProps({
    auth: {
        user: { user },
    },
}) {
    return {
        user,
    };
}

export default connect(mapStateToProps)(EmbeddedMapConfig);
