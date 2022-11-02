import React from 'react';
import logo from '../styles/images/OSH_PoweredBy.png';
import { InfoLink } from '../util/constants';

const EmbeddedFooter = () => (
    <footer
        className="footerContainerEmbedde footer-height-contributor"
        xs={12}
        style={{ position: 'absolute', bottom: 0 }}
    >
        <a href={`${InfoLink}`} target="_blank" rel="noopener noreferrer">
            <img
                className="footer-image"
                src={logo}
                alt="Powered by Open Supply Hub"
                width="150"
                style={{ margin: '8px 24px' }}
            />
        </a>
    </footer>
);

export default EmbeddedFooter;
