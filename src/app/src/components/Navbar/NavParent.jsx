import React from 'react';

import { SubmenuLinks, InfoLink } from '../../util/constants';

const NavParent = ({ title, activeSubmenu, setActiveSubmenu }) => {
    const isActive = activeSubmenu === title;
    const toggleSubmenu = () =>
        isActive ? setActiveSubmenu(null) : setActiveSubmenu(title);

    const navSubmenuStyle = isActive
        ? { height: 'auto', opacity: 1 }
        : { height: 0, opacity: 0 };

    return (
        <div className={`nav__parent ${isActive && 'nav-submenu-is-active'}`}>
            <button
                type="button"
                className="nav__parent-button"
                onClick={toggleSubmenu}
            >
                <span>{title}</span>
                <div className="nav__arrow-down">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">
                        <path
                            d="M8.12 0L4.97 4.988 1.87 0H0l4.958 8L10 0z"
                            fill="#0D1128"
                            fillRule="evenodd"
                        />
                    </svg>
                </div>
            </button>
            <div className="nav__submenu" style={navSubmenuStyle}>
                {SubmenuLinks[title].map(({ text, url }) => (
                    <a
                        className="nav__link nav__link--level-2"
                        href={`${InfoLink}/${url}`}
                        key={url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setActiveSubmenu(null)}
                    >
                        {text}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default NavParent;
