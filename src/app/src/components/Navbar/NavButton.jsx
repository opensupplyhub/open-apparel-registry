import React from 'react';
import { Link } from 'react-router-dom';
import { useMenuClickHandlerContext } from './MenuClickHandlerContext';

export default function NavButton({ label, href, external }) {
    const createMenuClickHandler = useMenuClickHandlerContext();

    if (external) {
        return (
            <a
                className="button button--yellow"
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
            className="button button--yellow"
            onClick={createMenuClickHandler()}
        >
            <span>{label}</span>
        </Link>
    );
}
