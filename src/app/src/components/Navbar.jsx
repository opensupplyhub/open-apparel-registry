import React, { useState, useRef } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';

import { Link, Route } from 'react-router-dom';

import logo from '../styles/images/OpenApparelRegistry_logo.png';
import NavbarDropdown from './NavbarDropdown';
import NavbarLoginButtonGroup from './NavbarLoginButtonGroup';

import {
    contributeRoute,
    aboutClaimedFacilitiesRoute,
} from '../util/constants';

const apiDocumentationURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8081/api/docs/'
    : '/api/docs/';

export default function Navbar({ embed }) {
    const [drawerHandler, setDrawerHandler] = useState(false);
    const mobileMenuToggleRef = useRef();

    if (embed) {
        return <div id="google_translate_element" />;
    }

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
        {
            text: 'Claimed Facilities',
            url: aboutClaimedFacilitiesRoute,
            type: 'link',
        },
    ];

    const mainNavigation = (
        <>
            <div
                className="mainNavigation"
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
            <Route component={NavbarLoginButtonGroup} />
        </>
    );

    const mobileNavigation = (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    width: '250px',
                }}
            >
                <Link
                    to="/"
                    href="/"
                    className="navButton"
                    onClick={() => setDrawerHandler(false)}
                >
                    HOME
                </Link>
                <a
                    target="_blank"
                    className="navButton"
                    rel="noopener noreferrer"
                    href="https://info.openapparel.org/"
                    onClick={() => setDrawerHandler(false)}
                >
                    ABOUT
                </a>
                <a
                    target="_blank"
                    className="navButton"
                    rel="noopener noreferrer"
                    href="https://info.openapparel.org/faq/"
                    onClick={() => setDrawerHandler(false)}
                >
                    FAQs
                </a>
                <a
                    target="_blank"
                    className="navButton"
                    rel="noopener noreferrer"
                    href={apiDocumentationURL}
                    onClick={() => setDrawerHandler(false)}
                >
                    API
                </a>
                <Link
                    className="navButton"
                    to={contributeRoute}
                    href={contributeRoute}
                    onClick={() => setDrawerHandler(false)}
                >
                    CONTRIBUTE
                </Link>
                <Button style={{ marginTop: 'auto' }} onClick={() => setDrawerHandler(false)}>Close Menu</Button>
            </div>
        </>
    );

    const mobileMenu = (
        /* Im aware this is an absurd zindex,
        but the appbar has an absurd one as well
        and it'll be difficult to ensure any changes
        to the appbar won't have breaking effects */
        <Drawer anchor="right" open={drawerHandler} onClose={() => setDrawerHandler(false)} style={{ zIndex: 99999999 }} className="mobile-navigation-drawer">
            {mobileNavigation}
        </Drawer>
    );

    const mobileMenuToggle = (
        <div className="mobileMenuToggle">
            <Button
                className="btn-text navButton"
                disableRipple
                buttonRef={mobileMenuToggleRef}
                aria-haspopup="true"
                onClick={() => setDrawerHandler(true)}
            >
                MENU
            </Button>
        </div>
    );

    return (
        <>
            <AppBar position="static" className="App-header results-height-subtract">
                <Toolbar style={{ padding: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'middle', marginRight: 'auto' }}>
                        <Link
                            to="/"
                            href="/"
                            style={{ display: 'inline-flex' }}
                        >
                            <img src={logo} className="App-logo" alt="logo" />
                        </Link>
                    </div>
                    {mainNavigation}
                    {mobileMenuToggle}
                </Toolbar>
            </AppBar>
            {mobileMenu}
        </>
    );
}
