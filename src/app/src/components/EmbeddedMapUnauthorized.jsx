import React from 'react';
import Typography from '@material-ui/core/Typography';
import { EmbeddedMapInfoLink } from '../util/constants';
import AppGrid from './AppGrid';

const styles = {
    container: {
        marginBottom: '200px',
    },
};

function EmbeddedMapUnauthorized() {
    return (
        <AppGrid style={styles.container} title="">
            <Typography paragraph>
                Looking to display your supplier data on your website?
            </Typography>
            <Typography paragraph style={{ width: '100%' }}>
                The Open Apparel registry offers an easy-to-use embedded map
                option for your website.
            </Typography>
            <Typography paragraph>
                To activate this paid-for feature, check out the{' '}
                <a href={EmbeddedMapInfoLink}>OAR Embedded Map</a> page on our
                website for packages and pricing options.
            </Typography>
            <Typography paragraph>
                Once you have activated it, your OAR Embedded Map Settings will
                appear on this tab.
            </Typography>
        </AppGrid>
    );
}

export default EmbeddedMapUnauthorized;
