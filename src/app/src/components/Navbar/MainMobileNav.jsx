import React from 'react';

import MobileNavParent from './MobileNavParent';
import BurgerButton from './BurgerButton';
import MobileContributeButton from './MobileContributeButton';

import { MOBILE_HEADER_HEIGHT, InfoLink } from '../../util/constants';

const styles = {
    mobileNavActive: {
        left: 0,
        width: '100%',
        top: MOBILE_HEADER_HEIGHT,
        opacity: 1,
    },
    mobileNavInactive: { left: '100%', opacity: 0 },
};

function MainMobileNav({
    mobileNavActive,
    setMobileNavActive,
    activeSubmenu,
    setActiveSubmenu,
}) {
    const title = 'main';
    const isActive = mobileNavActive === title;
    const handleClose = () => setMobileNavActive(null);
    const toggleNav = () =>
        mobileNavActive ? handleClose() : setMobileNavActive(title);
    return (
        <>
            <BurgerButton activeNav={mobileNavActive} setActive={toggleNav} />
            <nav
                className="mobile-nav"
                id="mobile-nav"
                role="navigation"
                style={
                    isActive ? styles.mobileNavActive : styles.mobileNavInactive
                }
            >
                <MobileNavParent
                    title="How It Works"
                    activeSubmenu={activeSubmenu}
                    setActiveSubmenu={setActiveSubmenu}
                    onClose={handleClose}
                />
                <MobileNavParent
                    title="About Us"
                    activeSubmenu={activeSubmenu}
                    setActiveSubmenu={setActiveSubmenu}
                    onClose={handleClose}
                />
                <div className="mobile-nav__item">
                    <a
                        className="mobile-nav__link"
                        href={`${InfoLink}/resources`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleClose}
                    >
                        <span>Stories + Resources</span>
                    </a>
                </div>
                <MobileNavParent
                    title="More"
                    activeSubmenu={activeSubmenu}
                    setActiveSubmenu={setActiveSubmenu}
                    onClose={handleClose}
                />
                <MobileContributeButton onClose={handleClose} />
            </nav>
        </>
    );
}

export default MainMobileNav;
