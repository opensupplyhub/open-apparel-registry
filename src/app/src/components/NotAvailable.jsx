import React from 'react';

import AppOverflow from './AppOverflow';
import AppGrid from './AppGrid';

export default function NotAvailable() {
    return (
        <AppOverflow>
            <AppGrid title="Register">
                <p>This feature is not available.</p>
            </AppGrid>
        </AppOverflow>
    );
}
