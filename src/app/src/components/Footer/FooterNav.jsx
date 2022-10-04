import React from 'react';
import { Link } from 'react-router-dom';

import { FooterLinks } from '../../util/constants';

export default function FooterNav() {
    return (
        <nav className="footer__nav">
            {FooterLinks.map(({ label, href, internal }) =>
                internal ? (
                    <Link key={label} to={href} className="footer__link">
                        {label}
                    </Link>
                ) : (
                    <a
                        key={label}
                        className="footer__link"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {label}
                    </a>
                ),
            )}
        </nav>
    );
}
