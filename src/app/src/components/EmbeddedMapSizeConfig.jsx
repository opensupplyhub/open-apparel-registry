import React from 'react';
import { bool, func, string } from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputAdornment from '@material-ui/core/InputAdornment';

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
        margin: '0 200px 0 10px',
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
}) {
    return (
        <div style={styles.section}>
            <Typography style={styles.sectionHeader}>Size</Typography>
            <div style={styles.contentContainer}>
                <div style={styles.widthContainer}>
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={fullWidth}
                                onChange={e => setFullWidth(e.target.checked)}
                                value="fullWidth"
                            />
                        }
                        label="100%"
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
