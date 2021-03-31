import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { shape, string, bool } from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import noop from 'lodash/noop';
import { toast } from 'react-toastify';

import { createIFrameHTML } from '../util/util';

const styles = {
    sectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '18px',
        margin: '10px 0',
    },
    embedContainer: {
        background: 'rgb(240, 240, 240)',
        borderRadius: '0px',
        minHeight: '278px',
        width: '360px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
    },
    embedTextBox: {
        background: 'rgb(255, 255, 255)',
        borderRadius: 0,
        border: '1px solid rgb(214, 216, 221)',
        flex: 1,
        width: '90%',
        marginTop: '20px',
        color: 'rgb(0, 0, 0)',
        fontFamily: 'ff-tisa-sans-web-pro,sans-serif',
        padding: '10px',
    },
    embedButton: {
        background: 'rgb(0, 0, 0)',
        borderRadius: 0,
        marginTop: '10px',
        color: 'white',
    },
};

function EmbeddedMapCode({
    color,
    font,
    width,
    height,
    fullWidth,
    contributor,
}) {
    const mapSettings = {
        color,
        font,
        width,
        height,
        fullWidth,
        contributor,
    };

    return (
        <div style={styles.embedContainer}>
            <Typography style={styles.sectionHeader}>Embed code</Typography>
            <Typography style={styles.embedTextBox}>
                {createIFrameHTML(mapSettings)}
            </Typography>
            <CopyToClipboard
                text={createIFrameHTML(mapSettings)}
                onCopy={() => toast('Copied code to clipboard')}
            >
                <Button
                    variant="contained"
                    style={styles.embedButton}
                    onClick={noop}
                >
                    Copy to clipboard
                </Button>
            </CopyToClipboard>
        </div>
    );
}

EmbeddedMapCode.defaultProps = {
    font: null,
};

EmbeddedMapCode.propTypes = {
    width: string.isRequired,
    height: string.isRequired,
    fullWidth: bool.isRequired,
    color: string.isRequired,
    font: shape({
        label: string,
        value: string,
    }),
};

export default EmbeddedMapCode;
