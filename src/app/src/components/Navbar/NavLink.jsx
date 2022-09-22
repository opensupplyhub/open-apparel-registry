import React from 'react';
import { Link } from 'react-router-dom';

export default function NavLink({ label, href, external, mobile = false }) {
    const className = mobile ? 'mobile-nav-link' : 'nav-link';

    if (external) {
        return (
            <a
                className={className}
                href={href}
                target="_blank"
                rel="noreferrer"
            >
                <span>{label}</span>
            </a>
        );
    }

    return (
        <Link to={href} className={className}>
            <span>{label}</span>
        </Link>
    );
}
