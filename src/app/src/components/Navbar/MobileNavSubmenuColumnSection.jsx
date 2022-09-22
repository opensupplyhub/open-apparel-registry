import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { MobileSubmenuButtonArrowDown } from './navIcons';

export default function MobileNavSubmenuColumnSection({
    columnSection,
    startOpen,
}) {
    const [open, setOpen] = useState(startOpen);

    return (
        <div
            className={`mobile-nav-submenu__group ${
                startOpen ? 'mobile-nav-submenu-group-active' : ''
            }`}
        >
            <button
                className="mobile-nav-submenu-button"
                type="button"
                onClick={() => setOpen(currentValue => !currentValue)}
            >
                <span>{columnSection.label}</span>
                <MobileSubmenuButtonArrowDown />
            </button>

            <ul
                className="mobile-nav-submenu__list"
                style={open ? { height: 'auto' } : {}}
            >
                {columnSection.items.map(sectionItem => (
                    <SubmenuColumnSectionItem
                        key={sectionItem.label}
                        sectionItem={sectionItem}
                    />
                ))}
            </ul>
        </div>
    );
}

function SubmenuColumnSectionItem({ sectionItem, last }) {
    const lastClassName = 'mobile-nav__item--last';

    return (
        <li className={`mobile-nav__item ${last ? lastClassName : ''}`}>
            {sectionItem.internal && sectionItem.href ? (
                <Link className="mobile-nav-link" to={sectionItem.href}>
                    {sectionItem.label}
                </Link>
            ) : (
                <a
                    className="mobile-nav-link"
                    href={sectionItem.href}
                    target=""
                    onClick={sectionItem.action}
                >
                    {sectionItem.label}
                </a>
            )}
        </li>
    );
}
