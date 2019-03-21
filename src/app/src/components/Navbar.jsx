import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';

import logo from '../styles/images/OpenApparelRegistry_logo.png';
import NavbarDropdown from './NavbarDropdown';
import NavbarLoginButtonGroup from './NavbarLoginButtonGroup';

import { contributeRoute } from '../util/constants';

const apiDocumentationURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8081/api/docs/'
    : '/api/docs/';

export default function Navbar() {
    const aboutLinks = [
        {
            text: 'Team',
            url: 'https://info.openapparel.org/team',
            type: 'external',
        },
        {
            text: 'Board & Governance',
            url: 'https://info.openapparel.org/board',
            type: 'external',
        },
        {
            text: 'Processing',
            url: '/about/processing',
            type: 'link',
        },
    ];

    return (
        <AppBar position="static" className="App-header">
            <Toolbar style={{ padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'middle' }}>
                    <Link
                        to="/"
                        href="/"
                        style={{ display: 'inline-flex' }}
                    >
                        <img src={logo} className="App-logo" alt="logo" />
                    </Link>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginLeft: 'auto',
                    }}
                >
                    <Link
                        to="/"
                        href="/"
                        className="navButton"
                    >
                        HOME
                    </Link>
                    <NavbarDropdown title="ABOUT" links={aboutLinks} />
                    <a
                        target="_blank"
                        className="navButton"
                        rel="noopener noreferrer"
                        href="https://info.openapparel.org/faq/"
                    >
                        FAQs
                    </a>
                    <a
                        target="_blank"
                        className="navButton"
                        rel="noopener noreferrer"
                        href={apiDocumentationURL}
                    >
                        API
                    </a>
                    <Link
                        className="navButton"
                        to={contributeRoute}
                        href={contributeRoute}
                    >
                        CONTRIBUTE
                    </Link>
                </div>
                <div id="google_translate_element" />
                <NavbarLoginButtonGroup />
            </Toolbar>
        </AppBar>
    );
}
