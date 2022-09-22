import React from 'react';
import { Link } from 'react-router-dom';

export default function NavButton({ label, href, external }) {
    if (external) {
        return (
            <a
                className="button button--yellow"
                href={href}
                target="_blank"
                rel="noreferrer"
            >
                <span>{label}</span>
            </a>
        );
    }

    return (
        <Link to={href} className="button button--yellow">
            <span>{label}</span>
        </Link>
    );
}
