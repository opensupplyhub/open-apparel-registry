import React from 'react';

import '../../styles/css/navbarQ42022Banner.css';

const expirationTime = new Date('Jan 31 2023 00:00:00 GMT-0000').getTime();

export default function NavbarQ42022Banner() {
    const isExpired = new Date().getTime() > expirationTime;
    return isExpired ? null : (
        <div
            style={{
                fontFamily: 'Darker Grotesque',
                width: '100%',
                backgroundColor: 'black',
                color: '#FCCF3F',
                textAlign: 'center',
            }}
        >
            <div style={{ padding: '0.5em 0.5em 0 0.5em' }}>
                We’re fundraising! Help us maintain OS Hub as a free platform,
                accessible to all, by{' '}
                <a
                    className="banner-link"
                    href="https://givebutter.com/opensupplyhub2022"
                >
                    donating to our campaign
                </a>
                .
            </div>
        </div>
    );
}
