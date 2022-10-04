import React, { useEffect, useState } from 'react';

import useNavbarRenderer from './useNavbarRenderer';
import '../../styles/css/header.scss';
import { MobileNavbarItems, NavbarItems } from '../../util/constants';
import Logo from './Logo';
import BurgerButton from './BurgerButton';
import GoogleTranslateBar from './GoogleTranslateBar';
import MenuClickHandlerContext from './MenuClickHandlerContext';

const breakpoint = '(max-width: 75rem)';

export default function Navbar() {
    const [mobileMode, setMobileMode] = useState(
        window.matchMedia(breakpoint).matches,
    );

    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const handleMediaChange = e => setMobileMode(e.matches);
        const mediaQueryList = window.matchMedia(breakpoint);

        mediaQueryList.addEventListener('change', handleMediaChange);

        return () => {
            mediaQueryList.removeEventListener('change', handleMediaChange);
        };
    }, []);

    const [activeSubmenu, setActiveSubmenu] = useState(null);

    useEffect(() => {
        if (mobileMode) {
            // Don't automatically open submenu on entering mobile mode
            // because the mobile menu is not automatically open
            setActiveSubmenu(null);
        } else {
            // Reset mobile menu on entering desktop mode,
            // but preserve active submenu
            setShowMobileMenu(false);
        }
    }, [mobileMode]);

    const {
        renderNavItem,
        renderMobileNavItem,
        getMobileNavItemClass,
    } = useNavbarRenderer({
        activeSubmenu,
        setActiveSubmenu,
    });

    const headerClassName = `header header-height-contributor ${
        mobileMode ? ' mobile-nav-is-active' : ''
    }`;

    const Header = (
        <header className={headerClassName} id="header">
            <div className="header__main">
                <Logo />
                <nav className="nav" id="nav" role="navigation">
                    {NavbarItems.map(item => {
                        const key = item.label ?? item.type;
                        return (
                            <div
                                key={key}
                                className={`nav-item${
                                    activeSubmenu === key
                                        ? ' nav-submenu-is-active'
                                        : ''
                                }`}
                            >
                                {renderNavItem(item)}
                            </div>
                        );
                    })}
                </nav>

                {showMobileMenu ? (
                    <nav
                        className="mobile-nav"
                        id="mobile-nav"
                        role="navigation"
                        style={!activeSubmenu ? { opacity: 1, left: '0%' } : {}}
                    >
                        <div className="mobile-nav__main">
                            {MobileNavbarItems.map((item, index) => (
                                <div
                                    key={item.label || item.type}
                                    className={getMobileNavItemClass(
                                        item,
                                        index === MobileNavbarItems.length - 1,
                                    )}
                                >
                                    {renderMobileNavItem(item)}
                                </div>
                            ))}
                        </div>
                    </nav>
                ) : null}

                <BurgerButton
                    showMobileMenu={showMobileMenu}
                    toggleMobileMenu={() => setShowMobileMenu(open => !open)}
                />
            </div>
        </header>
    );

    const createMenuClickHandler = (callback = () => {}) => () => {
        setActiveSubmenu(null);
        setShowMobileMenu(false);
        callback();
    };

    return (
        <>
            <GoogleTranslateBar />
            <MenuClickHandlerContext.Provider value={createMenuClickHandler}>
                {Header}
            </MenuClickHandlerContext.Provider>
        </>
    );
}
