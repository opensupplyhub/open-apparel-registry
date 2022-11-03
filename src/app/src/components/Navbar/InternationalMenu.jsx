import React from 'react';
import LanguageIcon from '@material-ui/icons/Language';

import { SubmenuButtonArrow } from './navIcons';

export default function InternationalMenu({
    isActive,
    setActive,
    setInactive,
}) {
    const toggleActive = isActive ? setInactive : setActive;

    return (
        <>
            <button
                type="button"
                className="nav-submenu-button nav-submenu-button--language "
                onClick={toggleActive}
            >
                <span className="visually-hidden">Language</span>
                <span>
                    <LanguageIcon
                        fontSize="large"
                        className="nav-submenu-button__international"
                    />
                </span>
                <SubmenuButtonArrow />
            </button>

            <div
                className="nav-submenu nav-submenu--right"
                style={isActive ? { maxHeight: '500px' } : {}}
            >
                <Submenu />
            </div>
        </>
    );
}

function Submenu() {
    return (
        <div className="nav-submenu__container">
            <div className="nav-submenu__grid">
                <a
                    className="nav-submenu__link nav-submenu__link--lighter-font-weight"
                    href="https://info.opensupplyhub.org/bangladesh"
                    target=""
                >
                    <span>বাংলা</span>
                </a>
                <a
                    className="nav-submenu__link nav-submenu__link"
                    href="https://info.opensupplyhub.org/india"
                    target=""
                >
                    <span>India</span>
                </a>
                <a
                    className="nav-submenu__link "
                    href="https://info.opensupplyhub.org/turkey"
                    target=""
                >
                    <span>Türkiye</span>
                </a>
                <a
                    className="nav-submenu__link "
                    href="https://info.opensupplyhub.org/vietnam"
                    target=""
                >
                    <span>Tiếng Việt</span>
                </a>
            </div>
        </div>
    );
}
