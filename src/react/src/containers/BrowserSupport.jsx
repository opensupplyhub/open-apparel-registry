import React from 'react';

const BrowserSupport = () => (
    <div
        style={{
            width: '550px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '200px',
            border: '1px solid grey',
            padding: '40px',
        }}
    >
        <h3>
            We&apos;re sorry but the Open Apparel Registry is not currently
            compatible with your browser.
        </h3>
        <p>
            Please install the latest versions of one of the browsers listed
            below. We appreciate your patience while we work to develop the best
            tool for our community.
        </p>
        <p>
            <a href="https://whatbrowser.org/" className="link">
                More about browsers
            </a>
        </p>
        <div className="display-flex justify-space-between">
            <div>
                <a
                    href="https://www.google.com/chrome/?hl=en"
                    aria-label="Download Google Chrome"
                >
                    <img
                        alt="Google Chrome"
                        src="https://ssl.gstatic.com/social/photosui/images/browsers/chrome.jpg"
                        className="square-img"
                    />
                    <p className="link text-center">Google Chrome</p>
                </a>
            </div>
            <div>
                <a
                    href="https://www.mozilla.com/firefox/"
                    aria-label="Download Firefox"
                >
                    <img
                        alt="Firefox"
                        src="https://ssl.gstatic.com/social/photosui/images/browsers/firefox.jpg"
                        className="square-img"
                    />
                    <p className="link text-center">Firefox</p>
                </a>
            </div>
            <div>
                <a
                    href="https://www.apple.com/safari/"
                    aria-label="Download Safari"
                >
                    <img
                        alt="Safari"
                        src="https://ssl.gstatic.com/social/photosui/images/browsers/safari.jpg"
                        className="square-img"
                    />
                    <p className="link text-center">Safari</p>
                </a>
            </div>
        </div>
    </div>
);

export default BrowserSupport;
