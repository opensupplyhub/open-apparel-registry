import React from 'react';
import { bool, func, string } from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputAdornment from '@material-ui/core/InputAdornment';

import { DEFAULT_WIDTH } from '../util/embeddedMap';

const styles = {
    section: {
        marginTop: '30px',
    },
    sectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '18px',
        margin: '10px 0',
    },
    subsection: {
        marginTop: '20px',
    },
    sizeInput: {
        width: '150px',
    },
    sizeCheckbox: {
        padding: '10px',
    },
    contentContainer: { display: 'flex', alignItems: 'flex-start' },
    widthContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginRight: '40px',
        alignItems: 'center',
    },
};

function EmbeddedMapSizeConfig({
    width,
    setWidth,
    height,
    setHeight,
    fullWidth,
    setFullWidth,
    errors,
}) {
    const updateFullWidth = isFullWidth => {
        if (isFullWidth) {
            let aspectRatio = 75;
            if (height > 0 && width > 0) {
                aspectRatio = (height / width) * 100;
            }
            setFullWidth(true);
            setHeight(aspectRatio);
        } else {
            setFullWidth(false);
            setWidth(DEFAULT_WIDTH);
            setHeight((DEFAULT_WIDTH * height) / 100);
        }
    };

    return (
        <div style={styles.section}>
            <Typography style={styles.sectionHeader}>Size</Typography>
            {errors?.width && (
                <Typography style={{ color: 'red' }}>
                    Error: {errors.width.join(', ')}
                </Typography>
            )}
            {errors?.height && (
                <Typography style={{ color: 'red' }}>
                    Error: {errors.height.join(', ')}
                </Typography>
            )}
            <div style={styles.contentContainer}>
                <div style={styles.widthContainer}>
                    {!fullWidth && (
                        <TextField
                            id="width"
                            label="Width"
                            value={width}
                            onChange={e => setWidth(e.target.value)}
                            margin="normal"
                            type="number"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        px
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            style={styles.sizeInput}
                            disabled={fullWidth}
                        />
                    )}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={fullWidth}
                                onChange={e =>
                                    updateFullWidth(e.target.checked)
                                }
                                value="fullWidth"
                            />
                        }
                        label={fullWidth ? '100% Width' : '100%'}
                        style={styles.sizeCheckbox}
                    />
                </div>
                <div>
                    <TextField
                        id="height"
                        label="Height"
                        value={height}
                        onChange={e => setHeight(e.target.value)}
                        margin="normal"
                        type="number"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {fullWidth ? '%' : 'px'}
                                </InputAdornment>
                            ),
                        }}
                        variant="outlined"
                        helperText={
                            fullWidth &&
                            'Specify aspect ratio by entering % of width'
                        }
                        style={styles.sizeInput}
                    />
                </div>
            </div>
        </div>
    );
}

EmbeddedMapSizeConfig.propTypes = {
    width: string.isRequired,
    setWidth: func.isRequired,
    height: string.isRequired,
    setHeight: func.isRequired,
    fullWidth: bool.isRequired,
    setFullWidth: func.isRequired,
};

export default EmbeddedMapSizeConfig;
