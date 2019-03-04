import React from 'react';
import { node } from 'prop-types';

export default function AppOverflow({
    children,
}) {
    return (
        <div style={{ height: '100%', overflow: 'auto' }}>
            {children}
        </div>
    );
}

AppOverflow.propTypes = {
    children: node.isRequired,
};
