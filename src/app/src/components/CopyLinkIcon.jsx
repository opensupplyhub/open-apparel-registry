import React from 'react';
import { string } from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

export default function CopyLinkIcon({ color }) {
    return (
        <SvgIcon viewBox="0 0 17 20" style={{ transform: 'scale(0.6)' }}>
            <path
                fill={color}
                d="M2 20.0002C1.45 20.0002 0.979 19.8046 0.587 19.4132C0.195667 19.0212 0 18.5502 0 18.0002V4.00024H2V18.0002H13V20.0002H2ZM6 16.0002C5.45 16.0002 4.97933 15.8046 4.588 15.4132C4.196 15.0212 4 14.5502 4 14.0002V2.00024C4 1.45024 4.196 0.979244 4.588 0.587244C4.97933 0.195911 5.45 0.000244141 6 0.000244141H15C15.55 0.000244141 16.021 0.195911 16.413 0.587244C16.8043 0.979244 17 1.45024 17 2.00024V14.0002C17 14.5502 16.8043 15.0212 16.413 15.4132C16.021 15.8046 15.55 16.0002 15 16.0002H6ZM6 14.0002H15V2.00024H6V14.0002Z"
            />
        </SvgIcon>
    );
}

CopyLinkIcon.defaultProps = {
    color: '#1C1B1F',
};

CopyLinkIcon.propTypes = {
    color: string,
};
