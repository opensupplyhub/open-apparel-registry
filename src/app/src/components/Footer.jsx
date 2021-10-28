import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import logo from '../styles/images/Creative-Commons-Attribution-ShareAlike-40-International-Public.png';

import { setGDPROpen } from '../actions/ui';
import { InfoLink } from '../util/constants';

const linkButtonStyle = {
    minHeight: 'auto',
    color: 'white',
    padding: 0,
    fontSize: 'inherit',
    margin: '0 1rem 0 0',
    verticalAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 700,
};

const links = [
    {
        href: 'https://www.azavea.com/',
        prefix: 'Built by ',
        text: 'Azavea',
        external: true,
        newTab: true,
    },
    {
        text: 'Cookie Preferences',
        button: true,
    },
    {
        href: `${InfoLink}/contact`,
        text: 'Contact us',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/work-with-us`,
        text: 'Work with us',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/faqs`,
        text: 'FAQs',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/privacy-policy`,
        text: 'Privacy policy',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/terms-of-use`,
        text: 'Terms of use',
        external: true,
        newTab: true,
    },
];

const Footer = ({ openGDPR }) => (
    <footer className="results-height-subtract" xs={12}>
        <div className="simple-footer">
            {links.map(l => {
                if (l.external && 'prefix' in l) {
                    return (
                        <span
                            className="simple-footer__link"
                            key={l.text}
                            style={{
                                fontSize: '0.875rem',
                                letterSpacing: 0,
                                fontWeight: 500,
                                lineHeight: 1.4,
                            }}
                        >
                            {l.prefix}
                            <a
                                href={l.href}
                                target={l.newTab ? '_blank' : null}
                                rel="noopener noreferrer"
                            >
                                {l.text}
                            </a>
                        </span>
                    );
                }
                if (l.external) {
                    return (
                        <a
                            className="simple-footer__link"
                            href={l.href}
                            target={l.newTab ? '_blank' : null}
                            rel="noopener noreferrer"
                            key={l.text}
                            style={{ textTransform: 'uppercase' }}
                        >
                            {l.text}
                        </a>
                    );
                }
                if (l.button) {
                    return (
                        <button
                            type="button"
                            className="simple-footer__link"
                            style={linkButtonStyle}
                            key={l.text}
                            onClick={openGDPR}
                        >
                            {l.text}
                        </button>
                    );
                }
                return (
                    <Link
                        className="simple-footer__link"
                        to={l.href}
                        href={l.href}
                        key={l.text}
                        style={{ textTransform: 'uppercase' }}
                    >
                        {l.text}
                    </Link>
                );
            })}
            <a
                href="https://creativecommons.org/licenses/by-sa/4.0/legalcode"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span className="visually-hidden">Creative Commons</span>
                <img
                    className="simple-footer__cc"
                    src={logo}
                    alt="Creative Commons Attribution"
                />
            </a>
        </div>
    </footer>
);

function mapDispatchToProps(dispatch) {
    return {
        openGDPR: () => dispatch(setGDPROpen(true)),
    };
}

export default connect(null, mapDispatchToProps)(Footer);
