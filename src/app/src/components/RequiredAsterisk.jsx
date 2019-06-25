import React, { memo } from 'react';

const RequiredAsterisk = memo(() => (
    <span style={{ color: 'red' }}>
        {' *'}
    </span>
));

export default RequiredAsterisk;
