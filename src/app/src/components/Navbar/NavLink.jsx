import React from 'react';
import { Link } from 'react-router-dom';
import { useMenuClickHandlerContext } from './MenuClickHandlerContext';

export default function NavLink({ label, href, external, mobile = false }) {
    const createMenuClickHandler = useMenuClickHandlerContext();

    const className = mobile ? 'mobile-nav-link' : 'nav-link';

    if (external) {
        return (
            <a
                className={className}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={createMenuClickHandler()}
            >
                <span>{label}</span>
            </a>
        );
    }

    return (
        <Link
            to={href}
            className={className}
            onClick={createMenuClickHandler()}
        >
            <span>{label}</span>
        </Link>
    );
}
