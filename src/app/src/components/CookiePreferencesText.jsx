import React from 'react';
import { InfoLink, InfoPaths } from '../util/constants';

const CookiePreferencesText = () => (
    <div>
        The Open Supply Hub uses cookies to collect and analyze site performance
        and usage. By clicking the Accept button, you agree to allow us to place
        cookies and share information with Google Analytics. For more
        information, please visit our{' '}
        <a
            href={`${InfoLink}/${InfoPaths.termsOfService}`}
            target="_blank"
            rel="noreferrer"
        >
            Terms of Service
        </a>{' '}
        and{' '}
        <a
            href={`${InfoLink}/${InfoPaths.privacyPolicy}`}
            target="_blank"
            rel="noreferrer"
        >
            Privacy Policy
        </a>
        .
    </div>
);

export default CookiePreferencesText;
