import React from 'react';
import { Link } from 'react-router-dom';

import '../../styles/css/footer.scss';
import FooterCreativeCommons from './FooterCreativeCommons';
import FooterSocialMedia from './FooterSocialMedia';
import FooterLogo from './FooterLogo';
import FooterNav from './FooterNav';
import FooterShapes from './FooterShapes';
import FooterShapesMobile from './FooterShapesMobile';
import FooterText from './FooterText';

export default function Footer() {
    return (
        <footer className="footer" id="footer">
            <div className="footer__container">
                <Link to="/" className="footer__home">
                    <span className="visually-hidden" />
                    <FooterLogo />
                </Link>

                <div className="footer__grid">
                    <div className="footer__col footer__col--1">
                        <FooterText />
                    </div>
                    <div className="footer__col footer__col--2">
                        <FooterNav />
                    </div>
                    <div className="footer__col footer__col--3">
                        <FooterSocialMedia />
                    </div>
                    <div className="footer__col footer__col--4">
                        <FooterCreativeCommons />
                    </div>
                </div>
            </div>

            <div className="footer__shapes-container">
                <FooterShapesMobile />
                <FooterShapes />
            </div>
        </footer>
    );
}
