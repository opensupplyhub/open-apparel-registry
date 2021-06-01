import React from 'react';
import logo from '../styles/images/OAR_PoweredBy_white.svg';

const EmbeddedFooter = () => (
    <footer className="footerContainerEmbedded results-height-subtract" xs={12}>
        <a
            href="https://info.openapparel.org/"
            target="_blank"
            rel="noopener noreferrer"
        >
            <img
                className="footer-image"
                src={logo}
                alt="Powered by Open Apparel Registry"
            />
        </a>
    </footer>
);

export default EmbeddedFooter;
