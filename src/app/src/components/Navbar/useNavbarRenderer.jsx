import React from 'react';

import NavLink from './NavLink';
import NavButton from './NavButton';
import NavParent from './NavParent';
import AuthMenu from './AuthMenu';
import InternationalMenu from './InternationalMenu';

import MobileNavParent from './MobileNavParent';
import MobileAuthMenu from './MobileAuthMenu';
import MobileInternationalMenu from './MobileInternationalMenu';

export default function useNavbarRenderer({ activeSubmenu, setActiveSubmenu }) {
    const submenuProps = key => ({
        isActive: activeSubmenu === key,
        setActive: () => setActiveSubmenu(key),
        setInactive: () => setActiveSubmenu(null),
    });

    const renderSubmenu = (item, mobile) => {
        const Component = mobile ? MobileNavParent : NavParent;

        return (
            <Component
                label={item.label}
                columns={item.columns}
                {...submenuProps(item.label)}
            />
        );
    };

    const renderAuth = mobile => {
        const Component = mobile ? MobileAuthMenu : AuthMenu;

        return <Component {...submenuProps('auth')} />;
    };

    const renderInternational = mobile => {
        const Component = mobile ? MobileInternationalMenu : InternationalMenu;

        return <Component {...submenuProps('international')} />;
    };

    const renderNavItem = (item, mobile = false) => {
        switch (item.type) {
            case 'link':
                return (
                    <NavLink
                        label={item.label}
                        href={item.href}
                        mobile={mobile}
                        external={!item.internal}
                    />
                );
            case 'button':
                return (
                    <NavButton
                        label={item.label}
                        href={item.href}
                        external={!item.internal}
                    />
                );
            case 'submenu':
                return renderSubmenu(item, mobile);
            case 'auth':
                return renderAuth(mobile);
            case 'international':
                return renderInternational(mobile);
            default:
                throw new Error('Invalid navbar item type');
        }
    };

    const renderMobileNavItem = item => renderNavItem(item, true);

    const getMobileNavItemClass = (item, last = false) =>
        `mobile-nav__item${
            item.type === 'button' ? ' mobile-nav__item--button' : ''
        }${last ? ' mobile-nav__item--last' : ''}`;

    return {
        renderNavItem,
        renderMobileNavItem,
        getMobileNavItemClass,
    };
}
