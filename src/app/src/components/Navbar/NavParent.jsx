import React from 'react';

import { SubmenuButtonArrow } from './navIcons';
import NavSubmenu from './NavSubmenu';

export default function NavParent({
    label,
    columns,
    isActive,
    setActive,
    setInactive,
}) {
    const toggleActive = isActive ? setInactive : setActive;

    return (
        <>
            <button
                type="button"
                className="nav-submenu-button"
                onClick={toggleActive}
            >
                <span className="nav-submenu-button__text">{label}</span>
                <SubmenuButtonArrow />
            </button>

            <NavSubmenu open={isActive} columns={columns} />
        </>
    );
}
