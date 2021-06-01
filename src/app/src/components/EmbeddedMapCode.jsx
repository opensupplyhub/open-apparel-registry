import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { string, bool } from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import noop from 'lodash/noop';
import { toast } from 'react-toastify';

import { createIFrameHTML } from '../util/util';
import { OARFont } from '../util/constants';

const styles = {
    sectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '20px',
    },
    embedContainer: {
        background: 'rgb(240, 240, 240)',
        borderRadius: '0px',
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
        width: 'auto',
        minHeight: '140px',
        color: 'rgb(0, 0, 0)',
        fontFamily: OARFont,
        padding: '10px',
    },
    embedButton: {
        background: 'rgb(0, 0, 0)',
        borderRadius: 0,
        marginTop: '20px',
        padding: '12px 0',
        color: 'white',
        fontSize: '16px',
        textTransform: 'none',
    },
};

function EmbeddedMapCode({ width, height, fullWidth, contributor }) {
    const mapSettings = {
        width,
        height,
        fullWidth,
        contributor,
    };

    return (
        <div style={styles.embedContainer}>
            <Typography style={styles.sectionHeader}>
                Embed code for your website
            </Typography>
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

EmbeddedMapCode.propTypes = {
    width: string.isRequired,
    height: string.isRequired,
    fullWidth: bool.isRequired,
};

export default EmbeddedMapCode;
