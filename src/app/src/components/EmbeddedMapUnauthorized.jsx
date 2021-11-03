import React from 'react';
import Typography from '@material-ui/core/Typography';
import { EmbeddedMapInfoLink } from '../util/constants';
import AppGrid from './AppGrid';

const styles = {
    container: {
        marginBottom: '200px',
    },
    text: {
        width: '100%',
    },
};

function EmbeddedMapUnauthorized({ isSettings, error = [] }) {
    return (
        <AppGrid style={styles.container} title="">
            {error.map(e => (
                <Typography style={styles.text} paragraph key={e}>
                    <strong>Error:</strong> {e}
                </Typography>
            ))}
            <Typography paragraph>
                Looking to display your supplier data on your website?
            </Typography>
            <Typography paragraph style={styles.text}>
                The Open Apparel registry offers an easy-to-use embedded map
                option for your website.
            </Typography>
            <Typography paragraph>
                To activate this paid-for feature, check out the{' '}
                <a href={EmbeddedMapInfoLink} target="_blank" rel="noreferrer">
                    OAR Embedded Map
                </a>{' '}
                page on our website for packages and pricing options.
            </Typography>
            {isSettings && (
                <Typography paragraph>
                    Once Embedded Map has been activated for your account, your
                    OAR Embedded Map Settings will appear on this tab.
                </Typography>
            )}
        </AppGrid>
    );
}

export default EmbeddedMapUnauthorized;
