import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import logo from '../styles/images/Creative-Commons-Attribution-ShareAlike-40-International-Public.png';

import { setGDPROpen } from '../actions/ui';

const linkButtonStyle = {
    textDecoration: 'underline',
    textTransform: 'capitalize',
    minHeight: 'auto',
};

const links = [
    {
        href: 'https://www.azavea.com/',
        prefix: 'powered by ',
        text: 'Azavea',
        external: true,
        newTab: true,
    },
    {
        text: 'Cookie Preferences',
        button: true,
    },
    {
        href: 'https://info.openapparel.org/tos/',
        text: 'Terms of Service',
        external: true,
        newTab: true,
    },
    {
        href: 'https://info.openapparel.org/contactus/',
        text: 'Support',
        external: true,
        newTab: true,
    },
];

const Footer = ({ openGDPR }) => (
    <footer className="footerContainer results-height-subtract" xs={12}>
        <div className="links">
            {links.map(l => {
                if (l.external && 'prefix' in l) {
                    return (
                        <p className="link" key={l.text}>
                            {l.prefix}
                            <a
                                href={l.href}
                                target={l.newTab ? '_blank' : null}
                                rel="noopener noreferrer"
                            >
                                {l.text}
                            </a>
                        </p>
                    );
                }
                if (l.external) {
                    return (
                        <p className="link" key={l.text}>
                            <a
                                href={l.href}
                                target={l.newTab ? '_blank' : null}
                                rel="noopener noreferrer"
                            >
                                {l.text}
                            </a>
                        </p>
                    );
                }
                if (l.button) {
                    return (
                        <Button
                            className="link"
                            style={linkButtonStyle}
                            key={l.text}
                            onClick={openGDPR}
                        >
                            {l.text}
                        </Button>
                    );
                }
                return (
                    <Link to={l.href} href={l.href} key={l.text}>
                        {l.text}
                    </Link>
                );
            })}
        </div>
        <a
            href="https://creativecommons.org/licenses/by-sa/4.0/legalcode"
            target="_blank"
            rel="noopener noreferrer"
        >
            <img
                className="footer-image"
                src={logo}
                alt="Creative Commons Attribution"
            />
        </a>
    </footer>
);

function mapDispatchToProps(dispatch) {
    return {
        openGDPR: () => dispatch(setGDPROpen(true)),
    };
}

export default connect(null, mapDispatchToProps)(Footer);
