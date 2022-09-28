import React, { useState } from 'react';
import { connect } from 'react-redux';

import Logo from './Navbar/Logo';
import NavParent from './Navbar/NavParent';
import AuthMenu from './Navbar/AuthMenu';
import MobileAuthMenu from './Navbar/MobileAuthMenu';
import GoogleTranslateButton from './Navbar/GoogleTranslateButton';
import MainMobileNav from './Navbar/MainMobileNav';
import ReadOnlyBanner from './ReadOnlyBanner';

import '../styles/css/header.css';

import { InfoLink, InfoPaths } from '../util/constants';

function Navbar() {
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const [mobileNavActive, setMobileNavActive] = useState(null);

    const Header = (
        <header
            className={`app-header results-height-subtract ${
                mobileNavActive && 'mobile-nav-is-active'
            }`}
            id="app-header"
        >
            <Logo />
            <nav className="app-header-nav" id="nav" role="navigation">
                <NavParent
                    title="How It Works"
                    activeSubmenu={activeSubmenu}
                    setActiveSubmenu={setActiveSubmenu}
                />
                <NavParent
                    title="About Us"
                    activeSubmenu={activeSubmenu}
                    setActiveSubmenu={setActiveSubmenu}
                />
                <a
                    className="nav__link nav__link--level-1"
                    href={`${InfoLink}/${InfoPaths.storiesResources}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    Stories + Resources
                </a>
                <AuthMenu
                    activeSubmenu={activeSubmenu}
                    setActiveSubmenu={setActiveSubmenu}
                />
                <GoogleTranslateButton />
            </nav>
            <div className="mobile-toggles">
                <MobileAuthMenu
                    mobileNavActive={mobileNavActive}
                    setMobileNavActive={setMobileNavActive}
                />
                <MainMobileNav
                    mobileNavActive={mobileNavActive}
                    setMobileNavActive={setMobileNavActive}
                    activeSubmenu={activeSubmenu}
                    setActiveSubmenu={setActiveSubmenu}
                />
            </div>
        </header>
    );

    return (
        <>
            <ReadOnlyBanner />
            {Header}
        </>
    );
}

export default connect(null)(Navbar);
