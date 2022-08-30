import React from 'react';
import { string } from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

export default function FilterIcon({ color }) {
    return (
        <SvgIcon viewBox="0 0 18 18" style={{ transform: 'scale(0.6)' }}>
            <path
                fill={color}
                d="M8 18.0002V12.0002H10V14.0002H18V16.0002H10V18.0002H8ZM0 16.0002V14.0002H6V16.0002H0ZM4 12.0002V10.0002H0V8.00024H4V6.00024H6V12.0002H4ZM8 10.0002V8.00024H18V10.0002H8ZM12 6.00024V0.000244141H14V2.00024H18V4.00024H14V6.00024H12ZM0 4.00024V2.00024H10V4.00024H0Z"
            />
        </SvgIcon>
    );
}

FilterIcon.defaultProps = {
    color: '#1C1B1F',
};

FilterIcon.propTypes = {
    color: string,
};
