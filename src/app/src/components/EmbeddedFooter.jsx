import React from 'react';
import logo from '../styles/images/OAR_PoweredBy_white.svg';
import { InfoLink } from '../util/constants';

const EmbeddedFooter = () => (
    <footer
        className="footerContainerEmbedded results-height-subtract"
        xs={12}
        style={{ position: 'absolute', bottom: 0 }}
    >
        <a href={`${InfoLink}`} target="_blank" rel="noopener noreferrer">
            <img
                className="footer-image"
                src={logo}
                alt="Powered by Open Supply Hub"
                width="150"
                style={{ margin: '8px' }}
            />
        </a>
    </footer>
);

export default EmbeddedFooter;
