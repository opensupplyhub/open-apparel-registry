import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import '../../styles/css/googleTranslate.css';

const arrowStyles = {
    position: 'relative',
    width: '.8rem',
    marginLeft: '1rem',
    transition: 'transform 0.1s linear',

    '&::before': {
        display: 'block',
        content: '',
        width: '100%',
        height: 0,
        paddingBottom: '80%',
    },
};

const svgStyles = {
    display: 'block',
    position: 'relative',
    top: 2,
    left: 0,
    width: '100%',
    height: '100%',
    color: 'white',
};

export default function GoogleTranslateBar() {
    return (
        <div
            style={{
                width: '100%',
                backgroundColor: 'black',
            }}
        >
            <div
                id="google_translate_element"
                style={{
                    position: 'fixed',
                    opacity: 0,
                    zIndex: 4,
                    right: 0,
                }}
            />
            <Grid
                container
                style={{ paddingBottom: '.5rem' }}
                justify="flex-end"
            >
                <Grid item>
                    <Button
                        type="button"
                        className="google-translate-language-display"
                        style={{ position: 'relative' }}
                    >
                        <span
                            className="skiptranslate"
                            id="google-translate-language-display"
                            style={{ color: 'white', fontSize: '1.5rem' }}
                        >
                            EN
                        </span>
                        <div style={arrowStyles}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 10 8"
                                style={svgStyles}
                            >
                                <path
                                    d="M8.12 0L4.97 4.988 1.87 0H0l4.958 8L10 0z"
                                    fill="white"
                                    fillRule="evenodd"
                                />
                            </svg>
                        </div>
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
}
