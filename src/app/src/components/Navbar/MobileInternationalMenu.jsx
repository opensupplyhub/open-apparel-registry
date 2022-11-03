import React from 'react';

import LanguageIcon from '@material-ui/icons/Language';

import {
    MobileSubmenuButtonArrowLeft,
    MobileSubmenuButtonArrowRight,
} from './navIcons';

export default function MobileInternationalMenu({
    isActive,
    setActive,
    setInactive,
}) {
    const toggleActive = isActive ? setInactive : setActive;

    return (
        <>
            <button
                type="button"
                className="mobile-nav-submenu-button mobile-nav-submenu-button--language"
                onClick={toggleActive}
            >
                <div className="mobile-nav-submenu-button__international-container">
                    <LanguageIcon
                        fontSize="large"
                        className="nav-submenu-button__international"
                    />
                </div>
                <MobileSubmenuButtonArrowRight />
            </button>

            <div
                className="mobile-nav-submenu"
                style={
                    isActive
                        ? { width: '100%', height: 'auto', left: '100%' }
                        : {}
                }
            >
                <button
                    type="button"
                    className="mobile-nav-back-button"
                    onClick={setInactive}
                >
                    <MobileSubmenuButtonArrowLeft />
                    <span>Back</span>
                </button>

                <div className="mobile-nav__item">
                    <a
                        className="mobile-nav-link mobile-nav-link--lighter-font-weight"
                        href="https://info.opensupplyhub.org/bangladesh"
                        target=""
                    >
                        বাংলা
                    </a>
                </div>
                <div className="mobile-nav__item">
                    <a
                        className="mobile-nav-link mobile-nav-link--lighter-font-weight"
                        href="https://info.opensupplyhub.org/india"
                        target=""
                    >
                        India
                    </a>
                </div>
                <div className="mobile-nav__item">
                    <a
                        className="mobile-nav-link "
                        href="https://info.opensupplyhub.org/turkey"
                        target=""
                    >
                        Türkiye
                    </a>
                </div>
                <div className="mobile-nav__item">
                    <a
                        className="mobile-nav-link "
                        href="https://info.opensupplyhub.org/vietnam"
                        target=""
                    >
                        Tiếng Việt
                    </a>
                </div>
            </div>
        </>
    );
}
