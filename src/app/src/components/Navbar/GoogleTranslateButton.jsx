import React from 'react';
import Button from '@material-ui/core/Button';

import COLOURS from '../../util/COLOURS';

export default () => (
    <div
        style={{ position: 'relative' }}
        className="google-translate-container"
    >
        <div
            id="google_translate_element"
            style={{
                position: 'relative',
                opacity: 0,
                zIndex: 4,
                right: 0,
            }}
        />
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 3,
                display: 'flex',
                height: '100%',
                alignItems: 'center',
            }}
        >
            <Button
                type="button"
                className="nav__parent-button app-header-button google-translate-language-display"
                style={{
                    backgroundColor: 'white',
                    color: COLOURS.NEAR_BLACK,
                }}
            >
                <span
                    className="skiptranslate"
                    id="google-translate-language-display"
                >
                    EN
                </span>
                <div className="nav__arrow-down">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
                        <path
                            d="M8.12 0L4.97 4.988 1.87 0H0l4.958 8L10 0z"
                            fill={COLOURS.NEAR_BLACK}
                            fillRule="evenodd"
                        />
                    </svg>
                </div>
            </Button>
        </div>
    </div>
);
