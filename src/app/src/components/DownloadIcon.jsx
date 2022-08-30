import React from 'react';
import { string } from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

export default function DownloadIcon({ color }) {
    return (
        <SvgIcon viewBox="0 0 16 20" style={{ transform: 'scale(0.6)' }}>
            <path
                fill={color}
                d="M8 15.0002L12 11.0002L10.6 9.60024L9 11.1502V7.00024H7V11.1502L5.4 9.60024L4 11.0002L8 15.0002ZM2 20.0002C1.45 20.0002 0.979333 19.8046 0.588 19.4132C0.196 19.0212 0 18.5502 0 18.0002V6.00024L6 0.000244141H14C14.55 0.000244141 15.021 0.195911 15.413 0.587244C15.8043 0.979244 16 1.45024 16 2.00024V18.0002C16 18.5502 15.8043 19.0212 15.413 19.4132C15.021 19.8046 14.55 20.0002 14 20.0002H2ZM2 18.0002H14V2.00024H6.85L2 6.85024V18.0002Z"
            />
        </SvgIcon>
    );
}

DownloadIcon.defaultProps = {
    color: '#1C1B1F',
};

DownloadIcon.propTypes = {
    color: string,
};
