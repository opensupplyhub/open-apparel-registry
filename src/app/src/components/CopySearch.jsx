import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { getLocationWithoutEmbedParam } from '../util/util';

const CopySearch = ({ children }) => (
    <CopyToClipboard
        text={getLocationWithoutEmbedParam()}
        onCopy={() => toast('Copied search to clipboard')}
    >
        {children}
    </CopyToClipboard>
);

export default CopySearch;
