import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { getLocationWithoutEmbedParam } from '../util/util';

const CopySearch = ({ children, toastText = 'Copied search to clipboard' }) => (
    <CopyToClipboard
        text={getLocationWithoutEmbedParam()}
        onCopy={() => toast(toastText)}
    >
        {children}
    </CopyToClipboard>
);

export default CopySearch;
