import React from 'react';

import { SocialMediaLinks } from '../../util/constants';

export default function FooterSocialMedia() {
    return (
        <div className="footer__follow">
            <h3 className="footer__heading">Follow Us</h3>

            <div className="footer__socials">
                {SocialMediaLinks.map(({ label, Icon, href }) => (
                    <a
                        key={label}
                        className="footer__link "
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <span className="visually-hidden">{label}</span>
                        <span className="footer__social">
                            <Icon />
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}
