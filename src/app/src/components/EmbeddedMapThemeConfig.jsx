import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import Typography from '@material-ui/core/Typography';
import Select from 'react-select';

import { func, string } from 'prop-types';

import { OARFont, OARColor } from '../util/constants';

const styles = {
    section: {
        marginTop: '30px',
    },
    sectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '24px',
        margin: '10px 0',
    },
    subsection: {
        marginTop: '20px',
    },
    subsectionHeader: {
        color: 'rgb(0, 0, 0)',
        fontSize: '15px',
        fontWeight: 'bold',
        margin: '10px 0',
    },
    colorContainer: {
        display: 'flex',
        marginTop: '10px',
        alignItems: 'center',
    },
    radios: {
        display: 'flex',
        flexDirection: 'row',
    },
    radioItem: {
        marginRight: '30px',
    },
    radio: {
        color: 'rgb(0, 0, 0)',
    },
};

const fontOptions = [
    { label: 'OS Hub Website Font', value: OARFont },
    { label: 'Arial', value: 'Arial,Helvetica,sans-serif' },
    { label: 'Tahoma', value: 'Tahoma,Verdana,sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS",Helvetica,sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman",Times,serif' },
    { label: 'Georgia', value: 'Georgia,serif' },
    { label: 'Garamond', value: 'Garamond,serif' },
    { label: 'Courier New', value: '"Courier New",Courier,monospace' },
    { label: 'Brush Script', value: 'Brush Script,cursive' },
    { label: 'Copperplate', value: 'Copperplate,Papyrus,fantasy' },
];

const fontSelectStyles = {
    option: (provided, { data }) => ({
        ...provided,
        fontFamily: data.value,
    }),
    control: provided => ({
        ...provided,
        marginTop: '10px',
    }),
};

function EmbeddedMapThemeConfig({
    color,
    setColor,
    font,
    setFont,
    errors,
    embedLevel,
    mapStyle,
    setMapStyle,
}) {
    const value = fontOptions.find(f => font === f.value) || OARFont;
    return (
        <div style={styles.section}>
            <Typography style={styles.sectionHeader}>Theme</Typography>
            <Typography>
                Availability of theme customization will depend on your Embedded
                Map package.{' '}
            </Typography>
            <div style={styles.subsection}>
                <Typography style={styles.subsectionHeader}>Color</Typography>
                {embedLevel === 1 ? (
                    <>
                        <Typography>
                            Choose the primary color for the embedded map.
                        </Typography>
                        <FormControl style={styles.radios}>
                            <FormControlLabel
                                value="#00000"
                                label="Black"
                                style={styles.radioItem}
                                control={
                                    <Radio
                                        checked={color === '#000000'}
                                        onChange={e => setColor(e.target.value)}
                                        value="#000000"
                                        name="theme-color"
                                        inputProps={{ 'aria-label': 'Black' }}
                                        style={styles.radio}
                                    />
                                }
                            />
                            <FormControlLabel
                                value={OARColor}
                                label="OS Hub Green"
                                style={styles.radioItem}
                                control={
                                    <Radio
                                        checked={color === OARColor}
                                        onChange={e => setColor(e.target.value)}
                                        value={OARColor}
                                        name="theme-color"
                                        inputProps={{
                                            'aria-label': 'OS Hub Green',
                                        }}
                                        style={styles.radio}
                                    />
                                }
                            />
                        </FormControl>
                    </>
                ) : (
                    <>
                        <Typography>
                            Use a color with sufficient contrast against white
                            backgrounds & labels.
                        </Typography>
                        {errors?.color && (
                            <Typography style={{ color: 'red' }}>
                                Error: {errors.color.join(', ')}
                            </Typography>
                        )}
                        <div style={styles.colorContainer}>
                            <input
                                type="color"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                style={{ marginRight: '10px' }}
                            />
                            <Typography>{color}</Typography>
                        </div>
                    </>
                )}
            </div>
            {embedLevel === 3 ? (
                <div style={styles.subsection}>
                    <Typography style={styles.subsectionHeader}>
                        Font
                    </Typography>
                    <Typography>
                        If no font is selected, the OS Hub font will be used.
                    </Typography>
                    {errors?.font && (
                        <Typography style={{ color: 'red' }}>
                            Error: {errors.font.join(', ')}
                        </Typography>
                    )}
                    <Select
                        styles={fontSelectStyles}
                        options={fontOptions}
                        id="font"
                        value={value}
                        onChange={item => setFont(item.value)}
                        placeholder="Select a font"
                    />
                </div>
            ) : null}
            {embedLevel >= 2 ? (
                <div style={styles.subsection}>
                    <Typography style={styles.subsectionHeader}>
                        Map Style
                    </Typography>
                    <Typography>Choose the style for the base map</Typography>
                    <FormControl style={styles.radios}>
                        <FormControlLabel
                            value="default"
                            label="Default"
                            style={styles.radioItem}
                            control={
                                <Radio
                                    checked={mapStyle === 'default'}
                                    onChange={e => setMapStyle(e.target.value)}
                                    value="default"
                                    name="theme-color"
                                    inputProps={{ 'aria-label': 'Default' }}
                                    style={styles.radio}
                                />
                            }
                        />
                        <FormControlLabel
                            value="silver"
                            label="Silver"
                            style={styles.radioItem}
                            control={
                                <Radio
                                    checked={mapStyle === 'silver'}
                                    onChange={e => setMapStyle(e.target.value)}
                                    value="silver"
                                    name="theme-color"
                                    inputProps={{
                                        'aria-label': 'Silver',
                                    }}
                                    style={styles.radio}
                                />
                            }
                        />
                    </FormControl>
                </div>
            ) : null}
        </div>
    );
}

EmbeddedMapThemeConfig.propTypes = {
    color: string.isRequired,
    setColor: func.isRequired,
    font: string.isRequired,
    setFont: func.isRequired,
};

export default EmbeddedMapThemeConfig;
