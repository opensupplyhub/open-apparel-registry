import React from 'react';

import AppOverflow from './AppOverflow';
import AppGrid from './AppGrid';

export default function NotAvailable(title) {
    return () => (
        <AppOverflow>
            <AppGrid title={title}>
                <p>This feature is not available.</p>
            </AppGrid>
        </AppOverflow>
    );
}
