import React from 'react';
import logo from '../styles/images/OAR_PoweredBy_white.svg';

const EmbeddedFooter = () => (
    <footer className="footerContainerEmbedded results-height-subtract" xs={12}>
        <img
            className="footer-image"
            src={logo}
            alt="Powered by Open Apparel Registry"
        />
    </footer>
);

export default EmbeddedFooter;
